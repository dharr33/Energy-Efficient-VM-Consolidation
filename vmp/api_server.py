import importlib.util
import sys
import os
import joblib
import pandas as pd
import psutil
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
import random

def import_from_path(module_name, file_path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module

base_dir = os.path.dirname(os.path.abspath(__file__))
simulate = import_from_path("simulate", os.path.join(base_dir, "simulate.py"))
scoring = import_from_path("scoring", os.path.join(base_dir, "scoring.py"))

generate_hosts = simulate.generate_hosts
generate_vms = simulate.generate_vms

def score_hosts(hosts_df, vm, weights):
    best_score = float('inf')
    best_host_idx = None

    for idx in hosts_df.index:
        host = hosts_df.loc[idx]
        if host["cpu_capacity"] < vm["cpu_demand"] or host["ram_capacity"] < vm["ram_demand"]:
            continue

        cpu_score = vm["cpu_demand"] / host["cpu_capacity"]
        energy_score = host["energy"]
        cost_score = host["cost"]
        total_score = weights["cpu"] * cpu_score + weights["energy"] * energy_score + weights["cost"] * cost_score

        if total_score < best_score:
            best_score = total_score
            best_host_idx = idx

    if best_host_idx is not None:
        hosts_df.loc[best_host_idx, "cpu_capacity"] -= vm["cpu_demand"]
        hosts_df.loc[best_host_idx, "ram_capacity"] -= vm["ram_demand"]
        return hosts_df.loc[best_host_idx, "host_id"]
    else:
        return "No suitable host"

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

def generate_hosts(n=5):
    hosts = {
        "host_id": [f"H{i+1}" for i in range(n)],
        "cpu_capacity": [random.randint(50, 120) for _ in range(n)],
        "ram_capacity": [random.randint(64, 128) for _ in range(n)],
        "energy": [round(random.uniform(0.3, 1.5), 4) for _ in range(n)],
        "cost": [round(random.uniform(0.2, 0.8), 4) for _ in range(n)],
    }
    return pd.DataFrame(hosts)

def generate_vms(n=3):
    vms = {
        "vm_id": [f"VM{i+1}" for i in range(n)],
        "cpu_demand": [random.randint(4, 20) for _ in range(n)],
        "ram_demand": [random.randint(8, 32) for _ in range(n)],
    }
    return pd.DataFrame(vms)

MODEL_PATH = os.path.join(base_dir, "rfinal_vm_host_placement_model.pkl")
SCALER_PATH = os.path.join(base_dir, "vm_feature_scaler.pkl")
ENCODER_PATHS = [
    os.path.join(base_dir, "label_encoder_vm.pkl"),
    os.path.join(base_dir, "finalmodel", "label_encoder_vm.pkl"),
]

model, scaler, le_vm = None, None, None

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    print(f"Failed to load model: {e}")
try:
    scaler = joblib.load(SCALER_PATH)
except Exception as e:
    print(f"Failed to load scaler: {e}")
for path in ENCODER_PATHS:
    if le_vm:
        break
    try:
        le_vm = joblib.load(path)
    except Exception:
        pass

def get_system_metrics():
    cpu = psutil.cpu_percent(interval=None)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    net_io = psutil.net_io_counters()
    net_sent = round(net_io.bytes_sent / 1024 / 1024, 2)
    net_recv = round(net_io.bytes_recv / 1024 / 1024, 2)
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    return {
        "time": timestamp,
        "cpu": cpu,
        "memory": memory,
        "disk": disk,
        "network_sent": net_sent,
        "network_recv": net_recv
    }

@app.route("/api/v1/health", methods=["GET"])
def health():
    ok = all([model is not None, scaler is not None, le_vm is not None])
    metrics = get_system_metrics()
    status = "Healthy ✅"
    if metrics["cpu"] > 85 or metrics["memory"] > 85:
        status = "Warning ⚠"
    if metrics["cpu"] > 95 or metrics["memory"] > 95:
        status = "Critical 🔴"

    return jsonify({
        "ok": ok,
        "status": status,
        "model": os.path.basename(MODEL_PATH) if MODEL_PATH else None,
        "scaler": os.path.basename(SCALER_PATH) if SCALER_PATH else None,
        "encoder": os.path.basename(ENCODER_PATHS[0]) if le_vm else None,
        "metrics": metrics
    }), (200 if ok else 500)

@app.route("/api/v1/vms", methods=["GET"])
def get_vms():
    if le_vm is None:
        return jsonify({"error": "Encoder not loaded"}), 500
    classes = [str(c) for c in getattr(le_vm, "classes_", [])]
    return jsonify({"vms": classes}), 200

@app.route("/api/v1/predict", methods=["POST"])
def predict():
    if any(x is None for x in [model, scaler, le_vm]):
        return jsonify({"error": "Model assets not loaded"}), 500

    payload = request.get_json(silent=True) or {}
    try:
        vm_name = str(payload.get("vm"))
        cpu = float(payload.get("cpu"))
        memory = float(payload.get("memory"))
        network_io = float(payload.get("network_io"))
        power = float(payload.get("power"))
    except Exception:
        return jsonify({"error": "Invalid or missing fields: vm, cpu, memory, network_io, power"}), 400

    weights = payload.get("weights") or {"cost": 0.34, "energy": 0.33, "load": 0.33}
    w_cost = float(weights.get("cost", 0.34))
    w_energy = float(weights.get("energy", 0.33))
    w_load = float(weights.get("load", 0.33))

    try:
        vm_encoded = le_vm.transform([vm_name])[0]
    except Exception:
        return jsonify({"error": f"VM '{vm_name}' not recognized. Query /api/v1/vms for options."}), 400

    df_input = pd.DataFrame({
        "vm": [vm_encoded],
        "cpu": [cpu],
        "memory": [memory],
        "network_io": [network_io],
        "power": [power],
        "cpu_mem_ratio": [cpu / memory if memory != 0 else 0.0],
        "power_per_cpu": [power / cpu if cpu != 0 else 0.0],
    })

    try:
        X_new_scaled = scaler.transform(df_input)
        pred_host = model.predict(X_new_scaled)
        host = str(pred_host[0])
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {exc}"}), 500

    proxy_cost = round(power * 0.12 + cpu * 0.05 + max(0.0, network_io - 1.0) * 0.5, 2)
    proxy_energy = round(power * 0.9 + cpu * 0.2, 2)
    proxy_load_balance = round(100 - min(100, abs(cpu - (memory if memory <= 100 else 100))), 2)

    norm_cost = min(1.0, proxy_cost / 200.0)
    norm_energy = min(1.0, proxy_energy / 300.0)
    norm_load = 1.0 - min(1.0, proxy_load_balance / 100.0)
    weighted_score = round(w_cost * norm_cost + w_energy * norm_energy + w_load * norm_load, 3)

    response = {
        "host": host,
        "objectives": {
            "cost": proxy_cost,
            "energy": proxy_energy,
            "loadBalance": proxy_load_balance,
            "weightedScore": weighted_score,
            "weights": {"cost": w_cost, "energy": w_energy, "load": w_load}
        },
        "inputEcho": {
            "vm": vm_name,
            "cpu": cpu,
            "memory": memory,
            "network_io": network_io,
            "power": power
        }
    }
    return jsonify(response), 200

@app.route("/api/v1/metrics", methods=["GET"])
def metrics():
    return jsonify(get_system_metrics()), 200

@app.route("/api/v1/hosts", methods=["GET"])
def hosts():
    return jsonify(generate_hosts(5).to_dict(orient="records"))

@app.route("/api/v1/incoming_vms", methods=["GET"])
def incoming_vms():
    return jsonify(generate_vms(3).to_dict(orient="records"))

@app.route("/api/v1/placement_results", methods=["GET"])
def placement_results():
    cpu_weight = float(request.args.get("cpu", 0.4))
    energy_weight = float(request.args.get("energy", 0.3))
    cost_weight = float(request.args.get("cost", 0.3))
    weights = {"cpu": cpu_weight, "energy": energy_weight, "cost": cost_weight}

    hosts_df = generate_hosts(5)
    vms_df = generate_vms(3)
    placements = []
    for _, vm in vms_df.iterrows():
        assigned_host = score_hosts(hosts_df, vm, weights)
        placements.append({
            "vm_id": vm["vm_id"],
            "assigned_host": assigned_host
        })

    return jsonify(placements)

@app.route("/api/v1/simulate_vm", methods=["GET"])
def simulate_vm():
    sample_vm = {
        "vm": "VM" + str(random.randint(1, 10)),
        "cpu": random.randint(4, 20),
        "memory": random.randint(8, 32),
        "network_io": random.uniform(0, 20),
        "power": random.uniform(5, 120)
    }
    return jsonify(sample_vm)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)

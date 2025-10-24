import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

def _resolve_path(filename: str) -> str:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, filename)

def _try_load(path_candidates):
    for p in path_candidates:
        try:
            if os.path.exists(p):
                return joblib.load(p), p
        except Exception:
            continue
    return None, None

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

# Load model assets
MODEL_PATH = _resolve_path("rfinal_vm_host_placement_model.pkl")
SCALER_PATH = _resolve_path("vm_feature_scaler.pkl")
encoder_candidates = [
    _resolve_path("label_encoder_vm.pkl"),
    _resolve_path(os.path.join("finalmodel", "label_encoder_vm.pkl")),
]

model, MODEL_PATH = _try_load([MODEL_PATH])
scaler, SCALER_PATH = _try_load([SCALER_PATH])
le_vm, ENCODER_PATH = _try_load(encoder_candidates)

if any(x is None for x in [model, scaler, le_vm]):
    app.logger.error("Failed to load model assets:")
    app.logger.error(f"  model: {MODEL_PATH}")
    app.logger.error(f"  scaler: {SCALER_PATH}")
    app.logger.error(f"  encoder candidates tried: {encoder_candidates}")

@app.route("/api/v1/health", methods=["GET"])
def health() -> tuple:
    ok = all([model is not None, scaler is not None, le_vm is not None])
    return jsonify({
        "ok": ok,
        "model": os.path.basename(MODEL_PATH) if MODEL_PATH else None,
        "scaler": os.path.basename(SCALER_PATH) if SCALER_PATH else None,
        "encoder": os.path.basename(ENCODER_PATH) if ENCODER_PATH else None
    }), (200 if ok else 500)

@app.route("/api/v1/vms", methods=["GET"])
def get_vms() -> tuple:
    if le_vm is None:
        return jsonify({"error": "Encoder not loaded"}), 500
    classes = [str(c) for c in getattr(le_vm, "classes_", [])]
    return jsonify({"vms": classes}), 200

@app.route("/api/v1/predict", methods=["POST"])
def predict() -> tuple:
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

    # Simple proxy objectives
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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)

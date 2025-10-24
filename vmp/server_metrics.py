import os
from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import datetime

app = Flask(__name__)
CORS(app)


def get_system_metrics():
    """Fetch real system metrics"""
    cpu = psutil.cpu_percent(interval=None)  # non-blocking
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    net_io = psutil.net_io_counters()
    net_sent = round(net_io.bytes_sent / 1024 / 1024, 2)   # MB
    net_recv = round(net_io.bytes_recv / 1024 / 1024, 2)   # MB
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    return {
        "time": timestamp,
        "cpu": cpu,
        "memory": memory,
        "disk": disk,
        "network_sent": net_sent,
        "network_recv": net_recv
    }


@app.route("/api/v1/metrics", methods=["GET"])
def metrics():
    return jsonify(get_system_metrics()), 200


@app.route("/api/v1/health", methods=["GET"])
def health():
    metrics = get_system_metrics()
    status = "Healthy ✅"
    if metrics["cpu"] > 85 or metrics["memory"] > 85:
        status = "Warning ⚠️"
    if metrics["cpu"] > 95 or metrics["memory"] > 95:
        status = "Critical 🔴"
    return jsonify({"status": status, "metrics": metrics}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5002"))  # match React fetch
    app.run(host="0.0.0.0", port=port, debug=True)

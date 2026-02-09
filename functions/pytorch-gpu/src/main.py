import os
import torch
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/", methods=["POST", "GET"])
def index():
    print("[pytorch-gpu] Request received")
    cuda_available = torch.cuda.is_available()
    device_count = torch.cuda.device_count()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "None"
    
    return jsonify({
        "torch_version": torch.__version__,
        "cuda_available": cuda_available,
        "device_count": device_count,
        "device_name": device_name
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"[pytorch-gpu] listening on port {port}")
    app.run(host="0.0.0.0", port=port)

FROM python:3.9-slim

WORKDIR /app

# Install system dev deps if needed
RUN apt-get update && apt-get install -y gcc

# Install torch (CPU version for slimness unless GPU base is used, but user said "cpu and gpu". 
# For testing in Kind (usually no GPU), we default to CPU but code handles checking.
# If we want GPU support in clusters, we'd base off `nvidia/cuda`. 
# For now, to keep image size manageable for local dev, use CPU torch.
RUN pip install flask torch --no-cache-dir

COPY src/ ./src/

ENV PORT=8080

CMD ["python", "src/main.py"]

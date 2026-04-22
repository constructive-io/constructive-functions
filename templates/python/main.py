import os
import logging
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn

from handler import handler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("{{name}}")

app = FastAPI(title="{{name}}")


async def send_callback(callback_url: str, worker_id: str, job_id: str, database_id: str | None, status: str, error: str | None = None):
    """Send job completion callback to job service."""
    if not callback_url or not worker_id or not job_id:
        return

    # Normalize callback URL to /callback endpoint
    if not callback_url.endswith("/callback"):
        callback_url = callback_url.rstrip("/") + "/callback"

    headers = {
        "Content-Type": "application/json",
        "X-Worker-Id": worker_id,
        "X-Job-Id": job_id,
    }
    if database_id:
        headers["X-Database-Id"] = database_id
    if status == "error":
        headers["X-Job-Error"] = "true"

    body = {"status": status}
    if error:
        body["error"] = error

    try:
        async with httpx.AsyncClient() as client:
            await client.post(callback_url, headers=headers, json=body, timeout=10.0)
        logger.info(f"Sent callback: status={status}, job_id={job_id}")
    except Exception as e:
        logger.error(f"Failed to send callback: {e}")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/")
async def handle(request: Request):
    # Extract job context from headers
    callback_url = request.headers.get("X-Callback-Url")
    worker_id = request.headers.get("X-Worker-Id")
    job_id = request.headers.get("X-Job-Id")
    database_id = request.headers.get("X-Database-Id")

    try:
        payload = await request.json()
        logger.info(f"Received job: {payload}")
        result = await handler(payload)
        logger.info(f"Job completed: {result}")

        # Send success callback
        await send_callback(callback_url, worker_id, job_id, database_id, "success")

        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Job failed: {e}")

        # Send error callback
        await send_callback(callback_url, worker_id, job_id, database_id, "error", str(e))

        return JSONResponse(content={"error": str(e)}, status_code=500)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    logger.info(f"Starting {{name}} on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

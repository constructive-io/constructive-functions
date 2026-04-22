async def handler(payload: dict) -> dict:
    """
    Simple echo handler - returns the received payload.
    """
    return {
        "received": payload,
        "status": "ok",
        "message": "Hello from Python!"
    }

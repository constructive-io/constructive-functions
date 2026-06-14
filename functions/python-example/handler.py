async def handler(payload: dict, agent=None) -> dict:
    """
    Simple echo handler - returns the received payload.

    The `agent` parameter is an AgentContext instance for LLM inference:
        result = await agent.inference(
            messages=[{"role": "user", "content": "Hello"}],
            model="gpt-4o"
        )
    """
    return {
        "received": payload,
        "status": "ok",
        "message": "Hello from Python!"
    }

"""____name____ — handler implementation."""
from typing import Any


async def handler(params: dict[str, Any]) -> dict[str, Any]:
    """Process a job payload and return a JSON-serialisable result."""
    # TODO: implement
    print(f"____name____ invoked: {params}")
    return {"ok": True}

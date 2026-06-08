"""
Example Python function handler.

Copy this directory to create a new Python function:
  1. cp -r functions/python-example functions/my-function
  2. Edit handler.json (name, description, secrets, configs)
  3. Implement your logic here
  4. Run: make register && pgpm kill && make up

The handler receives a dict payload from the job queue
and returns a dict result.
"""

from datetime import datetime, timezone


async def handler(payload: dict) -> dict:
    """Process a job payload and return a result."""
    return {
        "status": "ok",
        "received": payload,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

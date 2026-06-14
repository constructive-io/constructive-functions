"""
Agent context for Python cloud functions.

Provides typed access to the agentic server for LLM inference and embeddings.
Identity headers (X-Database-Id, X-Entity-Id) are set from the job context
and cannot be forged by the function caller.

Usage:
    from agent import AgentContext

    agent = AgentContext.from_request(request)
    result = await agent.inference(
        messages=[{"role": "user", "content": "Hello"}],
        model="gpt-4o"
    )
    print(result["content"])
"""

import os
import logging
from dataclasses import dataclass, field
from typing import Optional

import httpx

logger = logging.getLogger("agent")


@dataclass
class AgentContext:
    """Typed agent context for LLM inference via the agentic server."""

    agentic_server_url: str
    database_id: Optional[str] = None
    entity_id: Optional[str] = None
    actor_id: Optional[str] = None

    @classmethod
    def from_request(cls, request) -> "AgentContext":
        """Create an AgentContext from a FastAPI Request."""
        url = os.getenv("AGENTIC_SERVER_URL", "")
        return cls(
            agentic_server_url=url,
            database_id=request.headers.get("X-Database-Id"),
            entity_id=request.headers.get("X-Entity-Id"),
            actor_id=request.headers.get("X-Actor-Id"),
        )

    @classmethod
    def from_headers(
        cls,
        database_id: Optional[str] = None,
        entity_id: Optional[str] = None,
        actor_id: Optional[str] = None,
    ) -> "AgentContext":
        """Create an AgentContext from explicit header values."""
        url = os.getenv("AGENTIC_SERVER_URL", "")
        return cls(
            agentic_server_url=url,
            database_id=database_id,
            entity_id=entity_id,
            actor_id=actor_id,
        )

    def _build_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {
            "Content-Type": "application/json",
            "X-Internal-Service": "fn-runtime-python",
        }
        if self.database_id:
            headers["X-Database-Id"] = self.database_id
        if self.entity_id:
            headers["X-Entity-Id"] = self.entity_id
        if self.actor_id:
            headers["X-Actor-Id"] = self.actor_id
        return headers

    async def inference(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> dict:
        """
        Call the agentic server for LLM inference.

        Returns:
            {
                "content": str,
                "finish_reason": str,
                "usage": {"prompt_tokens": int, "completion_tokens": int, "total_tokens": int}
            }
        """
        if not self.agentic_server_url:
            raise RuntimeError(
                "Agent context not available. Set AGENTIC_SERVER_URL environment variable."
            )

        url = f"{self.agentic_server_url}/v1/chat/completions"
        body: dict = {"messages": messages}
        if model is not None:
            body["model"] = model
        if temperature is not None:
            body["temperature"] = temperature
        if max_tokens is not None:
            body["max_tokens"] = max_tokens

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=self._build_headers(), json=body, timeout=120.0)
            resp.raise_for_status()
            data = resp.json()

        choice = data.get("choices", [{}])[0]
        message = choice.get("message", {})
        usage = data.get("usage", {})

        return {
            "content": message.get("content", ""),
            "finish_reason": choice.get("finish_reason", "stop"),
            "usage": {
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "completion_tokens": usage.get("completion_tokens", 0),
                "total_tokens": usage.get("total_tokens", 0),
            },
        }

    async def embed(
        self,
        input_text: str | list[str],
        model: Optional[str] = None,
    ) -> dict:
        """
        Generate embeddings via the agentic server.

        Returns:
            {
                "embeddings": list[list[float]],
                "usage": {"prompt_tokens": int, "total_tokens": int}
            }
        """
        if not self.agentic_server_url:
            raise RuntimeError(
                "Agent context not available. Set AGENTIC_SERVER_URL environment variable."
            )

        url = f"{self.agentic_server_url}/v1/embeddings"
        body: dict = {"input": input_text}
        if model is not None:
            body["model"] = model

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=self._build_headers(), json=body, timeout=120.0)
            resp.raise_for_status()
            data = resp.json()

        embeddings = [item["embedding"] for item in data.get("data", [])]
        usage = data.get("usage", {})

        return {
            "embeddings": embeddings,
            "usage": {
                "prompt_tokens": usage.get("prompt_tokens", 0),
                "total_tokens": usage.get("total_tokens", 0),
            },
        }

# Hello World Function

A simple example function that returns a greeting message.

## Usage

```bash
curl "http://localhost:3000/hello-world?name=Developer"
```

## Response

```json
{
  "message": "Hello, Developer!",
  "timestamp": "2026-01-06T12:40:00.000Z"
}
```

## Query Parameters

- `name` (optional): The name to greet. Defaults to "World".

# Backend API — Implementation Specification

This document defines the contract between the Nuxt frontend and the Python AI backend. Implement this interface in your backend service to make the frontend fully functional.

---

## Overview

The frontend acts as a secure proxy:

```
Browser  ──→  Nuxt Server Route (/api/generate)  ──→  Python AI Backend (/generate)
```

The browser never talks directly to the AI backend. Authentication is handled entirely by Nuxt; the AI backend only needs to implement the `/generate` endpoint.

---

## Base URL

The backend base URL is configured via `NUXT_BACKEND_URL` (default: `http://localhost:8000`).

---

## Endpoints

### `POST /generate`

Generate unit tests for a given Python function.

#### Request

```http
POST /generate HTTP/1.1
Content-Type: application/json
```

```json
{
  "code": "def add(a, b):\n    return a + b",
  "format": "pytest"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | `string` | Yes | Raw Python source code of the function(s) to test |
| `format` | `"pytest"` \| `"unittest"` | Yes | Desired output test framework |

#### Response — 200 OK

```json
{
  "tests": "import pytest\n\ndef test_add_positive():\n    assert add(1, 2) == 3\n\ndef test_add_negative():\n    assert add(-1, -1) == -2\n\ndef test_add_zero():\n    assert add(0, 0) == 0\n",
  "model": "gpt-4o",
  "tokens_used": 312
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tests` | `string` | Yes | Complete, runnable test file content |
| `model` | `string` | No | Model identifier used (for logging / display) |
| `tokens_used` | `number` | No | Token count for billing / debugging |

The `tests` field **must** be a self-contained Python source file that can be saved as `.py` and run directly with `pytest` or `python -m unittest` without modification.

#### Response — 4xx / 5xx

On error, return JSON with a `detail` or `message` field. The Nuxt proxy will surface this to the user.

```json
{
  "detail": "No function definition found in the provided code."
}
```

---

### `GET /health`

Optional but recommended — used for deployment health checks.

#### Response — 200 OK

```json
{ "status": "ok" }
```

---

## Output Format Requirements

### `pytest` format

```python
import pytest
# Import the function under test from the same module or via sys.path

def test_<function_name>_<scenario>():
    assert <function_under_test>(<args>) == <expected>

# Parametrize when testing multiple values
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected
```

### `unittest` format

```python
import unittest
# Import the function under test

class Test<FunctionName>(unittest.TestCase):

    def test_<scenario>(self):
        self.assertEqual(<function_under_test>(<args>), <expected>)

    def test_<edge_case>(self):
        self.assertRaises(<ExceptionType>, <function_under_test>, <bad_args>)

if __name__ == '__main__':
    unittest.main()
```

---

## Reference Implementation (FastAPI + OpenAI)

Below is a minimal, working FastAPI backend using the OpenAI API. Swap the model call for your own LLM as needed.

### File: `backend/main.py`

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os

app = FastAPI(title="PyTest Generator Backend")

# Allow requests from the Nuxt dev server (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])


class GenerateRequest(BaseModel):
    code: str
    format: str  # "pytest" or "unittest"


class GenerateResponse(BaseModel):
    tests: str
    model: str
    tokens_used: int


SYSTEM_PROMPT = """You are an expert Python test engineer.
Given a Python function, generate comprehensive unit tests.
Return ONLY the complete, runnable Python test file — no explanations, no markdown, no code fences.
The output must be valid Python that can be saved as a .py file and run immediately."""


def build_user_prompt(code: str, fmt: str) -> str:
    framework = "pytest" if fmt == "pytest" else "unittest (using unittest.TestCase)"
    return (
        f"Generate {framework} unit tests for the following Python code.\n\n"
        f"Cover: normal cases, edge cases, and error/exception cases.\n\n"
        f"```python\n{code}\n```"
    )


@app.post("/generate", response_model=GenerateResponse)
async def generate_tests(request: GenerateRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code field is empty.")

    fmt = "unittest" if request.format == "unittest" else "pytest"

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(request.code, fmt)},
            ],
            temperature=0.2,
        )
    except openai.OpenAIError as exc:
        raise HTTPException(status_code=502, detail=f"LLM error: {exc}") from exc

    tests = response.choices[0].message.content or ""
    # Strip accidental markdown fences if the model adds them
    tests = tests.strip()
    if tests.startswith("```"):
        lines = tests.splitlines()
        tests = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    return GenerateResponse(
        tests=tests,
        model=response.model,
        tokens_used=response.usage.total_tokens if response.usage else 0,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
```

### File: `backend/requirements.txt`

```
fastapi>=0.111.0
uvicorn[standard]>=0.30.0
openai>=1.35.0
pydantic>=2.7.0
python-dotenv>=1.0.0
```

### Running the backend

```bash
cd backend
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...
uvicorn main:app --reload --port 8000
```

---

## Using a Local / Custom LLM

If you're using a local model (e.g. Ollama, vLLM, llama.cpp) or a fine-tuned model, replace the `client.chat.completions.create(...)` call with your own inference code. The request/response contract to the Nuxt frontend is unchanged — only the `tests` string matters.

**Example with Ollama:**

```python
import httpx

async def call_ollama(prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:11434/api/generate",
            json={"model": "codellama", "prompt": prompt, "stream": False},
            timeout=120,
        )
        return response.json()["response"]
```

---

## Streaming (Optional Enhancement)

For long functions the model may take several seconds to respond. You can implement streaming to improve perceived latency.

**Backend — add a streaming endpoint:**

```python
from fastapi.responses import StreamingResponse
import json

@app.post("/generate/stream")
async def generate_stream(request: GenerateRequest):
    fmt = "unittest" if request.format == "unittest" else "pytest"

    def token_stream():
        stream = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(request.code, fmt)},
            ],
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if delta:
                yield f"data: {json.dumps({'token': delta})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(token_stream(), media_type="text/event-stream")
```

**Frontend — consume the stream in `server/api/generate.post.ts`** by switching to `readableStreamToText` or a custom SSE reader. The current implementation uses a single JSON response; streaming is left as an enhancement.

---

## Security Notes

- The AI backend **does not** need its own authentication — the Nuxt server route handles auth and is the only caller.
- If you deploy the backend on a public host, protect it with a network firewall so only the Nuxt server can reach it, or add a shared secret header:
  ```python
  # backend/main.py
  from fastapi import Header

  @app.post("/generate")
  async def generate_tests(request: GenerateRequest, x_internal_token: str = Header(...)):
      if x_internal_token != os.environ["INTERNAL_TOKEN"]:
          raise HTTPException(status_code=403)
      ...
  ```
  Then add the header in `server/api/generate.post.ts`:
  ```ts
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Token': config.backendInternalToken,
  }
  ```
- Never expose `NUXT_JWT_SECRET` or `NUXT_AUTH_PASSWORD` to the backend service.

---

## Error Codes

| HTTP Code | Meaning | Frontend behaviour |
|-----------|---------|-------------------|
| 200 | Success | Displays `tests` in chat |
| 400 | Bad request (empty code etc.) | Shows error message |
| 500 | Backend internal error | Shows error message |
| 502 | Backend unreachable (from Nuxt proxy) | Shows "Backend unavailable" |

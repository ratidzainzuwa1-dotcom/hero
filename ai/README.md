AI microservice (FastAPI)
=================================

This directory contains a small FastAPI app that provides helpful endpoints for business operations:

- `/llm` - send a prompt and get an LLM response (uses OpenAI API if `OPENAI_API_KEY` set, otherwise falls back to a simple template response)
- `/forecast` - simple cashflow forecasting endpoint (accepts historical numeric series)
- `/inventory` - inventory suggestions (reorder suggestions based on sales history)
- `/ad` - generate ad copy for a product (uses OpenAI if available)
- `/invoice` - generate a JSON/HTML invoice for a sale

Quick start (local)
-------------------

1. Create a Python venv and install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r ai/requirements.txt
```

2. Set `OPENAI_API_KEY` environment variable if you want to use OpenAI-backed endpoints.

3. Run the app:

```bash
uvicorn ai.app:app --reload --port 8000
```

4. Open `http://localhost:8000/docs` for automatic API docs and try endpoints.

Notes
-----
- This is a lightweight scaffold intended for demo and prototyping. It uses a simple sklearn linear model for forecasting; replace with more advanced models or remote LLMs as needed.
- Do not commit your OpenAI key to the repo. Use environment variables or a secrets manager.

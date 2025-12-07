import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import json

from .models import simple_forecast, inventory_suggestion

try:
    import openai
    OPENAI_AVAILABLE = True
except Exception:
    OPENAI_AVAILABLE = False

app = FastAPI(title="Mini Group AI Assistant")


class LLMRequest(BaseModel):
    prompt: str
    max_tokens: Optional[int] = 200


class ForecastRequest(BaseModel):
    series: List[float]
    periods: Optional[int] = 3


class InventoryRequest(BaseModel):
    sales_history: List[int]
    current_stock: int
    lead_time_days: Optional[int] = 7
    safety_days: Optional[int] = 3


class AdRequest(BaseModel):
    product_name: str
    tone: Optional[str] = "friendly"
    length: Optional[str] = "short"


class InvoiceItem(BaseModel):
    description: str
    qty: int
    unit_price: float


class InvoiceRequest(BaseModel):
    to_name: str
    to_email: str
    items: List[InvoiceItem]
    invoice_id: Optional[str] = None


@app.get("/")
def root():
    return {"ok": True, "service": "Mini Group AI Assistant"}


@app.post("/llm")
def llm(req: LLMRequest):
    prompt = req.prompt
    if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role":"user","content":prompt}],
                max_tokens=req.max_tokens,
            )
            text = resp.choices[0].message.content
            return {"text": text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI error: {e}")
    # fallback simple echo/template
    return {"text": f"[LLM fallback] I got your prompt: {prompt[:200]}"}


@app.post("/forecast")
def forecast(req: ForecastRequest):
    result = simple_forecast(req.series, periods=req.periods or 3)
    return result


@app.post("/inventory")
def inventory(req: InventoryRequest):
    result = inventory_suggestion(req.sales_history, req.current_stock, req.lead_time_days or 7, req.safety_days or 3)
    return result


@app.post("/ad")
def generate_ad(req: AdRequest):
    prompt = f"Write a {req.length} ad copy for {req.product_name} with a {req.tone} tone."
    if OPENAI_AVAILABLE and os.getenv("OPENAI_API_KEY"):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role":"user","content":prompt}],
                max_tokens=150,
            )
            return {"ad": resp.choices[0].message.content}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    # fallback template
    return {"ad": f"{req.product_name} — {req.tone.capitalize()} choice for smart buyers. Try it today!"}


@app.post("/invoice")
def generate_invoice(req: InvoiceRequest):
    items = []
    total = 0.0
    for it in req.items:
        line = it.qty * it.unit_price
        total += line
        items.append({"description": it.description, "qty": it.qty, "unit_price": it.unit_price, "line_total": round(line,2)})
    invoice_id = req.invoice_id or f"INV-{os.urandom(3).hex()}"
    invoice = {
        "invoice_id": invoice_id,
        "to": {"name": req.to_name, "email": req.to_email},
        "items": items,
        "total": round(total,2)
    }
    # simple HTML representation
    html_lines = [f"<h2>Invoice {invoice_id}</h2>", f"<p>To: {req.to_name} &lt;{req.to_email}&gt;</p>", "<table border=1 cellpadding=6><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Line</th></tr>"]
    for it in items:
        html_lines.append(f"<tr><td>{it['description']}</td><td>{it['qty']}</td><td>${it['unit_price']}</td><td>${it['line_total']}</td></tr>")
    html_lines.append(f"</table><p><strong>Total: ${invoice['total']}</strong></p>")
    invoice_html = "\n".join(html_lines)
    return {"invoice": invoice, "html": invoice_html}

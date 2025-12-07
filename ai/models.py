from typing import List, Dict, Any
import numpy as np
from sklearn.linear_model import Ridge


def simple_forecast(series: List[float], periods: int = 3) -> Dict[str, Any]:
    """Train a tiny ridge regression on index -> value and predict next `periods` values.
    Falls back to average if series too short.
    """
    if not series:
        return {"predictions": [0] * periods, "model":"none"}
    y = np.array(series)
    x = np.arange(len(y)).reshape(-1, 1)
    if len(y) < 3:
        # naive average
        avg = float(np.mean(y))
        return {"predictions": [round(avg,2)]*periods, "model":"average"}
    model = Ridge(alpha=1.0)
    model.fit(x, y)
    future_x = np.arange(len(y), len(y)+periods).reshape(-1,1)
    preds = model.predict(future_x)
    return {"predictions": [round(float(p),2) for p in preds], "model":"ridge"}


def inventory_suggestion(sales_history: List[int], current_stock: int, lead_time_days: int = 7, safety_days: int = 3) -> Dict[str, Any]:
    """Estimate reorder quantity using average daily sales.
    sales_history: list of recent daily sales counts.
    """
    if not sales_history:
        return {"reorder": 0, "reason": "no history"}
    avg_daily = float(np.mean(sales_history))
    expected_during_lead = avg_daily * lead_time_days
    safety = avg_daily * safety_days
    target = expected_during_lead + safety
    reorder = max(0, int(round(target - current_stock)))
    return {"avg_daily": round(avg_daily,2), "target_stock": int(round(target)), "reorder": reorder}

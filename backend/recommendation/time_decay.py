import math
from datetime import datetime

def get_time_weight(date_str: str, alpha=0.05) -> float:
    try:
        days = (datetime.now() - datetime.fromisoformat(date_str)).days
        return math.exp(-alpha * days) if days >= 0 else 1.0
    except:
        return 1.0

import logging
import json
import time
from contextvars import ContextVar
from typing import Any, Dict

# Context variable to store the request ID for the current task
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="")

class JsonFormatter(logging.Formatter):
    """
    Structured JSON formatter for production-grade observability.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_ctx.get(),
            "caller": f"{record.filename}:{record.lineno}"
        }
        
        # Include extra fields if provided
        if hasattr(record, "extra_fields"):
            log_entry.update(record.extra_fields)
            
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)

def setup_logging():
    """
    Configures global logging to use the JSON formatter.
    """
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter(datefmt="%Y-%m-%dT%H:%M:%S.000Z"))
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicates
    for h in root_logger.handlers[:]:
        root_logger.removeHandler(h)
        
    root_logger.addHandler(handler)
    
    # Silence some noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)

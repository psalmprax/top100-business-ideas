FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    git \
    pkg-config \
    libcairo2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY server/python/requirements.txt .
COPY packages/agentops-sdk-python ./packages/agentops-sdk-python

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY server/python .

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -m appuser

# Ensure app directory is owned by non-root user
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Use python -m uvicorn instead of direct uvicorn
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

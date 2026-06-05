# ---- Build stage ----
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---- Runtime stage ----
FROM python:3.11-slim

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy the entire backend
COPY . .

# Create required runtime directories
RUN mkdir -p uploads chroma_data

# Expose default port (Render overrides with PORT env var)
EXPOSE 8000

# Run the application — use shell form so $PORT is interpolated by Render
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

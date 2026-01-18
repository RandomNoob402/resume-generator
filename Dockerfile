FROM python:3.11-slim

# Avoid .pyc files and keep logs unbuffered
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# System deps for WeasyPrint (cairo, pango, gobject, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    shared-mime-info \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Railway sets $PORT automatically
ENV PORT=8000

# Your main file is app.py (from the logs), and Flask app is `app`
CMD gunicorn --bind 0.0.0.0:$PORT app:app

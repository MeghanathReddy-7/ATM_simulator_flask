FROM python:3.11-slim
WORKDIR /app
COPY flask_backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY flask_backend /app/flask_backend
ENV PYTHONPATH=/app
EXPOSE 5000
CMD ["gunicorn", "flask_backend.run:app", "-b", "0.0.0.0:5000", "-w", "2"]


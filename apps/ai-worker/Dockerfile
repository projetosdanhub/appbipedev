FROM python:3.10-slim

WORKDIR /app

# Instala as dependências de sistema necessárias para o Coqui TTS
RUN apt-get update && apt-get install -y \
    build-essential \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Instala as dependências Python priorizando a versão CPU do PyTorch (conforme planejado)
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5005

CMD ["python", "main.py"]

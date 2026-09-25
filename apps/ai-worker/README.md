# BipeSend AI Worker (XTTSv2)

Serviço de clonagem e síntese de voz (TTS) projetado para rodar localmente com foco no processamento via CPU.
Utiliza o [Coqui TTS (XTTSv2)](https://github.com/coqui-ai/TTS) para clonagem zero-shot em Português do Brasil (PT-BR).

## Requisitos de Hardware
- Processador (CPU): Mínimo recomendado Core i5 ou Ryzen 5 (Gerações recentes).
- RAM: 8GB a 16GB.

## Configuração Local (Sem Docker)

1. Crie um ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate # ou venv\Scripts\activate no Windows
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Inicie o servidor (FastAPI):
   ```bash
   python main.py
   ```

## Configuração via Docker

Construir e rodar o contêiner:
```bash
docker build -t bipesend-ai-worker .
docker run -p 5005:5005 bipesend-ai-worker
```

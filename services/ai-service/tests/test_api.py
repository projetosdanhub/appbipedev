import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_api_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["maxCrmStages"] == 10

@pytest.mark.asyncio
async def test_api_templates():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/v1/ai/templates")
        assert res.status_code == 200
        templates = res.json()
        assert len(templates) >= 3
        # Verifica se template de Sofia existe
        names = [t["name"] for t in templates]
        assert "Sofia" in names

@pytest.mark.asyncio
async def test_api_safety_check_blocks_sql():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/v1/ai/safety-check", json={"text": "DROP TABLE users;"})
        assert res.status_code == 200
        data = res.json()
        assert data["safe"] is False
        assert "banco de dados" in data["reason"].lower()

@pytest.mark.asyncio
async def test_api_generate_pipeline_crm_limit():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.post("/v1/ai/generate-pipeline", json={"businessDescription": "Clínica de estética facial"})
        assert res.status_code == 200
        pipeline = res.json()
        assert len(pipeline["stages"]) <= 10
        assert len(pipeline["stages"]) > 0

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any

from app.config import settings
from app.generation_bridge import (
    SafetyGuardrails,
    SafetyViolation,
    BipeAiCrmGenerator,
    CrmPipelineProposal,
    AiAgentEngine,
    AgentConfig,
    ChatRequest,
    ChatResponse,
)
from app.tts_service import tts_router

app = FastAPI(
    title="BipeSend AI Service",
    description="Microserviço em Python de Inteligência Artificial para o BipeSend (Gemini, OpenAI, Bipe AI e Agentes Omnichannel).",
    version="1.0.0"
)

# CORS para desenvolvimento e produção
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    version: str
    geminiConfigured: bool
    openaiConfigured: bool
    maxCrmStages: int

class SafetyCheckRequest(BaseModel):
    text: str

class SafetyCheckResponse(BaseModel):
    safe: bool
    reason: str

class GeneratePipelineRequest(BaseModel):
    businessDescription: str = Field(..., max_length=1000)

class MasterAgentTemplate(BaseModel):
    id: str
    name: str
    gender: str
    role: str
    personality: str
    limitations: List[str]
    category: str

# Templates mestres padrão da plataforma BipeSend
MASTER_AGENT_TEMPLATES: List[MasterAgentTemplate] = [
    MasterAgentTemplate(
        id="tpl-sales-omnichannel",
        name="Sofia",
        gender="Feminino (Ela/Dela)",
        role="Consultora de Vendas Omnichannel",
        personality="Extremamente acolhedora, empática, persuasiva e dinâmica. Focada em identificar as dores do lead e conduzir com entusiasmo para a demonstração ou fechamento.",
        limitations=[
            "Nunca fornecer descontos sem autorização prévia de um gestor humano.",
            "Não enviar links externos não homologados na base da empresa.",
            "Direcionar para atendimento humano se o cliente solicitar ou demonstrar insatisfação.",
            "Nunca criticar ou citar marcas concorrentes de forma negativa."
        ],
        category="Vendas"
    ),
    MasterAgentTemplate(
        id="tpl-sdr-qualifier",
        name="Lucas",
        gender="Masculino (Ele/Dele)",
        role="Especialista em Qualificação e Triagem (SDR)",
        personality="Prático, objetivo, cordial e consultivo. Realiza perguntas inteligentes para entender orçamento, urgência e autoridade de decisão.",
        limitations=[
            "Manter o foco exclusivamente na qualificação inicial de novos contatos.",
            "Não assinar termos de compromisso ou acordos contratuais.",
            "Se o lead for qualificado, agendar imediatamente a reunião no CRM.",
            "Bloquear qualquer tentativa de desvio de assunto para temas não profissionais."
        ],
        category="Qualificação"
    ),
    MasterAgentTemplate(
        id="tpl-support-n1",
        name="Maya",
        gender="Feminino (Ela/Dela)",
        role="Especialista em Suporte & Atendimento ao Cliente",
        personality="Paciente, calma, didática e resolutiva. Explica o passo a passo com clareza e acolhe as dúvidas com agilidade.",
        limitations=[
            "Nunca solicitar senhas, códigos de segurança de dois fatores ou tokens bancários.",
            "Não alterar permissões administrativas do cliente diretamente.",
            "Transferir o chamado para Suporte N2 se a dúvida envolver erros de infraestrutura.",
            "Registrar o histórico resumido no ticket de suporte antes de finalizar."
        ],
        category="Suporte"
    ),
    MasterAgentTemplate(
        id="tpl-real-estate",
        name="Gabriel",
        gender="Masculino (Ele/Dele)",
        role="Consultor Imobiliário Inteligente",
        personality="Elegante, seguro, conhecedor de localizações e tendências de mercado. Valoriza as preferências de moradia e investimento do cliente.",
        limitations=[
            "Não prometer reservas de imóveis sem o sinal aprovado pelo proprietário.",
            "Não divulgar dados sensíveis de proprietários ou contratos de terceiros.",
            "Focar em agendar visitas aos imóveis selecionados no funil imobiliário."
        ],
        category="Imobiliário"
    )
]

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        geminiConfigured=bool(settings.GEMINI_API_KEY),
        openaiConfigured=bool(settings.OPENAI_API_KEY),
        maxCrmStages=settings.MAX_CRM_STAGES
    )

@app.post("/v1/ai/safety-check", response_model=SafetyCheckResponse)
def check_safety(request: SafetyCheckRequest):
    safe, reason = SafetyGuardrails.validate_input(request.text)
    return SafetyCheckResponse(safe=safe, reason=reason)

@app.post("/v1/ai/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    return await AiAgentEngine.chat(request)

@app.post("/v1/ai/generate-pipeline", response_model=CrmPipelineProposal)
async def generate_crm_pipeline(request: GeneratePipelineRequest):
    try:
        return await BipeAiCrmGenerator.generate_pipeline(request.businessDescription)
    except SafetyViolation as sv:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=sv.reason)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))

@app.get("/v1/ai/templates", response_model=List[MasterAgentTemplate])
def get_master_agent_templates():
    return MASTER_AGENT_TEMPLATES

app.include_router(tts_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.AI_SERVICE_HOST, port=settings.AI_SERVICE_PORT)

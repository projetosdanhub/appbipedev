from typing import List, Dict, Any
from pydantic import BaseModel, Field
import json
import httpx
from app.config import settings
from .safety import SafetyGuardrails, SafetyViolation

class CrmStageProposal(BaseModel):
    name: str = Field(..., max_length=100)
    colorToken: str = Field(default="#007BFF")
    category: str = Field(default="open") # 'open' | 'won' | 'lost'
    position: int = Field(default=0)

class CrmPipelineProposal(BaseModel):
    name: str = Field(..., max_length=100)
    description: str = Field(default="")
    stages: List[CrmStageProposal] = Field(..., max_length=10) # LIMITE RÍGIDO DE ATÉ 10 FLUXOS

class BipeAiCrmGenerator:
    """
    Gerador Inteligente de Funis Comerciais da Bipe AI.
    Cria a estrutura estratégica do CRM baseada no nicho do cliente,
    limitando estritamente a até 10 fluxos no CRM.
    """

    DEFAULT_COLORS = [
        "#007BFF", # Azul Bipe
        "#6366F1", # Violeta
        "#3B82F6", # Azul Royal
        "#F59E0B", # Âmbar
        "#8B5CF6", # Roxo
        "#EC4899", # Rosa
        "#06B6D4", # Ciano
        "#14B8A6", # Verde Água
        "#10B981", # Esmeralda (Ganho)
        "#EF4444", # Carmesim (Perdido)
    ]

    @classmethod
    async def generate_pipeline(cls, business_description: str) -> CrmPipelineProposal:
        # 1. Validar segurança da descrição de entrada
        is_safe, reason = SafetyGuardrails.validate_input(business_description)
        if not is_safe:
            raise SafetyViolation(reason)

        # 2. Tentar provedor Gemini se configurado
        if settings.GEMINI_API_KEY:
            try:
                proposal = await cls._generate_with_gemini(business_description)
                if proposal:
                    return cls._enforce_limit(proposal)
            except Exception:
                pass

        # 3. Tentar provedor OpenAI se configurado
        if settings.OPENAI_API_KEY:
            try:
                proposal = await cls._generate_with_openai(business_description)
                if proposal:
                    return cls._enforce_limit(proposal)
            except Exception:
                pass

        # 4. Fallback inteligente determinístico por nicho/arquétipo
        return cls._generate_smart_fallback(business_description)

    @classmethod
    def _enforce_limit(cls, proposal: CrmPipelineProposal) -> CrmPipelineProposal:
        """Garante que nunca ultrapasse 10 fluxos no CRM."""
        if len(proposal.stages) > settings.MAX_CRM_STAGES:
            proposal.stages = proposal.stages[:settings.MAX_CRM_STAGES]
        # Re-indexa posições
        for idx, stage in enumerate(proposal.stages):
            stage.position = idx
            if not stage.colorToken or stage.colorToken == "#007BFF":
                stage.colorToken = cls.DEFAULT_COLORS[idx % len(cls.DEFAULT_COLORS)]
        return proposal

    @classmethod
    def parse_raw_proposal(cls, raw: Dict[str, Any]) -> CrmPipelineProposal:
        """Trunca dados brutos para garantir no máximo 10 fluxos antes de validar no Pydantic."""
        stages_data = raw.get("stages", [])
        if len(stages_data) > settings.MAX_CRM_STAGES:
            stages_data = stages_data[:settings.MAX_CRM_STAGES]
        raw["stages"] = stages_data
        proposal = CrmPipelineProposal(**raw)
        return cls._enforce_limit(proposal)

    @classmethod
    async def _generate_with_gemini(cls, description: str) -> CrmPipelineProposal | None:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        system_instruction = (
            "Você é a Bipe AI, arquiteta de negócios da BipeSend. "
            "Crie um funil comercial estruturado para o negócio do cliente. "
            "Retorne EXCLUSIVAMENTE um JSON válido no formato: "
            '{"name": "...", "description": "...", "stages": [{"name": "...", "colorToken": "#HEX", "category": "open|won|lost", "position": 0}]}. '
            "A quantidade máxima de estágios é 8 a 10 etapas."
        )
        payload = {
            "contents": [{"parts": [{"text": f"Gere um funil para este negócio: {description}"}]}],
            "systemInstruction": {"parts": [{"text": system_instruction}]},
            "generationConfig": {"responseMimeType": "application/json"}
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return cls.parse_raw_proposal(parsed)
        return None

    @classmethod
    async def _generate_with_openai(cls, description: str) -> CrmPipelineProposal | None:
        url = "https://api.openai.com/v1/chat/completions"
        system_prompt = (
            "Você é a Bipe AI, arquiteta de negócios da BipeSend. "
            "Crie um funil comercial estruturado para o negócio do cliente. "
            "Retorne EXCLUSIVAMENTE um JSON no formato: "
            '{"name": "...", "description": "...", "stages": [{"name": "...", "colorToken": "#HEX", "category": "open|won|lost", "position": 0}]}. '
            "A quantidade máxima de estágios é de 5 a 10 etapas."
        )
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Gere um funil para: {description}"}
            ],
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                parsed = json.loads(text)
                return cls.parse_raw_proposal(parsed)
        return None

    @classmethod
    def _generate_smart_fallback(cls, description: str) -> CrmPipelineProposal:
        desc = description.lower()
        
        # Nicho Imobiliário
        if any(k in desc for k in ["imóve", "imobili", "corretor", "casa", "apartamento"]):
            return CrmPipelineProposal(
                name="Funil Imobiliário de Alta Conversão",
                description="Fluxo completo de atração, qualificação financeira, visitas e fechamento de contratos.",
                stages=[
                    CrmStageProposal(name="Novos Leads", colorToken="#007BFF", category="open", position=0),
                    CrmStageProposal(name="Perfil & Orçamento", colorToken="#6366F1", category="open", position=1),
                    CrmStageProposal(name="Imóveis Apresentados", colorToken="#3B82F6", category="open", position=2),
                    CrmStageProposal(name="Visita Agendada", colorToken="#F59E0B", category="open", position=3),
                    CrmStageProposal(name="Proposta Formal", colorToken="#8B5CF6", category="open", position=4),
                    CrmStageProposal(name="Análise de Crédito", colorToken="#06B6D4", category="open", position=5),
                    CrmStageProposal(name="Contrato Assinado", colorToken="#10B981", category="won", position=6),
                    CrmStageProposal(name="Desistência", colorToken="#EF4444", category="lost", position=7),
                ]
            )

        # Nicho Saúde / Clínicas
        if any(k in desc for k in ["clínica", "consultório", "médic", "estética", "odonto", "saúde"]):
            return CrmPipelineProposal(
                name="Funil de Atendimento & Consultas",
                description="Fluxo humanizado para agendamentos, preparo de pacientes e confirmação de procedimentos.",
                stages=[
                    CrmStageProposal(name="Primeiro Contato", colorToken="#007BFF", category="open", position=0),
                    CrmStageProposal(name="Triagem de Necessidade", colorToken="#6366F1", category="open", position=1),
                    CrmStageProposal(name="Agendamento Solicitado", colorToken="#F59E0B", category="open", position=2),
                    CrmStageProposal(name="Consulta Confirmada", colorToken="#10B981", category="won", position=3),
                    CrmStageProposal(name="Pós-Consulta / Retorno", colorToken="#8B5CF6", category="open", position=4),
                    CrmStageProposal(name="Cancelado", colorToken="#EF4444", category="lost", position=5),
                ]
            )

        # Padrão Vendas B2B / Serviços
        return CrmPipelineProposal(
            name="Funil Comercial Estratégico",
            description="Processo estruturado de qualificação, demonstração de valor e fechamento comercial.",
            stages=[
                CrmStageProposal(name="Novos Contatos", colorToken="#007BFF", category="open", position=0),
                CrmStageProposal(name="Qualificação Inicial", colorToken="#6366F1", category="open", position=1),
                CrmStageProposal(name="Apresentação / Reunião", colorToken="#3B82F6", category="open", position=2),
                CrmStageProposal(name="Proposta Comercial", colorToken="#F59E0B", category="open", position=3),
                CrmStageProposal(name="Negociação & Ajustes", colorToken="#8B5CF6", category="open", position=4),
                CrmStageProposal(name="Venda Realizada", colorToken="#10B981", category="won", position=5),
                CrmStageProposal(name="Perdido / Sem Retorno", colorToken="#EF4444", category="lost", position=6),
            ]
        )

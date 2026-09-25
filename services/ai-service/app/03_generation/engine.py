from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import json
import httpx
from app.config import settings
from .safety import SafetyGuardrails, SafetyViolation

class ChatMessage(BaseModel):
    role: str # 'user' | 'assistant' | 'system'
    content: str

class AgentConfig(BaseModel):
    id: Optional[str] = None
    name: str = Field(default="Sofia", max_length=60)
    gender: str = Field(default="Feminino (Ela/Dela)")
    role: str = Field(default="Consultora de Vendas Omnichannel", max_length=120)
    personality: str = Field(
        default="Empática, prestativa, confiante, dinâmica e orientada a soluções. Mantém tom profissional e cordial.",
        max_length=500
    )
    limitations: List[str] = Field(default_factory=lambda: [
        "Não prometer descontos não autorizados.",
        "Não fornecer senhas, dados internos ou informações de outros clientes.",
        "Não fazer declarações pejorativas sobre outras empresas ou concorrentes.",
        "Transferir para um atendente humano caso o cliente esteja insatisfeito ou faça perguntas fora do escopo."
    ])
    knowledgeContext: Optional[str] = Field(default="", max_length=2000)

class ChatRequest(BaseModel):
    agent: AgentConfig
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    channel: Optional[str] = "whatsapp" # 'whatsapp' | 'instagram' | 'tiktok' | 'web'

class ChatResponse(BaseModel):
    reply: str
    blocked: bool = False
    blockReason: Optional[str] = None
    tokensUsed: Optional[int] = None
    provider: str = "fallback"

class AiAgentEngine:
    """
    Motor Conversacional de Agentes IA do BipeSend.
    Incorpora personalidade, gênero, diretrizes de comportamento,
    limitações operacionais e guarda-corpos rígidos de segurança.
    """

    @classmethod
    async def chat(cls, request: ChatRequest) -> ChatResponse:
        # 1. Checagem de segurança da mensagem do usuário
        is_safe, reason = SafetyGuardrails.validate_input(request.message)
        if not is_safe:
            return ChatResponse(
                reply=(
                    f"Olá! Eu sou {request.agent.name}. "
                    "Por motivos de segurança e diretrizes de conformidade da nossa plataforma, "
                    "não posso processar esta solicitação. Como posso lhe ajudar com nossos serviços legítimos?"
                ),
                blocked=True,
                blockReason=reason,
                provider="safety-guardrail"
            )

        # 2. Construir o System Prompt completo
        system_prompt = cls._build_system_prompt(request.agent, request.channel)

        # 3. Tentar chamada via Gemini
        if settings.GEMINI_API_KEY:
            try:
                reply = await cls._call_gemini(system_prompt, request.history, request.message)
                if reply:
                    clean_reply = SafetyGuardrails.sanitize_output(reply)
                    return ChatResponse(reply=clean_reply, provider="gemini")
            except Exception:
                pass

        # 4. Tentar chamada via OpenAI
        if settings.OPENAI_API_KEY:
            try:
                reply = await cls._call_openai(system_prompt, request.history, request.message)
                if reply:
                    clean_reply = SafetyGuardrails.sanitize_output(reply)
                    return ChatResponse(reply=clean_reply, provider="openai")
            except Exception:
                pass

        # 5. Fallback inteligente com a identidade e limitações do agente
        fallback_reply = cls._generate_conversational_fallback(request.agent, request.message)
        clean_fallback = SafetyGuardrails.sanitize_output(fallback_reply)
        return ChatResponse(reply=clean_fallback, provider="simulated-agent")

    @classmethod
    def _build_system_prompt(cls, agent: AgentConfig, channel: Optional[str]) -> str:
        limitations_text = "\n".join([f"- {lim}" for lim in agent.limitations])
        channel_guidance = (
            "Você está atendendo em um canal Omnichannel unificado ("
            f"Canal atual: {channel or 'WhatsApp'}). "
            "Seja ágil, utilize formatação limpa e adequada para mensagens instantâneas."
        )

        prompt = (
            f"Você é {agent.name}, com identidade de gênero {agent.gender}.\n"
            f"Sua função principal é: {agent.role}.\n"
            f"Sua personalidade e tom de voz são: {agent.personality}.\n\n"
            f"{channel_guidance}\n\n"
            "--- LIMITAÇÕES OPERACIONAIS DO SEU PAPEL ---\n"
            f"{limitations_text}\n\n"
        )

        if agent.knowledgeContext:
            prompt += f"--- CONHECIMENTO DA EMPRESA / PRODUTOS ---\n{agent.knowledgeContext}\n\n"

        prompt += SafetyGuardrails.get_system_safety_rules()
        return prompt

    @classmethod
    async def _call_gemini(cls, system_prompt: str, history: List[ChatMessage], message: str) -> Optional[str]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        
        contents = []
        for msg in history[-8:]: # Janela de contexto recente
            role = "user" if msg.role == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg.content}]})
        
        contents.append({"role": "user", "parts": [{"text": message}]})

        payload = {
            "contents": contents,
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 800
            }
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        return None

    @classmethod
    async def _call_openai(cls, system_prompt: str, history: List[ChatMessage], message: str) -> Optional[str]:
        url = "https://api.openai.com/v1/chat/completions"
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-8:]:
            role = "assistant" if msg.role == "assistant" else "user"
            messages.append({"role": role, "content": msg.content})
        messages.append({"role": "user", "content": message})

        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 800
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
        return None

    @classmethod
    def _generate_conversational_fallback(cls, agent: AgentConfig, message: str) -> str:
        msg_lower = message.lower()
        
        if any(w in msg_lower for w in ["olá", "ola", "oi", "bom dia", "boa tarde", "boa noite"]):
            return (
                f"Olá! Eu sou {agent.name}, {agent.role}. "
                "É um prazer conversar com você! Como posso te ajudar hoje?"
            )
        
        if any(w in msg_lower for w in ["preço", "quanto custa", "valor", "tabela"]):
            return (
                f"Com certeza! Como {agent.role}, temos soluções personalizadas para o seu momento. "
                "Pode me contar um pouco mais sobre o tamanho da sua operação para que eu te passe a melhor proposta?"
            )

        if any(w in msg_lower for w in ["humano", "atendente", "falar com pessoa", "suporte"]):
            return (
                "Entendido perfeitamente. Vou direcionar nossa conversa para um de nossos especialistas humanos da equipe. "
                "Só um instante enquanto faço a transferência aqui no nosso painel Omnichannel!"
            )

        return (
            f"Entendi seu ponto! Aqui na BipeSend, nós priorizamos exatamente essa agilidade. "
            f"Como {agent.name}, estou à disposição para esclarecer qualquer dúvida e te guiar pelo melhor caminho. "
            "Gostaria de agendar uma breve demonstração prática?"
        )

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Volume2,
  Bot,
  Mic,
  MessageSquare,
  Layers,
  ChevronDown,
  Star,
  Users,
  Menu,
  X,
  Check,
  Clock,
  Smartphone,
  MessageCircle,
  Send,
  Kanban,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileText,
  UploadCloud,
  Headphones,
  CheckCheck,
  ShieldCheck,
  ShoppingBag,
  GraduationCap,
  Truck,
  Globe,
  CreditCard,
  Activity,
  MapPin,
  Bell,
  Zap,
  Calendar,
  MoreHorizontal,
  Camera,
  Music2,
  Paperclip,
  Sliders,
  Shield,
  Tag,
  Lock,
} from "lucide-react";
import { SiteContent, LandingPlan } from "../types/site-content.types";
import { AutomationBuilderShowcase } from "./automation-builder-showcase";
import { CltRoiCalculator } from "./clt-roi-calculator";
import { PricingSection } from "./pricing-section";
import { AnimatedBipeCheck } from "./animated-bipe-check";
import { OrbitalEcosystemDial, EcosystemModuleId } from "./orbital-ecosystem-dial";
import { CookieConsentBanner } from "./cookie-consent-banner";

function resolveAppLink(pathWithQuery: string): string {
  let cleanPath = pathWithQuery;
  try {
    if (pathWithQuery.startsWith("http://") || pathWithQuery.startsWith("https://")) {
      const url = new URL(pathWithQuery);
      cleanPath = url.pathname + url.search;
    }
  } catch {}

  if (typeof window !== "undefined" && window.location.hostname.includes("localhost")) {
    return cleanPath;
  }
  return `https://app.bipesend.com.br${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
}

export function BipeVerifiedBadge({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-label="Selo Verificado BipeSend"
    >
      <defs>
        <linearGradient id="bipeStarBadgeGrad" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007BFF" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* Selo Estrelado com pontas geométricas e acabamento de alto padrão */}
      <path
        d="M12 1.2L14.23 3.69L17.4 2.65L18.08 5.92L21.35 6.6L20.31 9.77L22.8 12L20.31 14.23L21.35 17.4L18.08 18.08L17.4 21.35L14.23 20.31L12 22.8L9.77 20.31L6.6 21.35L5.92 18.08L2.65 17.4L3.69 14.23L1.2 12L3.69 9.77L2.65 6.6L5.92 5.92L6.6 2.65L9.77 3.69Z"
        fill="url(#bipeStarBadgeGrad)"
      />
      {/* Checkmark Branco Nítido */}
      <path
        d="M8.2 12.2L10.8 14.8L16.2 9.2"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Selo de Confirmação/Inclusão Oficial BipeSend em Verde Esmeralda (#10B981 -> #059669)
 * Geometria de estrela de 16 pontas com checkmark nítido, exclusivo para recursos inclusos nos planos comerciais.
 */
export function BipeCheckBadge({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-label="Recurso Incluso"
    >
      <defs>
        <linearGradient id="bipeCheckBadgeGradLanding" x1="1" y1="1" x2="23" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.2L14.23 3.69L17.4 2.65L18.08 5.92L21.35 6.6L20.31 9.77L22.8 12L20.31 14.23L21.35 17.4L18.08 18.08L17.4 21.35L14.23 20.31L12 22.8L9.77 20.31L6.6 21.35L5.92 18.08L2.65 17.4L3.69 14.23L1.2 12L3.69 9.77L2.65 6.6L5.92 5.92L6.6 2.65L9.77 3.69Z"
        fill="url(#bipeCheckBadgeGradLanding)"
      />
      <path
        d="M8.2 12.2L10.8 14.8L16.2 9.2"
        stroke="#FFFFFF"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LandingPageViewProps {
  content: SiteContent;
  plans: LandingPlan[];
  isEditable?: boolean;
  activeSectionKey?: string;
  onSelectSection?: (sectionKey: any) => void;
}

const CLIENT_BRANDS = [
  {
    name: "Nubank",
    category: "Fintech & Serviços Digitais",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#820AD1" />
        <path d="M12 28V12L20.5 28V12M20.5 28L28 12V28" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Natura",
    category: "Cosméticos & Venda Direta",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#F26522" />
        <path d="M20 10C16 14 13 18 13 22C13 25.86 16.14 29 20 29C23.86 29 27 25.86 27 22C27 18 24 14 20 10Z" fill="#FFFFFF" fillOpacity="0.9" />
        <circle cx="20" cy="20" r="3.5" fill="#F26522" />
      </svg>
    ),
  },
  {
    name: "iFood",
    category: "Delivery & Restaurantes",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#EA1D2C" />
        <path d="M11 20C15 26 25 26 29 20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="15" cy="15" r="2" fill="#FFFFFF"/>
        <circle cx="25" cy="15" r="2" fill="#FFFFFF"/>
      </svg>
    ),
  },
  {
    name: "Localiza",
    category: "Mobilidade & Frotas",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#008239" />
        <path d="M14 14L22 20L14 26M20 14L28 20L20 26" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "C&A Modas",
    category: "Varejo & E-commerce",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#003B95" />
        <circle cx="20" cy="20" r="11" stroke="#FFFFFF" strokeWidth="2"/>
        <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif">C&amp;A</text>
      </svg>
    ),
  },
  {
    name: "QuintoAndar",
    category: "Imóveis & Proptech",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#001E62" />
        <path d="M13 28V16L20 11L27 16V28H22V20H18V28H13Z" fill="#38BDF8"/>
      </svg>
    ),
  },
  {
    name: "Stone Pagamentos",
    category: "Fintech & Adquirência",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#00A868" />
        <path d="M20 11L29 16V24L20 29L11 24V16L20 11Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="20" cy="20" r="3" fill="#FFFFFF"/>
      </svg>
    ),
  },
  {
    name: "Grupo Boticário",
    category: "Beleza & Cosméticos",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#00675B" />
        <path d="M20 11C24.5 11 28 14.5 28 19C28 24 23 27 20 29C17 27 12 24 12 19C12 14.5 15.5 11 20 11Z" fill="#FFFFFF" fillOpacity="0.9" />
        <path d="M20 15V25M16 19H24" stroke="#00675B" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: "Movida",
    category: "Locação de Veículos",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#FF5000" />
        <path d="M12 27V13L20 22L28 13V27" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: "Reserva",
    category: "Moda & Vestuário",
    renderLogo: () => (
      <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#0F172A" />
        <path d="M16 27L20 13L26 21L21 21L24 27H16Z" fill="#EA580C"/>
      </svg>
    ),
  },
];

export function LandingPageView({
  content,
  plans,
  isEditable = false,
  activeSectionKey,
  onSelectSection,
}: LandingPageViewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPlayingHuman, setIsPlayingHuman] = useState(false);
  const [isPlayingRobot, setIsPlayingRobot] = useState(false);

  // Showcase Tabs state (Rotary Dial Geométrico com os módulos principais)
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<EcosystemModuleId>("crm_plus");
  const [selectedFaqId, setSelectedFaqId] = useState<string>(content.faq.items[0]?.id || "");
  const [showStickyMobile, setShowStickyMobile] = useState(false);

  // Áudio real carregado pelo usuário: /assets/voz-feminina-copy-opna.mp3
  const realAudioRef = useRef<HTMLAudioElement | null>(null);

  // Testimonials Carousel Tracks
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  const scrollTrack = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Simulação dinâmica e realista da conversa no Hero (Executa 1 vez ao entrar)
  const [chatSimStep, setChatSimStep] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Passo 0: Camila digitando por 1.0s -> envia mensagem
    if (chatSimStep === 0) {
      const t0 = setTimeout(() => setChatSimStep(1), 1000);
      return () => clearTimeout(t0);
    }
    // Passo 1: Germani digitando por 1.4s -> envia texto "Olá Camila! Temos sim..."
    if (chatSimStep === 1) {
      const t1 = setTimeout(() => setChatSimStep(2), 1400);
      return () => clearTimeout(t1);
    }
    // Passo 2: Germani gravando áudio por 1.6s -> envia áudio de 0:14
    if (chatSimStep === 2) {
      const t2 = setTimeout(() => setChatSimStep(3), 1600);
      return () => clearTimeout(t2);
    }
    // Passo 3: Germani digitando por 1.3s -> envia miniaturas do produto e botão de compra
    if (chatSimStep === 3) {
      const t3 = setTimeout(() => setChatSimStep(4), 1300);
      return () => clearTimeout(t3);
    }
    // Passo 4: Camila digitando por 1.6s -> envia "Vou finalizar a compra"
    if (chatSimStep === 4) {
      const t4 = setTimeout(() => setChatSimStep(5), 1600);
      return () => clearTimeout(t4);
    }
    // Passo 5: Breve processamento no Gateway (700ms) -> mostra cartão de pagamento aprovado
    if (chatSimStep === 5) {
      const t5 = setTimeout(() => setChatSimStep(6), 700);
      return () => clearTimeout(t5);
    }
    // Passo 6: Finaliza e permanece estável (sem repetição automática)
  }, [chatSimStep]);

  // Scroll suave automático dentro da caixa de chat ao avançar cada passo
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatSimStep]);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyMobile(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Limpeza de áudio e síntese vocal ao desmontar o componente
  useEffect(() => {
    return () => {
      if (realAudioRef.current) {
        realAudioRef.current.pause();
        realAudioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const fallbackSpeechSynthesis = (phraseToSpeak?: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const rawPhrase =
          phraseToSpeak ||
          "Oi Camila tudo bem Como disse acima temos disponível aqui abaixo vou enviar o kit juntamente com os valores para você ver";
        // Remove vírgulas e pontuação para evitar bug de browser falar 'vírgula'
        const sanitized = rawPhrase
          .replace(/[,;:]/g, " ")
          .replace(/[.!?]/g, ". ")
          .replace(/\s+/g, " ")
          .trim();
        const utterance = new SpeechSynthesisUtterance(sanitized);
        utterance.lang = "pt-BR";
        utterance.rate = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const ptVoice = voices.find((v) => v.lang.includes("pt-BR") || v.lang.includes("pt"));
        if (ptVoice) utterance.voice = ptVoice;
        utterance.onend = () => setIsPlayingHuman(false);
        utterance.onerror = () => setIsPlayingHuman(false);
        window.speechSynthesis.speak(utterance);
        return;
      } catch {}
    }
    setTimeout(() => setIsPlayingHuman(false), 2500);
  };

  const playSimulatedAudio = (type: "chat" | "human" | "robot") => {
    if (typeof window === "undefined") return;

    if (type === "chat" || type === "human") {
      const audioSrc =
        type === "chat"
          ? "/assets/audio-chat-camila.wav"
          : "/assets/audio-proposta-germani.wav";

      // Se já estiver tocando, pausa
      if (isPlayingHuman) {
        if (realAudioRef.current) {
          realAudioRef.current.pause();
          realAudioRef.current.currentTime = 0;
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        setIsPlayingHuman(false);
        return;
      }

      // Parar áudio robô se estiver tocando
      if (isPlayingRobot) {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        setIsPlayingRobot(false);
      }

      // Tocar arquivo de áudio WAV clonado de alta fidelidade
      try {
        const audio = new Audio(audioSrc);
        audio.preload = "auto";
        audio.onended = () => setIsPlayingHuman(false);
        audio.onerror = () => {
          console.warn(`Fallback para áudio secundário ou síntese limpa (${audioSrc})...`);
          const fallbackAudio = new Audio("/assets/germani.wav");
          fallbackAudio.onended = () => setIsPlayingHuman(false);
          fallbackAudio.onerror = () => {
            fallbackSpeechSynthesis(
              type === "chat"
                ? "Oi Camila tudo bem Como disse acima temos disponível aqui abaixo vou enviar o kit juntamente com os valores para você ver"
                : "Oi Que bom falar com você Já preparei sua proposta com condições exclusivas e desconto especial Como posso te ajudar a fechar agora"
            );
          };
          realAudioRef.current = fallbackAudio;
          fallbackAudio.play().catch(() => fallbackSpeechSynthesis());
        };

        realAudioRef.current = audio;
        setIsPlayingHuman(true);
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay bloqueado pelo navegador:", err);
            setIsPlayingHuman(false);
          });
        }
        return;
      } catch (err) {
        console.warn("Exceção no player de áudio:", err);
        fallbackSpeechSynthesis();
        return;
      }
    }

    // Áudio Robô Convencional (antigo) para contraste de qualidade
    if (type === "robot") {
      if (isPlayingRobot) {
        if ("speechSynthesis" in window) window.speechSynthesis.cancel();
        setIsPlayingRobot(false);
        return;
      }
      if (isPlayingHuman) {
        if (realAudioRef.current) {
          realAudioRef.current.pause();
          realAudioRef.current.currentTime = 0;
        }
        setIsPlayingHuman(false);
      }
      setIsPlayingRobot(true);

      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const phrase =
            "Aguarde na linha... Sua chamada é a de número 34 na fila de espera... Redirecionando para atendente disponível...";
          const utterance = new SpeechSynthesisUtterance(phrase);
          utterance.lang = "pt-BR";
          utterance.rate = 0.85;
          utterance.pitch = 0.6;
          utterance.onend = () => setIsPlayingRobot(false);
          utterance.onerror = () => setIsPlayingRobot(false);
          window.speechSynthesis.speak(utterance);
          return;
        } catch {}
      }
      setTimeout(() => setIsPlayingRobot(false), 2400);
    }
  };

  return (
    <div className="w-full bg-[#FAFCFF] text-[#0F172A] font-poppins antialiased selection:bg-[#007BFF] selection:text-white pb-20 sm:pb-0">
      
      {/* ── 1. Top Announcement Bar ── */}
      {content.announcement.enabled && (
        <aside
          aria-label="Aviso da plataforma"
          className="w-full bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white py-2 px-3 sm:px-4 text-center text-[11.5px] sm:text-xs font-medium border-b border-slate-800"
        >
          <div className="max-w-[1440px] mx-auto flex items-center justify-center gap-2 flex-wrap">
            <span className="bg-[#007BFF] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {content.announcement.badge}
            </span>
            <span>{content.announcement.text}</span>
            <a
              href={content.announcement.linkUrl}
              className="text-[#38BDF8] hover:text-white font-semibold inline-flex items-center gap-1 hover:underline ml-1"
            >
              <span>{content.announcement.linkText}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </aside>
      )}

      {/* ── 2. Header & Navegação ── */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[70px] flex items-center justify-between gap-4">
          
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="BipeSend Início">
            <Image
              src="/assets/brand/bipesend-logovertical-preto-webp.webp"
              alt="BipeSend - Inteligência Artificial e CRM Conversacional"
              width={142}
              height={38}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-[13px] font-semibold text-slate-600">
            <a href="#produtos" className="hover:text-[#007BFF] transition-colors">
              Produtos
            </a>
            <a href="#automacoes" className="hover:text-[#007BFF] transition-colors flex items-center gap-1.5 font-bold text-[#007BFF]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Automações
            </a>
            <a href="#demonstracao" className="hover:text-[#007BFF] transition-colors">
              Voz Real
            </a>
            <a href="#calculadora" className="hover:text-[#007BFF] transition-colors">
              Calculadora
            </a>
            <a href="#planos" className="hover:text-[#007BFF] transition-colors">
              Planos
            </a>
            <a href="#sobre" className="hover:text-[#007BFF] transition-colors">
              Sobre Nós
            </a>
            <a href="#depoimentos" className="hover:text-[#007BFF] transition-colors">
              Casos Reais
            </a>
            <a href="#faq" className="hover:text-[#007BFF] transition-colors">
              FAQ
            </a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <a
              href={resolveAppLink("/login")}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-[#007BFF] hover:bg-slate-50 rounded-xl transition-all"
            >
              Fazer Login
            </a>
            <a
              href="#planos"
              className="figma-shimmer-btn inline-flex items-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-[0_4px_16px_rgba(0,123,255,0.25)] hover:shadow-[0_6px_20px_rgba(0,123,255,0.35)] transition-all hover:-translate-y-0.5"
            >
              <span>Criar Conta Gratuita</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#007BFF] hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-5 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-700">
              <a href="#produtos" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                Produtos
              </a>
              <a href="#automacoes" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF] flex items-center gap-1.5 font-semibold text-[#007BFF]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Automações
              </a>
              <a href="#demonstracao" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                Voz Real
              </a>
              <a href="#calculadora" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                Calculadora
              </a>
              <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                Planos
              </a>
              <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                Sobre Nós
              </a>
              <a href="#depoimentos" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                Casos Reais
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#007BFF]">
                FAQ
              </a>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <a
                href={resolveAppLink("/login")}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Fazer Login
              </a>
              <a
                href="#planos"
                onClick={() => setMobileMenuOpen(false)}
                className="figma-shimmer-btn w-full text-center py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#007BFF] to-[#6366F1] rounded-xl shadow-md"
              >
                Criar Conta Gratuita
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── 3. HERO SECTION (Modelo AIDA Pro+ em 2 Colunas com Foco em Conversão & Benefícios) ── */}
      <section className="relative pt-10 sm:pt-14 md:pt-18 pb-14 sm:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* LADO ESQUERDO: Copy AIDA Pro+ de Alto Impacto Guiada por Benefícios */}
            <div className="lg:col-span-6 order-1 lg:order-1 space-y-6 text-left">
              
              {/* Atenção: Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-[0_2px_8px_rgba(0,123,255,0.08)]">
                <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-ping" />
                <span className="text-xs font-bold text-[#007BFF] tracking-wide">
                  {content.hero.badge}
                </span>
              </div>

              {/* Atenção: Headline Magnética */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] font-extrabold text-[#0F172A] font-inter tracking-tight leading-[1.14]">
                {content.hero.titleLine1}{" "}
                <span className="bg-gradient-to-r from-[#007BFF] via-[#4F46E5] to-[#6366F1] bg-clip-text text-transparent">
                  {content.hero.titleHighlight}
                </span>{" "}
                {content.hero.titleLine2}
              </h1>

              {/* Interesse: Subtítulo Persuasivo */}
              <p className="text-[15px] sm:text-[16px] md:text-[17px] text-slate-600 leading-relaxed font-normal">
                {content.hero.subtitle}
              </p>

              {/* Desejo: Destaques de Benefícios Concretos com Checks Animados Bipe */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium group">
                  <AnimatedBipeCheck size={20} className="mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold font-inter">Atendimento com Voz Humana em &lt; 3s:</strong>{" "}
                    <span>Sua agente de IA atende 24 horas, esclarece dúvidas e grava áudios na hora com voz natural.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium group">
                  <AnimatedBipeCheck size={20} className="mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold font-inter">Campanhas Multicanal Anti-Bloqueio:</strong>{" "}
                    <span>Dispare mensagens e acompanhe conversas no WhatsApp Oficial, Instagram e TikTok com aquecimento seguro.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium group">
                  <AnimatedBipeCheck size={20} className="mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold font-inter">Checkout Transparente no Chat:</strong>{" "}
                    <span>Apresente fotos de produtos e envie link de pagamento Pix ou Cartão para fechar vendas em 1 clique.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 font-medium group">
                  <AnimatedBipeCheck size={20} className="mt-0.5" />
                  <div>
                    <strong className="text-slate-900 font-semibold font-inter">CRM Plus Kanban &amp; App Mobile:</strong>{" "}
                    <span>Qualificação automática de leads, funis sincronizados em tempo real e controle total para a sua equipe.</span>
                  </div>
                </div>
              </div>

              {/* Ação: Botões de Conversão */}
              <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-3">
                <a
                  href={content.hero.primaryCtaLink?.startsWith("#") ? content.hero.primaryCtaLink : "#planos"}
                  className="figma-shimmer-btn w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-[0_4px_20px_rgba(0,123,255,0.25)] hover:shadow-[0_8px_25px_rgba(0,123,255,0.35)] transition-all hover:-translate-y-0.5"
                >
                  <span>{content.hero.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href={content.hero.secondaryCtaLink?.startsWith("#") ? content.hero.secondaryCtaLink : "#automacoes"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-slate-300/80 text-slate-700 px-6 py-4 rounded-2xl text-sm font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-slate-400 transition-all"
                >
                  <Play className="w-4 h-4 text-[#007BFF] fill-[#007BFF]" />
                  <span>{content.hero.secondaryCtaText}</span>
                </a>
              </div>

              {/* Badges de Confiança Solicitados */}
              <div className="flex items-center gap-3 sm:gap-5 text-xs text-slate-600 pt-2 flex-wrap font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#007BFF]" />
                  Protocolo anti-bloqueio
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-[#6366F1]" />
                  Suporte especializado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Fácil configuração
                </span>
              </div>

            </div>

            {/* LADO DIREITO: Mockup Interativo Visual de Atendimento em Tempo Real */}
            <div className="lg:col-span-6 order-2 lg:order-2 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                
                {/* Janela Principal do WhatsApp / Atendimento da Agente */}
                <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_20px_60px_rgba(0,123,255,0.12)] overflow-hidden">
                  
                  {/* Topo do Chat Oficial */}
                  <div className="bg-[#0F172A] p-3.5 sm:p-4 text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {/* Moldura de perfil: quadrado com cantos sutilmente arredondados */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 shadow-sm shrink-0">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani - Sua Agente BipeSend"
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0F172A]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm font-inter">Germani</span>
                          <BipeVerifiedBadge size={16} />
                        </div>
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChatSimStep(0);
                      }}
                      className="text-[10px] bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-1 rounded-md text-slate-300 font-mono flex items-center gap-1.5 cursor-pointer"
                      title="Clique para reiniciar a simulação"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Reiniciar simulação</span>
                    </button>
                  </div>

                  {/* Histórico da Conversa Dinâmica: Camila Duarte e Germani */}
                  <div
                    ref={chatContainerRef}
                    className="p-3.5 sm:p-4 space-y-3 bg-[#F8FAFC] h-[480px] sm:h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-track-transparent flex flex-col justify-start"
                  >
                    
                    {/* Passo 0: Indicador de Camila Digitando */}
                    {chatSimStep === 0 && (
                      <div className="flex items-start gap-2.5 max-w-[85%] animate-in fade-in duration-200">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-100 mt-0.5">
                          <Image
                            src="/assets/demo/cliente-ugc-camila.jpg"
                            alt="Camila Duarte"
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 py-2 px-3 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-slate-500 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-600">Camila está digitando</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mensagem da Cliente (Camila Duarte) */}
                    {chatSimStep >= 1 && (
                      <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] animate-in fade-in duration-300">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-100 mt-0.5">
                          <Image
                            src="/assets/demo/cliente-ugc-camila.jpg"
                            alt="Camila Duarte"
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-slate-800 space-y-1">
                          <span className="font-bold text-[11px] text-slate-500 block">Camila Duarte</span>
                          <p className="leading-snug">
                            Oi! Tem o combo de Perfume + Hidratante a pronta entrega?
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[9.5px] text-slate-400 font-mono">
                            <span>14:32</span>
                            <CheckCheck className="w-3 h-3 text-[#007BFF]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Passo 1: Indicador de Germani Digitando */}
                    {chatSimStep === 1 && (
                      <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse animate-in fade-in duration-200">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-200/90 shadow-2xs shrink-0 mt-0.5">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani"
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 py-2 px-3 rounded-2xl rounded-tr-xs shadow-xs text-xs text-slate-500 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-600">Germani está digitando</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Passo 2: Resposta em Texto da Germani */}
                    {chatSimStep >= 2 && (
                      <div className="flex items-start gap-2.5 max-w-[96%] sm:max-w-[92%] ml-auto flex-row-reverse animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-200/90 shadow-2xs shrink-0 mt-0.5">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani"
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-md space-y-1.5 text-xs w-full">
                          <div className="flex items-center justify-between text-[10px] text-blue-100">
                            <span className="font-semibold flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                              Resposta em 1.4s
                            </span>
                            <span className="font-mono">14:32</span>
                          </div>
                          
                          <p className="leading-relaxed">
                            Olá Camila! Temos sim o <strong>Kit Duo Floral</strong> a pronta entrega com frete grátis hoje:
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Passo 2: Indicador de Germani Gravando Áudio */}
                    {chatSimStep === 2 && (
                      <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse animate-in fade-in duration-200">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-200/90 shadow-2xs shrink-0 mt-0.5">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani"
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 py-2 px-3 rounded-2xl rounded-tr-xs shadow-xs text-xs text-emerald-700 flex items-center gap-2">
                          <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span className="text-[11px] font-medium text-emerald-800">Germani gravando áudio...</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Passo 3: Áudio Enviado com Voz Natural */}
                    {chatSimStep >= 3 && (
                      <div className="flex items-start gap-2.5 max-w-[96%] sm:max-w-[88%] ml-auto flex-row-reverse animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-200/90 shadow-2xs shrink-0 mt-0.5">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani"
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-2xl rounded-tr-xs shadow-md space-y-2 text-xs w-full max-w-[320px]">
                          <div className="flex items-center justify-between text-[10px] text-blue-100">
                            <span className="font-semibold flex items-center gap-1">
                              <Mic className="w-3 h-3 text-emerald-300" />
                              Áudio com Voz Natural IA
                            </span>
                            <span className="font-mono">14:32</span>
                          </div>

                          {/* Player de Áudio Estilo WhatsApp */}
                          <div className="bg-white/10 rounded-xl p-2.5 flex items-center gap-2.5 border border-white/15">
                            <button
                              type="button"
                              onClick={() => playSimulatedAudio("chat")}
                              className="w-8 h-8 rounded-full bg-white text-[#007BFF] hover:bg-blue-50 flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 cursor-pointer"
                              aria-label={isPlayingHuman ? "Pausar áudio" : "Ouvir áudio da Germani"}
                            >
                              {isPlayingHuman ? (
                                <Pause className="w-4 h-4 fill-[#007BFF]" />
                              ) : (
                                <Play className="w-4 h-4 fill-[#007BFF] ml-0.5" />
                              )}
                            </button>

                            {/* Barras de Áudio */}
                            <div className="flex-1 flex items-center gap-1 h-5">
                              {[40, 75, 55, 90, 65, 80, 45, 95, 70, 60, 85, 50, 65, 40].map((h, idx) => (
                                <span
                                  key={idx}
                                  style={{ height: `${isPlayingHuman ? Math.max(25, (h * (idx % 2 === 0 ? 1.2 : 0.8)) % 100) : h}%` }}
                                  className={`w-1 rounded-full transition-all duration-200 ${
                                    isPlayingHuman ? "bg-emerald-300 animate-pulse" : "bg-white/80"
                                  }`}
                                />
                              ))}
                            </div>

                            <span className="text-[11px] font-mono text-blue-100 shrink-0 font-medium">
                              0:10
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[9.5px] text-blue-100/90 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              Áudio personalizado na hora
                            </span>
                            <span className="flex items-center gap-1 text-emerald-300 font-medium">
                              <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                              Ouvido
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Passo 3: Indicador de Germani Digitando para Miniaturas e Botão de Compra */}
                    {chatSimStep === 3 && (
                      <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse animate-in fade-in duration-200">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-200/90 shadow-2xs shrink-0 mt-0.5">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani"
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 py-2 px-3 rounded-2xl rounded-tr-xs shadow-xs text-xs text-slate-500 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-600">Germani está digitando</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#007BFF] animate-bounce" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Passo 4: Mensagem com 2 Miniaturas e Botão de Finalizar Compra */}
                    {chatSimStep >= 4 && (
                      <div className="flex items-start gap-2.5 max-w-[96%] sm:max-w-[92%] ml-auto flex-row-reverse animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-800 border border-slate-200/90 shadow-2xs shrink-0 mt-0.5">
                          <Image
                            src="/assets/brand/germani-avatar.jpg"
                            alt="Germani"
                            width={28}
                            height={28}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="bg-white rounded-2xl rounded-tr-xs p-3 sm:p-3.5 text-slate-800 space-y-2 border border-slate-200/90 shadow-sm w-full">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1 border-b border-slate-100">
                            <span className="font-bold text-slate-700">Kit Duo Floral Promocional</span>
                            <span className="font-mono">14:32</span>
                          </div>

                          {/* 2 Miniaturas Lado a Lado dos Produtos */}
                          <div className="grid grid-cols-2 gap-2">
                            {/* Miniatura 1: Perfume Floral Rose */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5 flex items-center gap-2">
                              <div className="relative w-11 h-11 rounded-md overflow-hidden bg-slate-900 shrink-0 border border-slate-200/60">
                                <Image
                                  src="/assets/demo/produto-perfume-rose.jpg"
                                  alt="Perfume Floral Aura 50ml"
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-slate-900 block truncate font-inter">
                                  Aura Rose
                                </span>
                                <span className="text-[9px] text-slate-500 block">
                                  Perfume 50ml
                                </span>
                              </div>
                            </div>

                            {/* Miniatura 2: Hidratante Satin */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-1.5 flex items-center gap-2">
                              <div className="relative w-11 h-11 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 flex items-center justify-center p-0.5">
                                <Image
                                  src="/assets/demo/produto-hidratante-rose.svg"
                                  alt="Hidratante Satin 200ml"
                                  width={40}
                                  height={40}
                                  className="object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-slate-900 block truncate font-inter">
                                  Satin Body
                                </span>
                                <span className="text-[9px] text-slate-500 block">
                                  Loção 200ml
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Linha de Preço do Kit */}
                          <div className="flex items-center justify-between px-1 pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Frete Grátis
                              </span>
                              <span className="text-[10.5px] text-slate-600 font-medium">
                                Combo Especial
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 font-inter">
                                R$ 189,90
                              </span>
                              <span className="text-[9px] text-slate-400 block -mt-0.5">
                                ou 3x R$ 63,30
                              </span>
                            </div>
                          </div>

                          {/* Botão de Checkout Transparente: Pix */}
                          <a
                            href="#planos"
                            className="figma-shimmer-btn w-full py-2.5 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.01]"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pagar Agora no Pix (R$ 189,90)</span>
                          </a>
                          <span className="text-[9.5px] text-slate-400 flex items-center justify-center gap-1 text-center pt-0.5">
                            <Lock className="w-3 h-3 text-slate-400" />
                            Checkout transparente seguro BipePay
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Passo 4: Indicador de Camila Digitando */}
                    {chatSimStep === 4 && (
                      <div className="flex items-start gap-2.5 max-w-[85%] animate-in fade-in duration-200">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-100 mt-0.5">
                          <Image
                            src="/assets/demo/cliente-ugc-camila.jpg"
                            alt="Camila Duarte"
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 py-2 px-3 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-slate-500 flex items-center gap-2">
                          <span className="text-[11px] font-medium text-slate-600">Camila está digitando</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Passo 5: Mensagem da Camila: Vou finalizar a compra */}
                    {chatSimStep >= 5 && (
                      <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-100 mt-0.5">
                          <Image
                            src="/assets/demo/cliente-ugc-camila.jpg"
                            alt="Camila Duarte"
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 p-3 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-slate-800 space-y-1">
                          <span className="font-bold text-[11px] text-slate-500 block">Camila Duarte</span>
                          <p className="leading-snug font-medium">
                            Vou finalizar a compra
                          </p>
                          <div className="flex items-center justify-end gap-1 text-[9.5px] text-slate-400 font-mono">
                            <span>14:33</span>
                            <CheckCheck className="w-3 h-3 text-[#007BFF]" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Passo 5: Processamento Imediato no Gateway via API */}
                    {chatSimStep === 5 && (
                      <div className="flex items-center justify-center py-1 animate-in fade-in duration-150">
                        <div className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-3 py-1 rounded-full border border-emerald-200/80 flex items-center gap-2 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>Validando pagamento via API junto ao Gateway...</span>
                        </div>
                      </div>
                    )}

                    {/* Passo 6: Verificação no Chat de Compra Aprovada com Check */}
                    {chatSimStep >= 6 && (
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border border-emerald-300/80 rounded-2xl p-3 sm:p-3.5 text-slate-800 space-y-2 shadow-xs animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-extrabold text-emerald-950 font-inter truncate">
                                Pagamento Pix Aprovado • R$ 189,90
                              </span>
                              <BipeVerifiedBadge size={14} />
                            </div>
                            <span className="text-[10.5px] text-emerald-700 font-medium block">
                              Integração validada via API junto ao Gateway
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/90 rounded-xl p-2 flex items-center justify-between text-[10px] text-slate-600 border border-emerald-200/60 font-mono">
                          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Webhook Instantâneo
                          </span>
                          <span className="text-slate-500 font-semibold">BipePay #9842</span>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Rodapé de Status do Chat */}
                  <div className="bg-white p-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-blue-600">
                      <Clock className="w-3.5 h-3.5" />
                      {chatSimStep >= 6 ? "Venda aprovada no Gateway" : chatSimStep >= 4 ? "Qualificação e checkout enviados" : "Atendimento autônomo ativo"}
                    </span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {chatSimStep >= 6 ? "Venda Ganha no CRM" : chatSimStep >= 4 ? "Lead sincronizado no CRM" : "Sincronizando..."}
                    </span>
                  </div>
                </div>

                {/* Card Flutuante 1: Notificação do CRM Bipe Plus Atualizado */}
                <div className="mt-3 sm:mt-0 sm:absolute sm:-bottom-6 sm:-right-5 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xl sm:max-w-[270px] animate-in fade-in slide-in-from-bottom-2 duration-300 z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      CRM Bipe Plus Atualizado
                    </span>
                  </div>
                  <strong className="text-xs text-slate-800 block font-inter truncate">
                    Camila Duarte (Kit Duo)
                  </strong>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-1 mt-1 border-t border-slate-100">
                    <span className="text-emerald-600 font-bold">R$ 189,90</span>
                    <span className="text-[10px] text-slate-400">
                      {chatSimStep >= 6 ? "Etapa: Pago & Aprovado" : chatSimStep >= 4 ? "Etapa: Checkout Enviado" : "Etapa: Em Atendimento"}
                    </span>
                  </div>
                </div>

                {/* Card Flutuante 2: Indicador de Resposta Rápida */}
                <div className="hidden sm:flex absolute -top-3.5 left-6 bg-[#0F172A] text-white px-3.5 py-1.5 rounded-full shadow-xl items-center gap-2 border border-slate-700/80 z-20">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span className="text-xs font-bold font-inter tracking-wide">Atendimento em &lt; 3 seg</span>
                </div>

              </div>
            </div>

          </div>

          {/* ── 3.1 DEMONSTRAÇÃO INTERATIVA DO ECOSSISTEMA (Tabs Interativas dos Produtos) ── */}
          {/* ── 3.1 DEMONSTRAÇÃO INTERATIVA DO ECOSSISTEMA (Rotary Dial Geométrico & Módulos) ── */}
          <div id="produtos" className="mt-14 sm:mt-20 max-w-5xl mx-auto">
            
            {/* Seletor Orbital Geométrico Refinado */}
            <OrbitalEcosystemDial
              activeModule={activeShowcaseTab}
              onSelectModule={(id) => setActiveShowcaseTab(id)}
            />

            {/* Canvas do Mockup do Produto Ativo */}
            <div
              id={`tabpanel-${activeShowcaseTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeShowcaseTab}`}
              className="relative bg-white rounded-[28px] border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden p-3 sm:p-5 mt-6"
            >
              
              {/* Barra superior estilo navegador */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">
                    app.bipesend.com.br/{activeShowcaseTab === "crm_plus" ? "crm" : activeShowcaseTab === "inbox" ? "inbox" : activeShowcaseTab === "ai_train" ? "ai" : activeShowcaseTab === "campaigns" ? "campaigns" : "mobile"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ecossistema Ativo • 24 Horas
                  </span>
                </div>
              </div>

              {/* CONTEÚDO DA ABA 1: CRM BIPE PLUS */}
              {activeShowcaseTab === "crm_plus" && (
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-6 border border-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 font-inter">
                        CRM Bipe Plus de Vendas — Visual Integrado ao Ecossistema
                      </h3>
                      <p className="text-xs text-slate-500">
                        Pipeline de negociação com identificação de canal, tags inteligentes, responsável e movimentação em tempo real.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        VGV Projetado: R$ 518.200,00 • 46 Negócios
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-start">
                    
                    {/* Coluna 1: Novos Leads */}
                    <div className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#007BFF]" />
                          <span>Novos Leads</span>
                        </div>
                        <span className="bg-white text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs border border-slate-200">
                          14
                        </span>
                      </div>

                      {/* Card 1 - Novos Leads */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #007BFF" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Carlos Alberto • Imóvel Zona Sul
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            VIP
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                            Primeiro Contato
                          </span>
                        </div>

                        {/* Contato & Canal */}
                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-[#007BFF] flex items-center justify-center font-bold text-[9px] shrink-0">
                            CA
                          </div>
                          <span className="truncate font-medium text-slate-700">Carlos Alberto</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        {/* Rodapé do Card */}
                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tabular-nums">
                            R$ 480.000,00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 28 set
                            </span>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Marcos">
                              M
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 - Novos Leads */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #007BFF" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Dra. Camila Valente • Estética
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                            Harmonização
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                            Quente
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                            CV
                          </div>
                          <span className="truncate font-medium text-slate-700">Dra. Camila</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200/60 font-medium">
                            <Camera className="w-3 h-3" />
                            Instagram
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tabular-nums">
                            R$ 3.800,00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 29 set
                            </span>
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Juliana">
                              J
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Coluna 2: Qualificados por IA */}
                    <div className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                          <span>Qualificados por IA</span>
                        </div>
                        <span className="bg-white text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs border border-slate-200">
                          8
                        </span>
                      </div>

                      {/* Card 1 - Qualificados por IA */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #6366F1" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Lucas Silveira • Burger Prime
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Áudio Enviado
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/60">
                            Score 9.6
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                            LS
                          </div>
                          <span className="truncate font-medium text-slate-700">Lucas Silveira</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tabular-nums">
                            R$ 2.450,00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 30 set
                            </span>
                            <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 flex items-center justify-center text-[9px] font-bold" title="Agente de IA">
                              IA
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 - Qualificados por IA */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #6366F1" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Gabriel Nogueira • TechHouse
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            Reparo Celulares
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                            Tabela Enviada
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                            GN
                          </div>
                          <span className="truncate font-medium text-slate-700">Gabriel N.</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 font-medium">
                            <Music2 className="w-3 h-3" />
                            TikTok
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tabular-nums">
                            R$ 1.890,00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 01 out
                            </span>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Marcos">
                              M
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Coluna 3: Em Proposta */}
                    <div className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                          <span>Em Proposta</span>
                        </div>
                        <span className="bg-white text-slate-700 font-mono font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs border border-slate-200">
                          5
                        </span>
                      </div>

                      {/* Card 1 - Em Proposta */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #F59E0B" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Dr. Marcelo Castro • Odonto
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                            PDF 1.4 MB
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            Áudio 18s
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                            MC
                          </div>
                          <span className="truncate font-medium text-slate-700">Dr. Marcelo</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tabular-nums">
                            R$ 4.850,00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 02 out
                            </span>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Marcos">
                              M
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 - Em Proposta */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #F59E0B" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Felipe Barreto • Studio Detail
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            Vitrificação
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                            Aguardando Pagamento
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-[9px] shrink-0">
                            FB
                          </div>
                          <span className="truncate font-medium text-slate-700">Felipe Barreto</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded tabular-nums">
                            R$ 6.200,00
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> 03 out
                            </span>
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Juliana">
                              J
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Coluna 4: Ganho (Fechado) */}
                    <div className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 pb-1.5 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                          <span>Fechamento Ganho</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 font-mono font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs border border-emerald-200">
                          19
                        </span>
                      </div>

                      {/* Card 1 - Ganho */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #10B981" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Giovanni Rossi • Bella Napoli
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Contrato Assinado
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                            Ativação Imediata
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                            GR
                          </div>
                          <span className="truncate font-medium text-slate-700">Giovanni Rossi</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded tabular-nums flex items-center gap-1">
                            R$ 3.900,00
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-600 font-semibold">Hoje</span>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Marcos">
                              M
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 2 - Ganho */}
                      <div
                        className="bg-white rounded-xl p-3 shadow-xs border border-slate-200/80 space-y-2.5 hover:shadow-md transition-all text-left"
                        style={{ borderLeft: "4px solid #10B981" }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h5 className="text-[13px] font-bold text-slate-900 leading-snug tracking-tight hover:text-[#007BFF] transition-colors cursor-pointer">
                            Dr. Roberto Leite • Hospital
                          </h5>
                          <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5" aria-label="Ações do lead">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Plano Anual Pago
                          </span>
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
                            6 Secretárias
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[9px] shrink-0">
                            RL
                          </div>
                          <span className="truncate font-medium text-slate-700">Dr. Roberto</span>
                          <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                          </span>
                        </div>

                        <div className="h-px w-full bg-slate-100" />

                        <div className="flex items-center justify-between text-[11.5px]">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded tabular-nums flex items-center gap-1">
                            R$ 22.000,00
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-emerald-600 font-semibold">Ontem</span>
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[9px] font-bold" title="Responsável: Juliana">
                              J
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA 2: INBOX OMNICHANNEL */}
              {activeShowcaseTab === "inbox" && (
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-6 border border-slate-100 flex flex-col md:flex-row gap-5">
                  
                  {/* Barra Lateral de Conversas (Inbox Panel) */}
                  <div className="w-full md:w-5/12 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-left">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Caixa Unificada
                        </span>
                        <span className="text-[11px] text-slate-400">4 canais conectados</span>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        BipeSend WhatsApp API
                      </span>
                    </div>

                    <div className="space-y-2">
                      
                      {/* Conversa 1: Ativa - Dra. Vanessa Mendes */}
                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 cursor-pointer shadow-2xs">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            VM
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-bold">
                            ✓
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">Dra. Vanessa Mendes</span>
                            <span className="text-[10px] text-blue-600 font-bold">10:42</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 my-0.5">
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded font-medium">WhatsApp</span>
                            <span className="truncate">Odontologia &amp; Lentes</span>
                          </div>
                          <p className="text-[11.5px] text-slate-700 font-medium truncate">
                            Perfeito! Pode me enviar a proposta em PDF e o áudio explicativo?
                          </p>
                        </div>
                      </div>

                      {/* Conversa 2: Instagram Direct */}
                      <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-start gap-3 cursor-pointer transition-colors">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            CV
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">Dra. Camila Valente</span>
                            <span className="text-[10px] text-slate-400">10:38</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 my-0.5">
                            <span className="text-pink-700 bg-pink-50 border border-pink-200 px-1 rounded font-medium">Instagram</span>
                            <span className="truncate">Clínica Valente</span>
                          </div>
                          <p className="text-[11.5px] text-slate-500 truncate">
                            Qual o valor do plano para 2 atendentes e envio de fotos antes/depois?
                          </p>
                        </div>
                      </div>

                      {/* Conversa 3: Hamburgueria */}
                      <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-start gap-3 cursor-pointer transition-colors">
                        <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          LS
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">Lucas Silveira</span>
                            <span className="text-[10px] text-slate-400">10:15</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 my-0.5">
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded font-medium">WhatsApp</span>
                            <span className="truncate">Burger Prime</span>
                          </div>
                          <p className="text-[11.5px] text-slate-500 truncate">
                            A agente já disparou o cardápio da sexta para 340 contatos!
                          </p>
                        </div>
                      </div>

                      {/* Conversa 4: TechHouse */}
                      <div className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 flex items-start gap-3 cursor-pointer transition-colors">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          GN
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 truncate">Gabriel Nogueira</span>
                            <span className="text-[10px] text-slate-400">09:50</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 my-0.5">
                            <span className="text-slate-800 bg-slate-200 border border-slate-300 px-1 rounded font-medium">TikTok</span>
                            <span className="truncate">TechHouse</span>
                          </div>
                          <p className="text-[11.5px] text-slate-500 truncate">
                            Status do reparo atualizado: tela trocada e aparelho testado.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Janela de Mensagens Ativa com Nota Interna e Player de Áudio */}
                  <div className="w-full md:w-7/12 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 text-left">
                    
                    {/* Topo do Chat Ativo */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            VM
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 font-inter">Dra. Vanessa Mendes</span>
                            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200/60">
                              Odontologia &amp; Lentes
                            </span>
                          </div>
                          <span className="text-[10.5px] text-emerald-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online via BipeSend WhatsApp API Oficial
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-md">
                          Em Proposta
                        </span>
                      </div>
                    </div>

                    {/* Histórico da Conversa */}
                    <div className="space-y-3.5 flex-1 overflow-y-auto">
                      
                      {/* Mensagem 1 - Lead */}
                      <div className="flex items-start gap-2.5 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          VM
                        </div>
                        <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl rounded-tl-xs text-xs space-y-1">
                          <p>Olá! Gostaria de saber os valores do protocolo de Lentes de Contato em Resina e se vocês enviam a proposta em PDF e áudio explicativo.</p>
                          <span className="text-[9.5px] text-slate-400 block text-right">10:41</span>
                        </div>
                      </div>

                      {/* Mensagem 2 - Agente de IA com Voz Real e PDF */}
                      <div className="flex items-start gap-2.5 max-w-[90%] ml-auto flex-row-reverse">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs text-xs space-y-2.5 shadow-sm">
                          <div className="flex items-center justify-between text-[10px] text-blue-100">
                            <span className="font-semibold">Resposta em 2 segundos • Agente Bipe</span>
                            <span>10:42</span>
                          </div>
                          
                          <p className="leading-relaxed">
                            Olá Dra. Vanessa! Com certeza! Já montei sua proposta oficial para o protocolo de Lentes com condições exclusivas e gravei este áudio rápido explicando cada etapa:
                          </p>

                          {/* Player de Áudio Integrado com Áudio Real */}
                          <div className="bg-white/20 backdrop-blur-xs p-2.5 rounded-xl flex items-center gap-3 border border-white/25">
                            <button
                              type="button"
                              onClick={() => playSimulatedAudio("human")}
                              className="w-7 h-7 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-105 transition-transform shrink-0 shadow-xs cursor-pointer"
                              title="Ouvir Áudio da Agente com Voz Natural"
                            >
                              {isPlayingHuman ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-blue-600 ml-0.5" />}
                            </button>
                            
                            <div className="flex-1 flex items-center gap-1 h-5">
                              {[40, 70, 95, 60, 100, 50, 85, 45, 75, 90, 55, 80, 60, 40].map((h, idx) => (
                                <span
                                  key={idx}
                                  style={{ height: `${isPlayingHuman ? Math.max(25, (h + (idx % 3) * 15) % 100) : h}%` }}
                                  className={`w-1 rounded-full transition-all duration-150 ${isPlayingHuman ? "bg-white animate-pulse" : "bg-white/70"}`}
                                />
                              ))}
                            </div>

                            <span className="text-[10px] font-mono text-white/90">0:18</span>
                          </div>

                          {/* Cartão de Arquivo em PDF */}
                          <div className="bg-white/15 backdrop-blur-xs p-2 rounded-xl flex items-center gap-2.5 border border-white/20">
                            <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-[11px] block truncate text-white">Proposta_Lentes_OdontoMendes.pdf</span>
                              <span className="text-[9.5px] text-white/80 block">PDF Oficial • 1.4 MB</span>
                            </div>
                            <CheckCheck className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                          </div>

                        </div>
                      </div>

                      {/* Mensagem 3 - NOTA INTERNA */}
                      <div className="w-11/12 ml-auto">
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl shadow-2xs space-y-1 text-left">
                          <div className="text-[11px] text-yellow-800 font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-yellow-600" />
                              Nota Interna (Visível apenas para a equipe)
                            </span>
                            <span className="text-[10px] text-yellow-600 font-mono">10:43</span>
                          </div>
                          <p className="text-xs text-yellow-900 leading-relaxed">
                            Dra. Vanessa aprovou o valor preliminar. Agente já qualificou e enviou a proposta em PDF. Lead pronto para assinatura de contrato.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Barra Inferior de Envio */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="Anexar arquivo">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors" title="Gravar áudio com voz natural">
                        <Mic className="w-4 h-4" />
                      </button>
                      <div className="flex-1 bg-slate-100 rounded-xl px-3 py-2 text-xs text-slate-500">
                        Digite uma mensagem, grave um áudio ou acione a Agente...
                      </div>
                      <button type="button" className="p-2 bg-[#007BFF] text-white rounded-xl hover:bg-blue-600 transition-colors shadow-xs" title="Enviar">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA 3: SUA AGENTE PERSONALIZADA & ARQUIVOS */}
              {activeShowcaseTab === "ai_train" && (
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-6 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 font-inter">
                        Sua Própria Agente Personalizada — Envio de Áudio & Arquivos
                      </h3>
                      <p className="text-xs text-slate-500">
                        Suba catálogos, tabelas e regras da sua empresa. Sua agente aprende e envia áudios com voz natural e arquivos aos clientes.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                      Sua Agente Pronta e Ativa
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <FileText className="w-4 h-4 text-blue-500" />
                        Tabela_Precos_2026.pdf
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold block">
                        Envio automático em PDF para o cliente
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Mic className="w-4 h-4 text-violet-500" />
                        Amostra_Voz_Secretaria.mp3
                      </div>
                      <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold block">
                        Áudio gravado com voz natural da empresa
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-3.5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
                      <UploadCloud className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs font-bold text-slate-600">Arraste novos arquivos ou áudios</span>
                      <span className="text-[10px] text-slate-400">PDF, DOCX, Imagens ou MP3</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA 4: DISPAROS EM MASSA */}
              {activeShowcaseTab === "campaigns" && (
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-6 border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 font-inter">
                        Campanhas & Disparos com Cadência Anti-Bloqueio
                      </h3>
                      <p className="text-xs text-slate-500">
                        Envios inteligentes com intervalos dinâmicos simulando uma pessoa real navegando.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                      Status: 99.4% Entregabilidade
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-800">Campanha Reativação Black Friday</div>
                        <div className="text-[11px] text-slate-500">Filtro: Leads inativos há +60 dias • 2.400 contatos</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-600">1.840 Enviados</span>
                        <div className="w-28 bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-500 h-full w-[78%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTEÚDO DA ABA 5: APP MOBILE COM IPHONE E NOTIFICAÇÕES REALÍSTICAS */}
              {activeShowcaseTab === "mobile" && (
                <div className="bg-[#F8FAFC] rounded-2xl p-4 sm:p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-center gap-8">
                  
                  {/* Mockup Realista de iPhone 16 Pro com Dynamic Island */}
                  <div className="w-[300px] sm:w-[320px] bg-[#0F172A] p-3.5 rounded-[48px] shadow-[0_25px_60px_rgba(15,23,42,0.25)] border-4 border-slate-700/90 relative shrink-0">
                    
                    {/* Dynamic Island com indicador ativo */}
                    <div className="w-28 h-6 bg-black rounded-full mx-auto mb-3 flex items-center justify-between px-3 text-[9px] text-slate-300 font-mono shadow-inner">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[8px] text-emerald-400 font-bold">Bipe</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="w-0.5 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="w-0.5 h-3 bg-blue-400 rounded-full animate-pulse delay-75" />
                        <span className="w-0.5 h-1.5 bg-blue-400 rounded-full animate-pulse delay-150" />
                      </div>
                    </div>

                    {/* Tela do iPhone / Lock Screen & Central de Notificações */}
                    <div className="bg-gradient-to-b from-[#0B1120] via-[#1E293B] to-[#0B1120] text-white rounded-[36px] overflow-hidden p-4 space-y-3 font-sans relative border border-slate-800">
                      
                      {/* Topo: Relógio e Data */}
                      <div className="text-center pt-2 pb-1">
                        <div className="text-4xl font-extrabold font-inter tracking-tight text-white/95">
                          09:41
                        </div>
                        <div className="text-[11px] font-medium text-slate-300 mt-0.5">
                          Segunda-feira, 28 de setembro
                        </div>
                        
                        {/* Logotipo Vertical Oficial BipeSend */}
                        <div className="my-2.5 flex items-center justify-center">
                          <Image
                            src="/assets/brand/bipesend-logovertical-branco-webp.webp"
                            alt="BipeSend Logo"
                            width={140}
                            height={36}
                            className="h-9 w-auto object-contain opacity-95 drop-shadow-md"
                          />
                        </div>
                      </div>

                      {/* Notificação Push 1: Agente & WhatsApp */}
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-1.5 shadow-lg animate-in slide-in-from-top-2 duration-300 text-left">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <div className="w-4 h-4 rounded-md bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                              <Image src="/assets/brand/icon-logomarca-branco-v2-webp.webp" alt="BipeSend WhatsApp" width={16} height={16} className="object-contain" />
                            </div>
                            <span>BipeSend • WhatsApp Oficial</span>
                          </div>
                          <span className="text-[9.5px] text-slate-400">Agora</span>
                        </div>
                        <p className="text-[11px] text-slate-100 leading-snug">
                          <strong>Sua Agente Bipe:</strong> Proposta comercial enviada para Dr. Marcelo (Odonto Florescer) com áudio de 18s.
                        </p>
                      </div>

                      {/* Notificação Push 2: CRM Bipe Plus */}
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-1.5 shadow-lg animate-in slide-in-from-top-3 duration-500 text-left">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <div className="w-4 h-4 rounded-md bg-blue-600 border border-blue-500 overflow-hidden flex items-center justify-center shrink-0">
                              <Image src="/assets/brand/icon-logomarca-azul-webp.webp" alt="BipeSend CRM" width={16} height={16} className="object-contain" />
                            </div>
                            <span>BipeSend • CRM Bipe Plus</span>
                          </div>
                          <span className="text-[9.5px] text-slate-400">Há 2m</span>
                        </div>
                        <p className="text-[11px] text-slate-100 leading-snug">
                          <strong>Novo Fechamento Ganho:</strong> Oportunidade de R$ 4.850,00 avançou para 'Fechamento' no funil.
                        </p>
                      </div>

                      {/* Notificação Push 3: Disparo em Massa Seguro */}
                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-1.5 shadow-lg animate-in slide-in-from-top-4 duration-700 text-left">
                        <div className="flex items-center justify-between text-[10px] text-slate-300">
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <div className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-500 overflow-hidden flex items-center justify-center shrink-0">
                              <Image src="/assets/brand/icon-logomarca-roxo-webp.webp" alt="BipeSend Campanhas" width={16} height={16} className="object-contain" />
                            </div>
                            <span>BipeSend • Campanhas</span>
                          </div>
                          <span className="text-[9.5px] text-slate-400">Há 15m</span>
                        </div>
                        <p className="text-[11px] text-slate-100 leading-snug">
                          <strong>Disparo Concluído:</strong> 99.4% entregue com cadência anti-bloqueio para 2.400 clientes inativos.
                        </p>
                      </div>

                      {/* Barra Inferior Home do iPhone */}
                      <div className="pt-2">
                        <div className="w-28 h-1 bg-white/40 rounded-full mx-auto" />
                      </div>

                    </div>
                  </div>

                  {/* Informações de Destaque da Seção Mobile */}
                  <div className="max-w-md space-y-4 text-left">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-[#007BFF] border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
                      <Smartphone className="w-3.5 h-3.5 text-[#007BFF]" />
                      Aplicativo Nativo de Mensagens & Notificações
                    </div>

                    <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-inter leading-tight">
                      Sua operação inteira no bolso: receba notificações push em tempo real no iPhone e Android
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Não fique preso ao computador. Com o aplicativo mobile da BipeSend, você recebe alertas instantâneos de novos negócios, ouve os áudios enviados pelos agentes de IA e assume qualquer conversa com apenas um toque na tela.
                    </p>

                    <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Notificações push imediatas de leads qualificados e propostas abertas</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Visualização em tempo real de faturamento e VGV do CRM Bipe Plus</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Transbordo humano e envio de áudios diretamente pelo microfone do smartphone</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Segurança biométrica (FaceID / TouchID) para proteção dos dados da empresa</span>
                      </li>
                    </ul>

                    <div className="pt-2">
                      <a
                        href={resolveAppLink("/register")}
                        className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        <span>Acessar no Celular</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* ── 3.5 SEÇÃO DEDICADA: CONSTRUTOR DE AUTOMAÇÕES & CHATBOT AVANÇADO (ESTILO N8N) ── */}
      <section id="automacoes" className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#FAFCFF] to-white border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <AutomationBuilderShowcase compact={false} />
        </div>
      </section>

      {/* ── 4. LOGOS DE CLIENTES EM CARROSSEL CONTÍNUO (+10.000 EMPRESAS) ── */}
      <section className="py-12 bg-white border-y border-slate-200/80 overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-200 text-[#007BFF] text-xs font-bold mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#007BFF] animate-pulse" />
            <span>Quem não usa fica para trás: +de 10.000 empresas automatizam seus processos</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-inter tracking-tight">
            Diversas empresas entenderam a importância de acelerarem suas operações com automações.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl mx-auto">
            Marcas em todo o Brasil deixaram para trás o atendimento lento e transformaram seu WhatsApp em uma máquina de vendas previsível.
          </p>
        </div>

        {/* Carrossel Minimalista Contínuo Infinito (Marquee) sem Fundo Botão */}
        <div className="relative w-full overflow-hidden py-3">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-white to-transparent z-10" />
          
          <div className="animate-marquee-infinite flex items-center">
            {[...CLIENT_BRANDS, ...CLIENT_BRANDS].map((brand, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 mx-6 group cursor-default whitespace-nowrap transition-all duration-300 hover:opacity-100 opacity-90"
              >
                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200/80 group-hover:border-blue-300/90 flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:scale-105 shrink-0 p-1.5">
                  {brand.renderLogo()}
                </div>
                <div className="text-left">
                  <span className="font-extrabold text-sm sm:text-[15px] text-slate-800 group-hover:text-[#007BFF] transition-colors font-inter block leading-tight">
                    {brand.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors block">
                    {brand.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SEÇÃO DE CUSTO-BENEFÍCIO COM DIVISÓRIAS & CHECKS ── */}
      <section id="comparativo" className="py-16 sm:py-24 bg-[#FAFCFF] border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-[#007BFF] bg-blue-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-blue-200/80">
              CUSTO-BENEFÍCIO & TRANSFORMAÇÃO EMPRESARIAL
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
              O que muda na sua empresa quando você adota a BipeSend
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              Compare a dor de gerenciar ferramentas fragmentadas e perder leads com a eficiência de um ecossistema completo que se paga no primeiro mês.
            </p>
          </div>

          {/* Matriz Comparativa com Divisórias Estruturadas */}
          <div className="max-w-5xl mx-auto bg-white rounded-[32px] border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)] overflow-hidden">
            
            {/* Cabeçalho das Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-200">
              <div className="bg-red-50/60 p-5 sm:p-6 flex items-center gap-3 border-b md:border-b-0 md:border-r border-red-200/80">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-red-950 font-inter">
                    Sem a BipeSend (Operação Fragmentada & Perdas)
                  </h3>
                  <span className="text-xs text-red-600 font-medium">
                    Várias ferramentas soltas, leads esfriando e custos altos
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/60 p-5 sm:p-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-inter">
                    Com a BipeSend (A Máquina de Vendas 24/7)
                  </h3>
                  <span className="text-xs text-emerald-600 font-semibold">
                    Tudo unificado: IA treinada, voz real, CRM e atendimento
                  </span>
                </div>
              </div>
            </div>

            {/* Linhas Comparativas com Divisórias Claras */}
            <div className="divide-y divide-slate-200/80 text-xs sm:text-sm">
              
              {/* Linha 1: Tempo de Resposta */}
              <div className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex items-start gap-3 md:border-r border-slate-200/80 bg-red-50/20">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-900 block font-semibold">Demora de 30 a 90 minutos no primeiro contato</strong>
                    <p className="text-slate-600 leading-relaxed">
                      O lead esfria, pesquisa o concorrente no Instagram e você perde a venda antes mesmo de digitar a primeira mensagem.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex items-start gap-3 bg-emerald-50/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-950 block font-semibold">Primeiro contato em menos de 5 segundos 24/7</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Agente Mestre atende dia e noite com voz humana real no pico do interesse, qualificando e agendando reuniões.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha 2: Custos de Softwares */}
              <div className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex items-start gap-3 md:border-r border-slate-200/80 bg-red-50/20">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-900 block font-semibold">4 a 6 assinaturas caras pagas em dólar</strong>
                    <p className="text-slate-600 leading-relaxed">
                      CRM separado, chatbot básico, disparador instável e central telefônica. R$ 1.800 a R$ 3.000/mês jogados fora.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex items-start gap-3 bg-emerald-50/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-950 block font-semibold">Economia de até 70% com ecossistema unificado</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Tudo em 1 só assinatura em reais: WhatsApp, Instagram, TikTok, CRM Bipe Plus, Campanhas e Equipe integrada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha 3: Gestão de Equipe */}
              <div className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex items-start gap-3 md:border-r border-slate-200/80 bg-red-50/20">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-900 block font-semibold">Conversas em celulares pessoais sem controle</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Vendedores esquecem de retornar clientes, não há histórico unificado e se o atendente sair da empresa, leva os contatos.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex items-start gap-3 bg-emerald-50/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-950 block font-semibold">Central com múltiplos atendentes no mesmo número</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Roteamento inteligente por setores (Vendas, Suporte, Financeiro), chat interno da equipe e auditoria completa.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha 4: Funil e Fechamento no CRM */}
              <div className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex items-start gap-3 md:border-r border-slate-200/80 bg-red-50/20">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-900 block font-semibold">Planilhas manuais e vendedores perdidos com curiosos</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Falta de visão do faturamento projetado, leads sem follow-up no tempo certo e fechamentos perdidos por desorganização.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex items-start gap-3 bg-emerald-50/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-950 block font-semibold">CRM Bipe Plus com movimentação visual e automática de etapas</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      A IA move os leads entre as etapas do funil conforme o avanço da conversa, alertando o vendedor na hora de fechar.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha 5: Risco de Bloqueio */}
              <div className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex items-start gap-3 md:border-r border-slate-200/80 bg-red-50/20">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-900 block font-semibold">Bloqueios constantes por robôs amadores</strong>
                    <p className="text-slate-600 leading-relaxed">
                      Disparos em lote sem cadência humana geram denúncias no WhatsApp, perda de chips e prejuízos gigantescos.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex items-start gap-3 bg-emerald-50/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-950 block font-semibold">BipeSend WhatsApp API com motor anti-ban proprietário</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Cadência humanizada inteligente, aquecimento dinâmico e 99.4% de entregabilidade comprovada em escala.
                    </p>
                  </div>
                </div>
              </div>

              {/* Linha 6: Envio de Áudio, Arquivos e Voz */}
              <div className="grid grid-cols-1 md:grid-cols-2 hover:bg-slate-50/50 transition-colors">
                <div className="p-5 sm:p-6 flex items-start gap-3 md:border-r border-slate-200/80 bg-red-50/20">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-red-900 block font-semibold">Respostas mecânicas e menus robóticos frios</strong>
                    <p className="text-slate-600 leading-relaxed">
                      "Digite 1 para vendas, 2 para suporte" irrita os clientes e causa abandono imediato da conversa.
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex items-start gap-3 bg-emerald-50/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-emerald-950 block font-semibold">Sua própria Agente personalizada com envio de áudio e arquivos</strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      Responde dúvidas na hora, envia áudios com tom de voz natural e compartilha fotos, tabelas ou arquivos em PDF como se fosse alguém da sua equipe.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Divisória de Custo-Benefício & Flexibilidade de Valores */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 text-white border-t border-slate-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl text-center md:text-left">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#38BDF8] bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
                    VALORES 100% ADAPTÁVEIS À SUA NECESSIDADE
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold font-inter text-white">
                    Sua empresa só paga pelo que realmente precisa — e cresce sem barreiras
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Não engessamos seu negócio com planos rígidos. Se você precisa de mais atendentes, novos números de WhatsApp ou agentes extras, tudo é modular e customizável. <strong>O mais importante: com a BipeSend suas vendas aumentam e seus processos internos se tornam simples e automáticos.</strong>
                  </p>
                </div>

                <div className="flex-shrink-0 w-full md:w-auto text-center">
                  <a
                    href={resolveAppLink("/register")}
                    className="figma-shimmer-btn inline-flex items-center justify-center gap-2 w-full md:w-auto bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                  >
                    <span>Começar Minha Transformação</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. FEATURES & DIFERENCIAIS (I — Interesse) ── */}
      <section id="recursos" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-20">
            <span className="text-xs font-bold text-[#007BFF] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-200/70">
              {content.features.badge}
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
              {content.features.title}
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              {content.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {content.features.items.map((feat) => {
              const colorTheme = {
                violet: "from-violet-500/10 to-indigo-500/5 text-violet-600 border-violet-200/80 hover:border-violet-400",
                blue: "from-blue-500/10 to-sky-500/5 text-blue-600 border-blue-200/80 hover:border-blue-400",
                emerald: "from-emerald-500/10 to-teal-500/5 text-emerald-600 border-emerald-200/80 hover:border-emerald-400",
                amber: "from-amber-500/10 to-orange-500/5 text-amber-600 border-amber-200/80 hover:border-amber-400",
              }[feat.accentColor];

              const iconMap = {
                mic: Mic,
                "message-square": MessageSquare,
                layers: Layers,
                shield: ShieldCheck,
                bot: Bot,
                zap: Sparkles,
              };
              const IconComp = iconMap[feat.icon] || Sparkles;

              return (
                <div
                  key={feat.id}
                  className={`bg-[#FAFCFF] rounded-[24px] border transition-all duration-300 p-6 flex flex-col justify-between group shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_25px_rgba(15,23,42,0.06)] hover:-translate-y-1 h-full ${colorTheme}`}
                >
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <div className="min-h-[26px] flex items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 inline-block">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-[18px] sm:text-[19px] font-bold text-[#0F172A] font-inter tracking-tight leading-snug min-h-[54px] flex items-center">
                      {feat.title}
                    </h3>

                    <p className="text-[13px] text-slate-600 leading-relaxed min-h-[72px]">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-200/60 space-y-2.5">
                    {feat.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 7. VOICE COMPARISON (D — Desejo: Experiência Auditiva) ── */}
      <section id="demonstracao" className="py-16 sm:py-24 bg-gradient-to-b from-[#FAFCFF] to-[#F1F5F9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full uppercase tracking-wider border border-violet-200">
              {content.voiceDemo.badge}
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
              {content.voiceDemo.title}
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              {content.voiceDemo.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            <div className="bg-white rounded-[26px] p-6 sm:p-8 border-2 border-[#007BFF] shadow-[0_8px_30px_rgba(0,123,255,0.08)] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-[#007BFF] text-white text-[10.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                Recomendado
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007BFF] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-[#0F172A] font-inter">
                      {content.voiceDemo.humanVoiceTitle}
                    </h3>
                    <span className="text-xs text-emerald-600 font-semibold">
                      99.8% Fidelidade Real
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {content.voiceDemo.humanVoiceDescription}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 italic border border-slate-200">
                  &quot;{content.voiceDemo.sampleText}&quot;
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="h-9 flex items-center justify-center mb-2">
                  {isPlayingHuman ? (
                    <div className="flex items-center gap-1 justify-center">
                      {[0.1, 0.4, 0.7, 0.2, 0.9, 0.5, 0.8, 0.3, 0.6, 0.2].map((delay, idx) => (
                        <span
                          key={idx}
                          className="w-1 bg-[#007BFF] rounded-full figma-wave-bar"
                          style={{ animationDelay: `${delay}s`, height: "20px" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Ondas sonoras neurais · 99.8% humanizada
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => playSimulatedAudio("human")}
                  aria-label={isPlayingHuman ? "Pausar Amostra" : "Ouvir Áudio com Voz Natural"}
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:opacity-95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPlayingHuman ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlayingHuman ? "Pausar Amostra" : "Ouvir Áudio com Voz Natural"}</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-slate-300/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] opacity-85 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-slate-700 font-inter">
                      {content.voiceDemo.robotVoiceTitle}
                    </h3>
                    <span className="text-xs text-red-500 font-semibold">
                      Gera abandono de contato
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  {content.voiceDemo.robotVoiceDescription}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic border border-slate-200">
                  &quot;{content.voiceDemo.sampleText}&quot;
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="h-9 flex items-center justify-center mb-2">
                  {isPlayingRobot ? (
                    <div className="flex items-center gap-1 justify-center">
                      {[0.3, 0.1, 0.5, 0.2, 0.4].map((delay, idx) => (
                        <span
                          key={idx}
                          className="w-1 bg-slate-400 rounded-full figma-wave-bar"
                          style={{ animationDelay: `${delay}s`, height: "16px" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Voz mecânica monótona sem modulação
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => playSimulatedAudio("robot")}
                  aria-label={isPlayingRobot ? "Pausar" : "Ouvir Voz Robótica Padrão"}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPlayingRobot ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-700" />}
                  <span>{isPlayingRobot ? "Pausar" : "Ouvir Voz Robótica Padrão"}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 8. ROI CALCULATOR (D — Desejo: Calculadora de Lucro e Economia CLT Real) ── */}
      <section id="calculadora" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-14">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-emerald-200 inline-flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{content.roiCalculator.badge}</span>
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight leading-tight">
              {content.roiCalculator.title}
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              {content.roiCalculator.subtitle}
            </p>
          </div>

          <CltRoiCalculator
            registerUrl={resolveAppLink("/register")}
            plans={plans}
            initialNumAgents={3}
            initialMonthlyLeads={3500}
            initialTicketMedio={220}
          />
        </div>
      </section>

      {/* ── 9. PRICING TABLE DINÂMICA (FIGMA-STYLED COM 2 MESES GRÁTIS) ── */}
      <PricingSection
        plans={plans}
        pricingContent={content.pricing}
        registerUrl={resolveAppLink("/register")}
      />

      {/* ── 10. SOBRE NÓS & PROPÓSITO ── */}
      <section id="sobre" className="py-16 sm:py-24 bg-gradient-to-b from-[#FAFCFF] via-white to-[#FAFCFF] border-b border-slate-200/80 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14 sm:mb-16">
            <span className="text-xs font-bold text-[#007BFF] bg-blue-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-blue-200/80">
              {content.aboutUs?.badge || "NOSSO PROPÓSITO & HISTÓRIA"}
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
              {content.aboutUs?.title || "Tecnologia autônoma criada para fazer o negócio brasileiro crescer"}
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              {content.aboutUs?.subtitle || "Nascemos com a missão de transformar o WhatsApp em um canal de vendas acolhedor, rápido e lucrativo."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Coluna Esquerda: História, Pilares e Métricas */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
                <p>
                  {content.aboutUs?.story}
                </p>
              </div>

              {/* 3 Pilares em Flexbox Modular */}
              <div className="space-y-3 pt-2">
                {content.aboutUs?.pillars?.map((pillar, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#007BFF] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs border border-blue-100 font-mono">
                      0{pIdx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-inter">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 4 Métricas de Impacto */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4 border-t border-slate-200/80">
                {content.aboutUs?.stats?.map((stat, sIdx) => (
                  <div key={sIdx} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs text-center">
                    <div className="text-xl sm:text-2xl font-extrabold text-[#007BFF] font-inter">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna Direita: Card do Fundador Germani Rodrigues */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white rounded-[32px] border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.08)] p-6 sm:p-7 text-left space-y-6">
                <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-xs bg-slate-100">
                  <Image
                    src={content.aboutUs?.founderPhotoUrl || "/assets/brand/germani-avatar.jpg"}
                    alt={content.aboutUs?.founderName || "Germani Rodrigues"}
                    fill
                    loading="lazy"
                    decoding="async"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 text-white">
                    <div className="flex items-center gap-1.5 font-bold text-base font-inter">
                      <span>{content.aboutUs?.founderName || "Germani Rodrigues"}</span>
                      <BipeVerifiedBadge size={18} />
                    </div>
                    <span className="text-xs text-slate-200 font-medium">
                      {content.aboutUs?.founderRole || "Fundador & Diretor de Produto"}
                    </span>
                  </div>
                </div>

                <div className="relative bg-[#F8FAFC] rounded-2xl p-4 sm:p-5 border border-slate-200/80">
                  <span className="text-3xl text-blue-400 font-serif leading-none block mb-1">&ldquo;</span>
                  <p className="text-xs sm:text-[13px] text-slate-700 italic leading-relaxed font-normal">
                    {content.aboutUs?.founderQuote}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Tecnologia 100% Brasileira
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sede em São Paulo, SP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. DEPOIMENTOS & CASOS REAIS DE ALTA CONVERSÃO ── */}
      <section id="depoimentos" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
              {content.testimonials?.badge || "PROVA SOCIAL & CASOS COMPROVADOS"}
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
              {content.testimonials?.title || "+10.000 empresas aceleram com a BipeSend"}
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              {content.testimonials?.subtitle || "Veja resultados reais de empresas nos nichos mais concorridos do mercado brasileiro."}
            </p>
          </div>

          {/* Controles de Navegação do Carrossel de Depoimentos */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 font-inter">
                {content.testimonials?.items?.length || 15} depoimentos verificados
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  scrollTrack(track1Ref, "left");
                  scrollTrack(track2Ref, "left");
                }}
                aria-label="Ver depoimentos anteriores"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-[#007BFF] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  scrollTrack(track1Ref, "right");
                  scrollTrack(track2Ref, "right");
                }}
                aria-label="Ver próximos depoimentos"
                className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-[#007BFF] flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Faixa 1 de Depoimentos (8 cards) */}
          <div
            ref={track1Ref}
            className="flex items-stretch gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {(content.testimonials?.items || []).slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="w-[320px] sm:w-[360px] shrink-0 snap-start bg-[#F8FAFC] hover:bg-white rounded-[24px] border border-slate-200/90 hover:border-blue-300 p-6 transition-all duration-300 shadow-xs hover:shadow-[0_12px_35px_rgba(0,123,255,0.08)] flex flex-col justify-between text-left group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#007BFF] bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                      {item.segment || "Segmento"}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(item.stars || 5)].map((_, sIdx) => (
                        <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.metric}</span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed italic line-clamp-4">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 mt-5 border-t border-slate-200/70">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      fill
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] font-inter truncate group-hover:text-[#007BFF] transition-colors flex items-center gap-1">
                      <span className="truncate">{item.name}</span>
                      <BipeVerifiedBadge size={15} />
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate font-medium">
                      {item.role} • <span className="text-slate-700 font-semibold">{item.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Faixa 2 de Depoimentos (7 cards) */}
          <div
            ref={track2Ref}
            className="flex items-stretch gap-5 overflow-x-auto pb-4 mt-4 scrollbar-none snap-x snap-mandatory"
            style={{ scrollBehavior: "smooth" }}
          >
            {(content.testimonials?.items || []).slice(8).map((item) => (
              <div
                key={item.id}
                className="w-[320px] sm:w-[360px] shrink-0 snap-start bg-[#F8FAFC] hover:bg-white rounded-[24px] border border-slate-200/90 hover:border-blue-300 p-6 transition-all duration-300 shadow-xs hover:shadow-[0_12px_35px_rgba(0,123,255,0.08)] flex flex-col justify-between text-left group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#6366F1] bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
                      {item.segment || "Segmento"}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(item.stars || 5)].map((_, sIdx) => (
                        <Star key={sIdx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{item.metric}</span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed italic line-clamp-4">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 mt-5 border-t border-slate-200/70">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-white">
                    <Image
                      src={item.avatarUrl}
                      alt={item.name}
                      fill
                      loading="lazy"
                      decoding="async"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] font-inter truncate group-hover:text-[#6366F1] transition-colors flex items-center gap-1">
                      <span className="truncate">{item.name}</span>
                      <BipeVerifiedBadge size={15} />
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate font-medium">
                      {item.role} • <span className="text-slate-700 font-semibold">{item.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selo de Auditoria e Conformidade na Base */}
          <div className="mt-10 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Casos e métricas reais validados diretamente com clientes ativos na plataforma.</span>
          </div>

        </div>
      </section>

      {/* ── 12. FAQ COM RESPOSTA DIRETA ESTÁVEL (Sem Efeito Sanfona / Zero Layout Shift) ── */}
      <section id="faq" className="py-16 sm:py-24 bg-[#FAFCFF] border-b border-slate-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-slate-700 bg-white px-3.5 py-1 rounded-full uppercase tracking-wider border border-slate-200/90 shadow-2xs">
              {content.faq.badge}
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[44px] font-extrabold text-[#0F172A] font-inter tracking-tight">
              {content.faq.title}
            </h2>
            <p className="text-[14px] sm:text-[16px] text-slate-600">
              {content.faq.subtitle}
            </p>
          </div>

          {/* Painel Master-Detail de Resposta Direta (Sem Efeito Sanfona) */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Coluna da Esquerda: Lista de Perguntas (Master) */}
            <div className="lg:col-span-5 space-y-2.5">
              {content.faq.items.map((faq, idx) => {
                const isSelected = (selectedFaqId || content.faq.items[0]?.id) === faq.id;
                return (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => setSelectedFaqId(faq.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 text-xs sm:text-[13px] font-semibold font-inter cursor-pointer ${
                      isSelected
                        ? "bg-white border-[#007BFF] shadow-[0_4px_16px_rgba(0,123,255,0.12)] text-[#007BFF]"
                        : "bg-white/80 hover:bg-white border-slate-200/80 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold shrink-0 transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{faq.question}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-[#007BFF] translate-x-0.5" : "text-slate-300"}`} />
                  </button>
                );
              })}
            </div>

            {/* Coluna da Direita: Painel Iluminado de Resposta Estável (Detail) */}
            <div className="lg:col-span-7">
              {(() => {
                const activeFaq = content.faq.items.find((f) => f.id === (selectedFaqId || content.faq.items[0]?.id)) || content.faq.items[0];
                if (!activeFaq) return null;
                const activeIndex = content.faq.items.findIndex((f) => f.id === activeFaq.id) + 1;

                return (
                  <div className="bg-white rounded-[28px] border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-6 text-left relative overflow-hidden min-h-[380px] flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Topo do Painel de Resposta */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-50 text-[#007BFF] font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-blue-200/80">
                            Dúvida #{String(activeIndex).padStart(2, "0")}
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resposta Oficial
                          </span>
                        </div>
                        <BipeVerifiedBadge size={18} />
                      </div>

                      {/* Pergunta em Destaque */}
                      <h3 className="text-base sm:text-lg font-bold text-[#0F172A] font-inter leading-snug">
                        {activeFaq.question}
                      </h3>

                      {/* Resposta Completa */}
                      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-slate-100">
                        <p>{activeFaq.answer}</p>
                      </div>

                      {/* Destaques Rápidos */}
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Sem Fidelidade
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium border border-blue-200/60 flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5" /> Ativação em Minutos
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-medium border border-purple-200/60 flex items-center gap-1">
                          <Headphones className="w-3.5 h-3.5" /> Suporte Humano
                        </span>
                      </div>
                    </div>

                    {/* Rodapé com CTA de Atendimento Rápido */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Ainda ficou com alguma dúvida sobre seu negócio?
                      </span>
                      <a
                        href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20a%20BipeSend"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

      {/* ── 13. FINAL CTA ── */}
      <section className="py-16 sm:py-24 bg-gradient-to-tr from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="text-xs font-extrabold text-[#38BDF8] bg-white/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider border border-white/15">
              {content.finalCta.badge}
            </span>
            <h2 className="text-[30px] sm:text-[42px] md:text-[50px] font-extrabold font-inter tracking-tight leading-tight text-white">
              {content.finalCta.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              {content.finalCta.subtitle}
            </p>
            <div className="pt-2">
              <a
                href={resolveAppLink(content.finalCta.ctaButtonLink)}
                className="figma-shimmer-btn inline-flex items-center gap-2.5 bg-gradient-to-r from-[#007BFF] to-[#6366F1] hover:from-[#0069D9] hover:to-[#4F46E5] text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                <span>{content.finalCta.ctaButtonText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-slate-400">
              {content.finalCta.guaranteeBadge}
            </p>
          </div>
        </div>
      </section>

      {/* ── 14. FOOTER CORPORATIVO COM SEO & PARCEIROS (Centralizado no Mobile) ── */}
      <footer className="w-full bg-[#0B1120] text-slate-400 py-12 sm:py-16 border-t border-slate-800 text-xs text-center md:text-left">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <div className="space-y-3 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
              <Image
                src="/assets/brand/bipesend-logovertical-branco-webp.webp"
                alt="BipeSend - Plataforma Oficial de IA e CRM"
                width={142}
                height={38}
                className="h-8 sm:h-9 w-auto object-contain mx-auto md:mx-0"
              />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto md:mx-0">
                {content.footer.tagline}
              </p>
              <div className="text-xs text-slate-500 pt-1">
                Suporte Oficial: <span className="text-slate-300 font-medium">{content.footer.supportEmail}</span>
              </div>

              {/* Redes Sociais com Ícones Modernos e Tooltips */}
              <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                <a
                  href="https://instagram.com/bipesend"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram BipeSend"
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp BipeSend"
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>

                <a
                  href="https://linkedin.com/company/bipesend"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn BipeSend"
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-[#0077B5] text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>

                <a
                  href="https://youtube.com/@bipesend"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube BipeSend"
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                <a
                  href="https://tiktok.com/@bipesend"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok BipeSend"
                  className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-all duration-200 hover:scale-110 shadow-xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Produtos
              </h5>
              <ul className="space-y-2">
                <li><a href="#produtos" className="hover:text-[#007BFF]">CRM Bipe Plus</a></li>
                <li><a href="#produtos" className="hover:text-[#007BFF]">Inbox Omnichannel</a></li>
                <li><a href="#produtos" className="hover:text-[#007BFF]">Sua Agente Personalizada</a></li>
                <li><a href="#produtos" className="hover:text-[#007BFF]">BipeSend WhatsApp API</a></li>
                <li><a href="#demonstracao" className="hover:text-[#007BFF]">Envio de Áudio &amp; Voz</a></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Recursos
              </h5>
              <ul className="space-y-2">
                <li><a href="#comparativo" className="hover:text-[#007BFF]">Custo-Benefício</a></li>
                <li><a href="#calculadora" className="hover:text-[#007BFF]">Calculadora de ROI</a></li>
                <li><a href="#planos" className="hover:text-[#007BFF]">Planos &amp; Preços</a></li>
                <li><a href="#sobre" className="hover:text-[#007BFF]">Sobre Nós &amp; Propósito</a></li>
                <li><a href="#depoimentos" className="hover:text-[#007BFF]">Casos de Sucesso (+10k)</a></li>
                <li><a href="#faq" className="hover:text-[#007BFF]">Dúvidas Frequentes</a></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
                Institucional &amp; Acesso
              </h5>
              <ul className="space-y-2">
                <li><a href={resolveAppLink("/login")} className="hover:text-[#007BFF]">Acessar Painel</a></li>
                <li><a href={resolveAppLink("/register")} className="hover:text-[#007BFF]">Criar Conta Gratuita</a></li>
                <li><a href="#sobre" className="hover:text-[#007BFF]">Sobre a Empresa</a></li>
                <li><Link href="/terms" className="hover:text-[#007BFF]">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-[#007BFF]">Privacidade &amp; LGPD</Link></li>
              </ul>
            </div>

          </div>

          {/* Backlinks e Parcerias Autorizadas de SEO */}
          {content.seo?.backlinks && content.seo.backlinks.length > 0 && (
            <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-[11px] text-slate-500 mb-6 text-center md:text-left">
              <span className="font-semibold text-slate-400">Parceiros &amp; Ecossistema:</span>
              {content.seo.backlinks.map((bl) => (
                <a
                  key={bl.id}
                  href={bl.url}
                  rel={bl.rel || "noopener noreferrer"}
                  target="_blank"
                  className="hover:text-[#38BDF8] transition-colors underline-offset-2 hover:underline py-1.5 px-2 inline-block rounded-md"
                >
                  {bl.title}
                </a>
              ))}
            </div>
          )}

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-slate-500">
            <span>{content.footer.copyright}</span>
            <div className="flex items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Sistemas 100% Operacionais
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── 15. BARRA FIXA DE CONVERSÃO MOBILE (ALTA CONVERSÃO) ── */}
      <aside
        aria-label="Ação rápida de cadastro mobile"
        className={`fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 flex items-center justify-between gap-3 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out ${
          showStickyMobile ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 truncate font-inter">Crie sua conta grátis</div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            5 min para ativar • Sem cartão
          </div>
        </div>
        <a
          href={resolveAppLink("/register")}
          className="figma-shimmer-btn shrink-0 bg-gradient-to-r from-[#007BFF] to-[#6366F1] active:from-[#0069D9] active:to-[#4F46E5] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
        >
          <span>Começar Agora</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </aside>

      {/* ── 16. BANNER DE CONSENTIMENTO DE COOKIES (LGPD / PRIVACIDADE) ── */}
      <CookieConsentBanner />

    </div>
  );
}

"use server";

import fs from "node:fs";
import path from "node:path";
import { SiteContent, LandingPlan } from "../types/site-content.types";

const DEFAULT_LANDING_CONTENT: SiteContent = {
  announcement: {
    enabled: true,
    badge: "NOVIDADE",
    text: "Sua própria Agente personalizada: Envio de Áudio, Arquivos, Voz e CRM Bipe Plus liberados!",
    linkText: "Experimentar Agora",
    linkUrl: "#demonstracao",
  },
  hero: {
    badge: "Tecnologia Autônoma de Vendas Omnichannel 24/7",
    titleLine1: "Venda Mais com",
    titleHighlight: "sua Própria Agente de IA",
    titleLine2: "e Ferramentas Integradas.",
    subtitle:
      "A plataforma completa que une atendimento omnichannel, agente de IA com personalidade própria, respostas inteligentes e envio de áudios com voz natural, envio de arquivos e vídeos, disparos em massa com proteção anti-bloqueio, CRM Plus, checkout transparente e inbox inteligente de mensagens.",
    primaryCtaText: "Criar Conta Gratuita",
    primaryCtaLink: "/register",
    secondaryCtaText: "Ver Recursos & Demonstração",
    secondaryCtaLink: "#automacoes",
    stats: [
      { value: "+25.000", label: "Empresas com Atendimento Ativo" },
      { value: "100%", label: "Envios Concluídos com Sucesso" },
      { value: "< 3 seg", label: "Tempo Médio de Resposta" },
      { value: "24/7", label: "Operação e Vendas Contínuas" },
    ],
    mockupBadge: "IA Ativa • WhatsApp API Oficial",
    mockupStatus: "Simulação de Atendimento Humanizado & Checkout",
  },
  socialProof: {
    badge: "QUEM NÃO USA FICA PARA TRÁS",
    companiesCount: "+de 10.000 empresas automatizam seus processos",
    title: "Quem não usa fica para trás: +de 10.000 empresas automatizam seus processos",
    logos: [
      { name: "Máxima Academia", category: "Academia & Fitness" },
      { name: "Burger Prime", category: "Hamburgueria & Delivery" },
      { name: "Bella Napoli Forneria", category: "Pizzaria & Forno a Lenha" },
      { name: "Odonto Florescer", category: "Saúde & Odontologia" },
      { name: "Valente Estética Facial", category: "Estética & Harmonização" },
      { name: "Espaço Sublime Buffet", category: "Buffet & Eventos" },
      { name: "Gelato Real Artesanal", category: "Sorveteria & Sobremesas" },
      { name: "TechHouse Soluções", category: "Tecnologia & Softwares" },
      { name: "FixSmart Assistência", category: "Conserto de Celulares" },
      { name: "Harmonia Casa & Decoração", category: "Decoração & Design" },
      { name: "Ateliê & Fio Artesanato", category: "Artesanato & Manuais" },
      { name: "Papel & Cor Papelaria", category: "Papelaria & Criatividade" },
    ],
  },
  comparison: {
    badge: "CUSTO x BENEFÍCIO COMPROVADO",
    title: "Por que continuar perdendo clientes com ferramentas fragmentadas?",
    subtitle: "Compare a dor de gerenciar vários sistemas soltos com a eficiência de um ecossistema completo que se paga no primeiro mês.",
    withoutTitle: "Sem a BipeSend (O Caos da Operação Fragmentada)",
    withTitle: "Com a BipeSend (A Máquina de Vendas 24/7)",
    items: [
      {
        withoutBipe: "Mensagens acumuladas no celular e demora de mais de 45 minutos no primeiro contato com o lead.",
        withBipe: "Primeiro contato em menos de 3 segundos 24/7 com sua própria agente personalizada, envio de áudios e arquivos.",
      },
      {
        withoutBipe: "Várias assinaturas caras em dólar: CRM separado, chatbot básico, disparador instável e ramal avulso.",
        withBipe: "Tudo integrado em uma só assinatura: WhatsApp, Instagram, TikTok, CRM Bipe Plus, Campanhas e Equipe.",
      },
      {
        withoutBipe: "Vendedores sobrecarregados, esquecendo de retornar leads e sem padrão de resposta nas conversas.",
        withBipe: "Qualificação automática no funil, agendamento de reuniões e transbordo inteligente para humanos.",
      },
      {
        withoutBipe: "Risco constante de bloqueio de números por envios mecânicos sem aquecimento profissional.",
        withBipe: "BipeSend WhatsApp API com motor proprietário de proteção e simulação comportamental humana.",
      },
      {
        withoutBipe: "Equipe desorganizada, sem saber quem respondeu qual cliente e sem histórico unificado.",
        withBipe: "Caixa de entrada única com histórico centralizado, tags automáticas e métricas em tempo real.",
      },
    ],
  },
  features: {
    badge: "ECOSSISTEMA DE VENDAS COMPLETO",
    title: "Tudo o que sua empresa precisa para vender no automático",
    subtitle: "Desenvolvido para eliminar gargalos de atendimento e colocar sua operação no padrão dos maiores e-commerces do país.",
    items: [
      {
        id: "feat-agent",
        badge: "MOTOR COGNITIVO",
        title: "Sua Própria Agente de IA com Envio de Áudio & Arquivos",
        description: "Configure sua agente em minutos: defina tom de voz, regras de negócio, envio de áudios com timbre natural e propostas em PDF personalizadas.",
        benefits: ["Atendimento 24/7 sem fila de espera", "Compreensão de áudios e gírias regionais", "Envio automático de orçamentos e contratos"],
        icon: "bot",
        accentColor: "blue",
      },
      {
        id: "feat-kanban",
        badge: "GESTÃO VISUAL",
        title: "CRM Bipe Plus de Vendas Multicanal",
        description: "Visualize seus leads organizados por colunas de funil: Novos, Qualificados, Proposta Enviada, Follow-up e Fechamento com movimentação em tempo real.",
        benefits: ["Histórico unificado de conversas", "Valores e etapas configuráveis", "Tags e métricas de conversão instantâneas"],
        icon: "layers",
        accentColor: "violet",
      },
      {
        id: "feat-omnichannel",
        badge: "CANAL UNIFICADO",
        title: "BipeSend WhatsApp API, Instagram & TikTok",
        description: "Centralize múltiplos números de WhatsApp, direct do Instagram e comentários do TikTok em uma caixa de entrada unificada de alta velocidade.",
        benefits: ["Zero risco com proteção anti-bloqueio", "Distribuição inteligente por setores", "Fila de espera e transbordo humano"],
        icon: "message-square",
        accentColor: "blue",
      },
      {
        id: "feat-campaigns",
        badge: "ESCALA & GESTÃO",
        title: "Disparos em Massa com Proteção Anti-Bloqueio",
        description: "Sistema de campanha de envio em massa de mensagens com segurança máxima contra bloqueio de número do WhatsApp, equipe integrada e app mobile.",
        benefits: ["Disparos inteligentes sem risco de banimento", "Gestão de cargos e departamentos", "Aplicativo mobile nativo para iOS e Android"],
        icon: "shield",
        accentColor: "amber",
      },
    ],
  },
  voiceDemo: {
    badge: "ENVIO DE ÁUDIO & VOZ",
    title: "Envio de Áudio, Arquivos e Voz com Sua Própria Agente",
    subtitle: "Ouça a diferença: sua agente envia áudios com voz natural e arquivos direto no WhatsApp com rapidez e atenção humana.",
    sampleText: "Oi! Que bom falar com você. Já preparei sua proposta com condições exclusivas e desconto especial. Como posso te ajudar a fechar agora?",
    humanVoiceTitle: "Sua Agente com Voz Real e Envio de Áudio",
    humanVoiceDescription: "Envio de áudio com tom de conversa natural, pausas humanas e arquivos sob medida para cada cliente.",
    robotVoiceTitle: "Voz Sintética Convencional",
    robotVoiceDescription: "Monótona, metálica, sem pausas humanas. Afasta os clientes e destrói sua taxa de conversão.",
  },
  roiCalculator: {
    badge: "CALCULADORA DE RETORNO",
    title: "Quanto sua empresa economiza e lucra com a BipeSend?",
    subtitle: "Simule a substituição de horas extras de atendimento e ferramentas fragmentadas por nossa inteligência autônoma.",
    costPerHumanAgentMonth: 3200,
    avgLeadValue: 150,
  },
  pricing: {
    badge: "PLANOS TRANSPARENTES",
    title: "Invista na escala do seu negócio com previsibilidade",
    subtitle: "Estruturas completas que se adaptam exatamente à sua demanda de atendentes, contatos e conexões. Sem taxas ocultas.",
    yearlyDiscountBadge: "Economize 2 Meses Grátis no Plano Anual",
    guaranteeTitle: "Garantia Incondicional de 7 Dias",
    guaranteeDescription:
      "Teste a BipeSend com seu time. Se não sentir a transformação no atendimento e nas vendas nos primeiros 7 dias, devolvemos 100% do seu investimento.",
  },
  testimonials: {
    badge: "CASOS DE SUCESSO COMPROVADOS",
    title: "+10.000 empresas já utilizam a BipeSend para acelerar vendas e centralizar atendimentos",
    subtitle: "Veja o impacto real na rotina de empresários que transformaram o WhatsApp em uma máquina de vendas acolhedora.",
    items: [
      {
        id: "test-estetica",
        name: "Dra. Camila Valente",
        role: "Biomédica Esteta",
        company: "Clínica Valente Estética",
        segment: "Estética",
        avatarUrl: "/testimonials/dra-camila-estetica.jpg",
        metric: "+180% agendamentos",
        quote: "Antes eu perdia clientes no meio de um procedimento porque não dava tempo de responder sobre preços no zap. Agora a agente envia as fotos dos resultados, tira as dúvidas e já agenda a avaliação. Minha agenda vive cheia!",
        stars: 5,
      },
      {
        id: "test-odontologia",
        name: "Dra. Marcela Reis",
        role: "Cirurgiã-Dentista",
        company: "Clínica Odonto Florescer",
        segment: "Odontologia",
        avatarUrl: "/testimonials/dra-marcela-odonto.jpg",
        metric: "Zero faltas em consultas",
        quote: "O maior problema aqui era paciente que faltava sem avisar e perguntas repetidas de valores. A agente tira as dúvidas, envia a localização e confirma presença no dia anterior. As faltas caíram a quase zero.",
        stars: 5,
      },
      {
        id: "test-academia",
        name: "Carlos Silva",
        role: "Sócio-Fundador",
        company: "Máxima Academia & Fitness",
        segment: "Academia",
        avatarUrl: "/testimonials/carlos.jpg",
        metric: "+210 novas matrículas/mês",
        quote: "No horário de pico o balcão ficava uma loucura e o WhatsApp ficava esquecido. Hoje o aluno manda mensagem, a agente envia a grade de treinos e planos e já manda o link de matrícula. O aluno já entra matriculado!",
        stars: 5,
      },
      {
        id: "test-hamburgueria",
        name: "Equipe Burger Prime",
        role: "Gestão Operacional",
        company: "Burger Prime Artesanal",
        segment: "Hamburgueria",
        avatarUrl: "/testimonials/logo-burger-prime.svg",
        metric: "R$ 42.000 em vendas no zap",
        quote: "Sexta e sábado à noite entravam 80 mensagens juntas. O cliente não espera 15 minutos por um cardápio, ele vai no concorrente. Com a Bipe, a resposta sai em 3 segundos com as opções do dia e fecha o pedido.",
        stars: 5,
      },
      {
        id: "test-pizzaria",
        name: "Família Bella Napoli",
        role: "Atendimento & Salão",
        company: "Bella Napoli Forneria",
        segment: "Pizzaria",
        avatarUrl: "/testimonials/logo-bella-napoli.svg",
        metric: "Zero pedidos perdidos",
        quote: "Paramos de ter dor de cabeça com atendente anotando sabor errado ou esquecendo de responder. A agente envia o cardápio em PDF, confirma os adicionais e passa o total pro cliente na hora. Aumentou nosso faturamento.",
        stars: 5,
      },
      {
        id: "test-tecnologia",
        name: "TechHouse Soluções",
        role: "Diretoria Comercial",
        company: "TechHouse Soluções em TI",
        segment: "Tecnologia",
        avatarUrl: "/testimonials/logo-techhouse.svg",
        metric: "Ciclo de fechamento 70% menor",
        quote: "Nossa equipe gastava horas qualificando lead frio. A agente já pergunta o tamanho da empresa, o software que eles usam e encaminha o lead pronto e aquecido pro vendedor fechar no CRM.",
        stars: 5,
      },
      {
        id: "test-celulares",
        name: "Rodrigo Santos",
        role: "Proprietário",
        company: "FixSmart Celulares & Reparos",
        segment: "Conserto de Celulares",
        avatarUrl: "/testimonials/rodrigo.jpg",
        metric: "+95 orçamentos aprovados/mês",
        quote: "Todo mundo que quebra a tela do celular tem pressa e quer saber o preço na hora. A agente pergunta o modelo, já manda a estimativa de troca de vidro ou bateria e agenda a entrega no balcão. Não perco mais venda pra ninguém.",
        stars: 5,
      },
      {
        id: "test-barbearia",
        name: "Marcelo Ramos",
        role: "Barbeiro Chefe",
        company: "Barbearia Dom Rodrigo",
        segment: "Barbearia",
        avatarUrl: "/testimonials/rodrigo.jpg",
        metric: "+130 cortes/semana no piloto",
        quote: "Cortar cabelo com uma mão e responder WhatsApp com a outra não dá certo. A agente cuida dos horários de todos os barbeiros da casa, manda lembrete 2 horas antes pro cliente e facilitou nossa vida demais.",
        stars: 5,
      },
      {
        id: "test-delivery",
        name: "Paula Mendes",
        role: "Gerente de Produção",
        company: "Marmitas & Sabores Gourmet",
        segment: "Delivery",
        avatarUrl: "/testimonials/juliana.jpg",
        metric: "+320 pedidos automáticos no almoço",
        quote: "Das 11h às 13h o telefone tocava sem parar. A agente agora manda o cardápio do dia às 10h30, pega os pedidos de marmitex e envia o resumo pro motoboy. O almoço flui sem atraso e sem estresse.",
        stars: 5,
      },
      {
        id: "test-vestuario-fem-1",
        name: "Carolina Rezende",
        role: "Proprietária",
        company: "Boutique Rosa Chá Moda Feminina",
        segment: "Vestuário Feminino",
        avatarUrl: "/testimonials/carolina.jpg",
        metric: "Vendas 3x maiores pelo WhatsApp",
        quote: "Eu passava a noite inteira respondendo se ainda tinha o vestido tamanho M ou em qual cor. A agente manda fotos das peças, as medidas em centímetros e o link de pagamento. Eu acordo com pedidos já pagos!",
        stars: 5,
      },
      {
        id: "test-vestuario-fem-2",
        name: "Juliana Prado",
        role: "Estilista & Fundadora",
        company: "Ateliê Studio Moda Casual",
        segment: "Vestuário Feminino",
        avatarUrl: "/testimonials/juliana.jpg",
        metric: "+85% de conversão no Direct e Zap",
        quote: "Quem compra roupa na internet tem dúvida de caimento e tecido. Nossa agente responde na hora como uma vendedora simpática e atenciosa. As clientes elogiam o atendimento achando que sou eu respondendo!",
        stars: 5,
      },
      {
        id: "test-vestuario-masc",
        name: "Lucas Mendes",
        role: "Diretor Criativo",
        company: "Urban Man Moda Masculina",
        segment: "Vestuário Masculino",
        avatarUrl: "/testimonials/carlos.jpg",
        metric: "+R$ 28.000 em vendas pelo Zap",
        quote: "Homem não gosta de enrolação pra comprar. Ele quer saber se tem a calça preta tamanho 42 e quanto fica o frete. A agente resolve a dúvida em segundos e fecha. Mudou a escala da nossa marca.",
        stars: 5,
      },
      {
        id: "test-acessorios",
        name: "Fernanda Silveira",
        role: "Designer de Joias",
        company: "Fernanda Joias & Semijoias",
        segment: "Acessórios de Moda",
        avatarUrl: "/testimonials/fernanda.jpg",
        metric: "+160% de recompra de clientes",
        quote: "A agente não só vende peças novas como manda mensagem carinhosa de pós-venda e avisa quando chega novidade. Minhas clientes amam a atenção e o faturamento da loja dobrou.",
        stars: 5,
      },
      {
        id: "test-cosmeticos",
        name: "Ana Paula Rocha",
        role: "Consultora Beauty & Cuidados",
        company: "Ana Rocha Fragrâncias & Skincare",
        segment: "Cosméticos & Perfumaria",
        avatarUrl: "/assets/demo/cliente-ugc-camila.jpg",
        metric: "+190% vendas de kits pelo WhatsApp",
        quote: "Represento marcas consagradas de cosméticos e perfumes. A agente envia fotos dos kits para presente, calcula o frete e manda o Pix na hora. Minhas clientes amam o atendimento carinhoso e rápido!",
        stars: 5,
      },
      {
        id: "test-infoprodutos",
        name: "Lucas Mendonça",
        role: "Estrategista de Vendas Digitais",
        company: "Mendonça Digital Ventures",
        segment: "Infoprodutos & Cursos",
        avatarUrl: "/testimonials/carlos.jpg",
        metric: "R$ 58.000 recuperados em checkout",
        quote: "Vendo cursos e mentorias digitais. O abandono de checkout sempre foi um gargalo. A agente entra em contato em 30 segundos com quem abandonou o carrinho, tira dúvidas da garantia e converte no piloto automático!",
        stars: 5,
      },
    ],
  },
  aboutUs: {
    badge: "NOSSO PROPÓSITO & HISTÓRIA",
    title: "Tecnologia autônoma criada para fazer o negócio brasileiro crescer",
    subtitle: "Nascemos com a missão de transformar o WhatsApp de micro, pequenos e médios empresários em um canal de vendas acolhedor, rápido e lucrativo.",
    story: "Sabemos na pele como é a rotina corrida de quem empreende no Brasil: cuidar do estoque, atender clientes no balcão e ainda tentar responder dezenas de mensagens no WhatsApp tarde da noite. A BipeSend foi criada para acabar com o caos do atendimento amador e da perda de vendas por demora. Desenvolvemos uma inteligência artificial com alma brasileira — que conversa com simpatia, entende áudios e gírias regionais, envia propostas e arquivos, e trabalha 24 horas por dia para que você nunca mais perca um cliente.",
    founderName: "Germani Rodrigues",
    founderRole: "Fundador & Diretor de Produto na BipeSend",
    founderPhotoUrl: "/assets/brand/germani-avatar.jpg",
    founderQuote: "Nenhum empresário deveria perder clientes simplesmente porque estava ocupado trabalhando. Nossa inteligência cuida de cada mensagem com a mesma atenção e carinho que o dono do negócio cuidaria.",
    pillars: [
      {
        title: "Humanização Sem Robô Duro",
        description: "Voz natural com pausas e respiração real, envio de áudios e arquivos. Seu cliente sente que está falando com o melhor e mais atencioso atendente da sua equipe.",
      },
      {
        title: "Zero Código & Instalação em 5 Minutos",
        description: "Sem necessidade de programadores ou integrações complicadas. Conecte seu WhatsApp, defina a personalidade da sua agente e comece a vender.",
      },
      {
        title: "Vendas & Organização em Um Só Lugar",
        description: "Inbox unificado para WhatsApp, Instagram e TikTok integrado a um CRM Bipe Plus visual para você acompanhar cada etapa da negociação sem perder nenhum lead.",
      },
    ],
    stats: [
      { value: "+10.000", label: "Empresas Ativas no Brasil" },
      { value: "15M+", label: "Mensagens Humanizadas / Mês" },
      { value: "99.9%", label: "Disponibilidade Garantida" },
      { value: "< 3 seg", label: "Tempo Médio de Atendimento" },
    ],
  },
  faq: {
    badge: "DÚVIDAS FREQUENTES & RESPOSTAS DIRETAS",
    title: "Tudo o que você precisa saber antes de acelerar com a BipeSend",
    subtitle: "Respostas transparentes sobre segurança, implantação, WhatsApp e resultados práticos para o seu negócio.",
    items: [
      {
        id: "faq-1",
        question: "Como a BipeSend garante a segurança contra bloqueio do meu número de WhatsApp?",
        answer: "Utilizamos a BipeSend WhatsApp API com motor comportamental humanizado, distribuindo disparos em cadências seguras com intervalos variáveis, emulação de digitação e pausas naturais idênticas às de um operador humano real.",
      },
      {
        id: "faq-2",
        question: "Preciso saber programação ou contratar alguém para configurar a agente?",
        answer: "Absolutamente não. Em menos de 5 minutos você conecta seu número via QR Code, define o nome e personalidade da sua agente e ela já começa a responder dúvidas, enviar áudios, PDFs e alimentar seu CRM Bipe Plus automaticamente.",
      },
      {
        id: "faq-3",
        question: "Posso conectar mais de um atendente ou número na mesma conta?",
        answer: "Sim! Dependendo do plano escolhido, você pode conectar múltiplos números de WhatsApp, perfis de Instagram e contas de TikTok, além de convidar quantos membros de equipe precisar para operar a mesma caixa de entrada.",
      },
      {
        id: "faq-4",
        question: "Como funciona o envio de áudios com voz natural?",
        answer: "Sua agente utiliza modelos de voz de última geração calibrados para o português brasileiro. Ela envia áudios com entonação amigável, respiração e pausas naturais, sem aquele aspecto metálico ou robótico que afasta compradores.",
      },
      {
        id: "faq-5",
        question: "A BipeSend funciona no celular (Mobile)?",
        answer: "Sim! Toda a plataforma é 100% responsiva e conta com interface mobile dedicada. Você e seus operadores podem atender clientes, visualizar o CRM Bipe Plus e gerenciar campanhas diretamente pelo smartphone.",
      },
      {
        id: "faq-6",
        question: "Existe fidelidade ou multa rescisória?",
        answer: "Zero fidelidade. Você pode assinar o plano mensal e cancelar quando quiser com um clique direto pelo seu painel, sem contratos engessados nem taxas surpresa.",
      },
      {
        id: "faq-7",
        question: "Vocês emitem nota fiscal para empresas (PJ)?",
        answer: "Sim, emitimos Nota Fiscal de Prestação de Serviços (NFS-e) automaticamente para todos os pagamentos mensais ou anuais realizados na plataforma.",
      },
    ],
  },
  finalCta: {
    badge: "OPERAÇÃO IMEDIATA",
    title: "Chega de perder vendas por demora no atendimento",
    subtitle: "Ative sua própria Agente de IA, conecte seu WhatsApp e organize seu CRM em menos de 5 minutos.",
    ctaButtonText: "Criar Minha Conta Gratuita",
    ctaButtonLink: "/register",
    guaranteeBadge: "Sem necessidade de cartão de crédito • Configuração guiada em 5 minutos",
  },
  footer: {
    tagline: "CRM Bipe Plus, Atendimento Omnichannel, Envio de Áudio, Arquivos e Sua Própria Agente Personalizada para Vender Mais.",
    supportEmail: "contato@bipesend.com.br",
    copyright: "© 2026 BipeSend Tecnologia Ltda. Todos os direitos reservados.",
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/bipesend", label: "Instagram" },
      { platform: "whatsapp", url: "https://wa.me/5511999999999", label: "WhatsApp" },
      { platform: "linkedin", url: "https://linkedin.com/company/bipesend", label: "LinkedIn" },
      { platform: "youtube", url: "https://youtube.com/@bipesend", label: "YouTube" },
      { platform: "tiktok", url: "https://tiktok.com/@bipesend", label: "TikTok" },
    ],
  },
  seo: {
    metaTitle: "BipeSend | Sua Própria Agente de IA, Envio de Áudio, Arquivos e CRM Bipe Plus",
    metaDescription: "Automatize seu atendimento e vendas no WhatsApp, Instagram e TikTok 24/7 com sua própria Agente personalizada. Envio de áudios com voz humana, envio de arquivos e CRM Bipe Plus.",
    keywords: [
      "bipesend",
      "agente de ia",
      "atendimento whatsapp",
      "envio de audio whatsapp",
      "crm bipe plus",
      "automação de vendas",
      "agente personalizada",
      "disparos em massa",
      "omnichannel",
    ],
    canonicalUrl: "https://bipesend.com.br/landing",
    ogImage: "/assets/brand/bipesend-logovertical-preto-webp.webp",
    backlinks: [
      {
        id: "bl-1",
        title: "Ecossistema de IA & Produtividade BipeSend",
        url: "https://bipesend.com.br",
        rel: "noopener",
      },
      {
        id: "bl-2",
        title: "Central de Ajuda & Documentação Oficial",
        url: "https://bipesend.com.br/docs",
        rel: "noopener",
      },
    ],
  },
};

const DEFAULT_LANDING_PLANS: LandingPlan[] = [
  {
    id: "plan-starter",
    name: "Bipe Starter",
    description: "Ideal para autônomos e pequenos negócios iniciando no atendimento omnichannel.",
    priceMonthly: 147,
    priceYearly: 1470,
    isActive: true,
    showOnLandingPage: true,
    colorScheme: "blue",
    limits: {
      contacts: 2000,
      aiAgents: 1,
      whatsappConnections: 1,
      instagramConnections: 1,
      teamMembers: 2,
      monthlyAiMessages: 1500,
    },
    features: [
      "1 Agente Personalizada (Envio de Áudio, Voz e Arquivos)",
      "1 Conexão BipeSend WhatsApp API Oficial",
      "1 Perfil Instagram Direct integrado",
      "Simulação de digitação em tempo real",
      "Até 2.000 contatos gerenciados no CRM",
      "2 Usuários atendentes incluídos",
      "Suporte por e-mail e comunidade",
    ],
  },
  {
    id: "plan-growth",
    name: "Bipe Pro Growth",
    description: "Perfeito para empresas em aceleração de vendas e atendimento comercial dinâmico.",
    priceMonthly: 297,
    priceYearly: 2970,
    isActive: true,
    isPopular: true,
    showOnLandingPage: true,
    badge: "Mais Vendido",
    colorScheme: "emerald",
    limits: {
      contacts: 10000,
      aiAgents: 3,
      whatsappConnections: 2,
      instagramConnections: 2,
      teamMembers: 6,
      monthlyAiMessages: 8000,
    },
    features: [
      "3 Agentes Personalizadas simultâneas (Vendas, Suporte e SDR)",
      "2 Conexões BipeSend WhatsApp API independentes",
      "2 Conexões Instagram Direct",
      "CRM Bipe Plus com pipeline visual de oportunidades",
      "Envio de áudios com voz natural e arquivos",
      "Até 10.000 contatos no CRM com segmentação",
      "6 Atendentes humanos com controle de filas",
      "Transbordo automático para humanos",
      "Campanhas e disparos em massa programados",
    ],
  },
  {
    id: "plan-scale",
    name: "Bipe Enterprise Scale",
    description: "Para operações consolidadas com alto volume de tráfego, múltiplos números e times.",
    priceMonthly: 597,
    priceYearly: 5970,
    isActive: true,
    showOnLandingPage: true,
    colorScheme: "violet",
    limits: {
      contacts: 50000,
      aiAgents: 10,
      whatsappConnections: 5,
      instagramConnections: 5,
      teamMembers: 20,
      monthlyAiMessages: 35000,
    },
    features: [
      "10 Agentes Personalizadas para diferentes setores",
      "5 Conexões BipeSend WhatsApp API de alta vazão",
      "5 Conexões Instagram Direct + TikTok",
      "Envio de áudios com a sua voz e envio de arquivos ilimitados",
      "Até 50.000 contatos no CRM",
      "20 Membros de equipe com papéis RBAC avançados",
      "Roteamento por setores (Vendas, Suporte, Financeiro)",
      "Painel de auditoria e segurança contra jailbreak",
      "Suporte VIP prioritário via WhatsApp",
    ],
  },
  {
    id: "plan-vip-custom",
    name: "Bipe Custom VIP",
    description: "Plano sob medida para grandes franquias, agências ou operações ilimitadas.",
    priceMonthly: 1290,
    priceYearly: 12900,
    colorScheme: "amber",
    badge: "Exclusivo",
    isPopular: false,
    isActive: true,
    showOnLandingPage: true,
    limits: {
      contacts: -1,
      aiAgents: -1,
      whatsappConnections: 10,
      instagramConnections: 10,
      teamMembers: -1,
      monthlyAiMessages: -1,
    },
    features: [
      "Agentes de IA e Mensagens ilimitadas",
      "Contatos e Membros da equipe ilimitados",
      "10 Conexões BipeSend WhatsApp API dedicadas",
      "Sua Própria Agente Personalizada com envio de áudio e arquivos",
      "CRM Bipe Plus com múltiplos pipelines dedicados",
      "Roteamento por múltiplos setores com RBAC avançado",
      "Suporte VIP prioritário com gerente de conta dedicado",
    ],
  },
];

function getPlansFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "../../packages/contracts/src/fixtures/platform-plans.json"),
    path.resolve(process.cwd(), "packages/contracts/src/fixtures/platform-plans.json"),
    path.resolve(process.cwd(), "../contracts/src/fixtures/platform-plans.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function readStoredLandingPlans(): LandingPlan[] {
  try {
    const filePath = getPlansFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Erro ao ler platform-plans.json no tenant-web:", err);
  }
  return DEFAULT_LANDING_PLANS;
}

function getSiteContentFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), "../../packages/contracts/src/fixtures/site-content.json"),
    path.resolve(process.cwd(), "packages/contracts/src/fixtures/site-content.json"),
    path.resolve(process.cwd(), "../contracts/src/fixtures/site-content.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function readStoredSiteContent(): SiteContent {
  try {
    const filePath = getSiteContentFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object" && parsed.hero) {
        return {
          ...DEFAULT_LANDING_CONTENT,
          ...parsed,
          aboutUs: { ...DEFAULT_LANDING_CONTENT.aboutUs, ...(parsed.aboutUs || {}) },
          seo: { ...DEFAULT_LANDING_CONTENT.seo, ...(parsed.seo || {}) },
        };
      }
    }
  } catch (err) {
    console.error("Erro ao ler site-content.json no tenant-web:", err);
  }
  return DEFAULT_LANDING_CONTENT;
}

export async function getLandingContentAction(): Promise<SiteContent> {
  return readStoredSiteContent();
}

export async function getLandingPlansAction(): Promise<LandingPlan[]> {
  return readStoredLandingPlans();
}

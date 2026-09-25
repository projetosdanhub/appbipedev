import type { Metadata } from "next";
import { getLandingContentAction, getLandingPlansAction } from "@/features/landing/actions/landing.actions";
import { LandingPageView } from "@/features/landing/components/landing-page-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLandingContentAction();
  const defaultMetaTitle = "Venda Mais com sua Própria Agente de IA e Ferramentas Integradas | BipeSend";
  const defaultMetaDescription = "A plataforma completa que une atendimento omnichannel, agente de IA com personalidade própria, respostas inteligentes e envio de áudios com voz natural, envio de arquivos e vídeos, disparos em massa com proteção anti-bloqueio, CRM Plus, checkout transparente e inbox inteligente de mensagens.";
  const ogImageUrl = "https://bipesend.com.br/assets/brand/bipesend-logovertical-preto-webp.webp";

  const seo = content.seo || {
    metaTitle: defaultMetaTitle,
    metaDescription: defaultMetaDescription,
    keywords: [
      "bipesend",
      "agente de ia whatsapp",
      "crm plus",
      "checkout transparente whatsapp",
      "voz humanizada whatsapp",
      "crm bipe plus whatsapp",
      "atendimento 24/7 whatsapp",
      "envio de audio whatsapp",
      "envio de pdf whatsapp",
      "whatsapp api oficial",
      "automação instagram direct",
      "automação tiktok",
      "disparos em massa whatsapp",
    ],
    canonicalUrl: "https://bipesend.com.br/",
    ogImage: ogImageUrl,
  };

  const title = seo.domains?.landing?.tabTitle || seo.metaTitle || defaultMetaTitle;
  const description = seo.domains?.landing?.metaDescription || seo.metaDescription || defaultMetaDescription;
  const canonical = "https://bipesend.com.br/";

  return {
    metadataBase: new URL("https://bipesend.com.br"),
    title: {
      default: title,
      template: "%s | BipeSend",
    },
    description,
    keywords: seo.domains?.landing?.keywords || seo.keywords,
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/assets/brand/icon-logomarca-degradê-webp.webp", type: "image/webp" },
      ],
      shortcut: "/favicon.svg",
      apple: "/assets/brand/icon-logomarca-degradê-webp.webp",
    },
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "pt_BR",
      siteName: "BipeSend",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "BipeSend - Plataforma Oficial de Agentes de IA e CRM Bipe Plus",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LandingPage() {
  const [content, plans] = await Promise.all([
    getLandingContentAction(),
    getLandingPlansAction(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "BipeSend",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "BRL",
          "lowPrice": "147.00",
          "highPrice": "597.00",
          "offerCount": "4",
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "ratingCount": "1250",
          "bestRating": "5",
          "worstRating": "1",
        },
        "description":
          content.seo?.metaDescription ||
          "Plataforma completa de agentes autônomas de IA, envio humanizado de áudios gravados na hora, envio de propostas em PDF e CRM Bipe Plus para WhatsApp, Instagram e TikTok.",
      },
      {
        "@type": "Organization",
        "name": "BipeSend",
        "url": "https://bipesend.com.br",
        "logo": "https://bipesend.com.br/assets/brand/bipesend-logovertical-preto-webp.webp",
        "sameAs": [
          "https://instagram.com/bipesend",
        ],
        "founder": {
          "@type": "Person",
          "name": content.aboutUs?.founderName || "Germani Rodrigues",
          "jobTitle": "Fundador & CEO",
        },
      },
      {
        "@type": "WebSite",
        "name": "BipeSend",
        "url": "https://bipesend.com.br",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://bipesend.com.br/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "FAQPage",
        "mainEntity":
          content.faq?.items?.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer,
            },
          })) || [],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPageView content={content} plans={plans} />
    </>
  );
}

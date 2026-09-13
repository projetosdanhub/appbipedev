import { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
  title: "Login | BipeSend",
  description: "Acesse seu CRM e continue suas conversas com agilidade.",
  keywords: ["login", "bipesend", "crm", "atendimento"],
  openGraph: {
    title: "Login | BipeSend",
    description: "Acesse seu CRM e continue suas conversas com agilidade.",
    url: "https://bipesend.com.br/login",
    siteName: "BipeSend",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "/login",
  }
};

export default function LoginPage() {
  return <LoginClient />;
}

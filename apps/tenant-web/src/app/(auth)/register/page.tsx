import { Metadata } from "next";
import RegisterClient from "./register-client";

export const metadata: Metadata = {
  title: "Cadastro | BipeSend",
  description: "Em apenas um Bipe você organiza tudo, aumenta as vendas e cresce o seu negócio.",
  keywords: ["cadastro", "criar conta", "bipesend", "crm", "vendas"],
  openGraph: {
    title: "Cadastro | BipeSend",
    description: "Em apenas um Bipe você organiza tudo, aumenta as vendas e cresce o seu negócio.",
    url: "https://bipesend.com.br/register",
    siteName: "BipeSend",
    locale: "pt_BR",
    type: "website",
  },
  alternates: {
    canonical: "https://bipesend.com.br/register",
  }
};

export default function RegisterPage() {
  return <RegisterClient />;
}

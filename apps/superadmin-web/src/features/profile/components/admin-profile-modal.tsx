"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  User,
  ShieldCheck,
  KeyRound,
  Calendar,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock
} from "lucide-react";
import {
  getAdminProfileDataAction,
  updateAdminProfileAction,
  changeAdminPasswordAction,
  AdminProfileData
} from "../actions/admin-profile.actions";

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => Promise<void>;
  currentUserName?: string;
  currentUserEmail?: string;
  onProfileUpdated?: (newName: string, newImage?: string) => void;
}

const PRESET_AVATARS = [
  { id: "avatar-1", bg: "from-[#007BFF] to-[#6366F1]", label: "Tech Blue" },
  { id: "avatar-2", bg: "from-[#6366F1] to-[#A855F7]", label: "Violet AI" },
  { id: "avatar-3", bg: "from-[#10B981] to-[#059669]", label: "Emerald" },
  { id: "avatar-4", bg: "from-[#0F172A] to-[#334155]", label: "Graphite" },
  { id: "avatar-5", bg: "from-[#EA580C] to-[#F59E0B]", label: "Amber" },
];

export function AdminProfileModal({
  isOpen,
  onClose,
  onLogout,
  currentUserName = "SuperAdmin",
  currentUserEmail = "admin@bipesend.com.br",
  onProfileUpdated,
}: AdminProfileModalProps) {
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile Form States
  const [name, setName] = useState(currentUserName);
  const [selectedAvatarBg, setSelectedAvatarBg] = useState("from-[#007BFF] to-[#6366F1]");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lock background scroll without layout shift
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Load Admin Data on Open
  useEffect(() => {
    if (isOpen) {
      getAdminProfileDataAction().then((res) => {
        if (res.success && res.data) {
          setProfileData(res.data);
          setName(res.data.name);
          if (res.data.image) {
            if (res.data.image.startsWith("from-")) {
              setSelectedAvatarBg(res.data.image);
            } else {
              setCustomAvatarUrl(res.data.image);
            }
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const imageValue = customAvatarUrl.trim() || selectedAvatarBg;
    const res = await updateAdminProfileAction({
      name,
      image: imageValue,
    });

    setIsUpdatingProfile(false);
    if (res.success) {
      setProfileMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      if (onProfileUpdated) {
        onProfileUpdated(name, imageValue);
      }
    } else {
      setProfileMessage({ type: "error", text: res.error || "Erro ao salvar perfil." });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);

    const res = await changeAdminPasswordAction({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    setIsChangingPassword(false);
    if (res.success) {
      setPasswordMessage({ type: "success", text: "Senha alterada com sucesso! Guarde suas credenciais com segurança." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: res.error || "Erro ao alterar senha." });
    }
  };

  const formattedCreationDate = profileData?.createdAt
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(profileData.createdAt))
    : "Carregando...";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* ── Backdrop com Desfoque Leve e Suave ── */}
      <div 
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Painel Lateral Deslizante Executivo (Slide-Over Drawer com Sombra Suave) ── */}
      <aside 
        className="relative z-10 w-full sm:w-[480px] md:w-[500px] h-full bg-white shadow-[-8px_0_32px_rgba(15,23,42,0.06)] border-l border-[#E2E8F0] flex flex-col animate-in slide-in-from-right duration-300 ease-out select-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-drawer-title"
      >
        {/* ── Topo do Painel Lateral ── */}
        <div className="px-6 sm:px-7 py-6 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${selectedAvatarBg} flex items-center justify-center text-white font-extrabold text-base shadow-md ring-2 ring-white`}>
                  {name ? name.slice(0, 2).toUpperCase() : "SA"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" title="Sessão ativa com 2FA" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 id="profile-drawer-title" className="text-[17px] font-extrabold text-[#0F172A] leading-tight">
                    {name || "SuperAdmin"}
                  </h2>
                  <span className="text-[10px] font-bold text-[#007BFF] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                    Master
                  </span>
                </div>
                <p className="text-[12.5px] text-[#64748B] mt-0.5 truncate max-w-[220px]">
                  {currentUserEmail}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Pílulas de Navegação (Segmented Control) ── */}
          <div className="mt-5 p-1 bg-[#E2E8F0]/70 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === "profile"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Dados & Avatar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === "password"
                  ? "bg-white text-[#0F172A] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Segurança & Senha
            </button>
          </div>
        </div>

        {/* ── Conteúdo com Scroll Fino com Degradê da Marca ── */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6 custom-brand-scrollbar pr-3">
          
          {/* ABA 1: PERFIL & AVATAR */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {profileMessage && (
                <div
                  className={`p-3.5 rounded-xl text-[13px] flex items-center gap-2.5 font-medium animate-in fade-in duration-200 ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              {/* Seletor de Avatar Executivo */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-2.5">
                  Avatar Executivo da Plataforma
                </label>
                <div className="grid grid-cols-5 gap-2.5">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = selectedAvatarBg === preset.bg && !customAvatarUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatarBg(preset.bg);
                          setCustomAvatarUrl("");
                        }}
                        className={`group relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-[#007BFF] bg-blue-50/60 shadow-sm ring-2 ring-[#007BFF]/20"
                            : "border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${preset.bg} flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform`}>
                          {name ? name.slice(0, 2).toUpperCase() : "SA"}
                        </div>
                        <span className="text-[10px] font-semibold text-[#64748B] group-hover:text-[#0F172A] truncate max-w-full">
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Ou URL Customizada */}
                <div className="mt-3.5">
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">
                    Ou vincular URL de foto de perfil
                  </label>
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    className="w-full text-[13px] px-3.5 py-2 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"
                  />
                </div>
              </div>

              {/* Nome do Administrador */}
              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Nome do Administrador
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20 font-medium"
                />
              </div>

              {/* Metadados e Governança da Conta */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#007BFF]" />
                    E-mail Vinculado
                  </span>
                  <span className="font-semibold text-[#0F172A]">{currentUserEmail}</span>
                </div>

                <div className="flex items-center justify-between text-[13px] pt-2.5 border-t border-[#E2E8F0]">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#6366F1]" />
                    Conta Criada em
                  </span>
                  <span className="font-semibold text-[#0F172A]">{formattedCreationDate}</span>
                </div>

                <div className="flex items-center justify-between text-[13px] pt-2.5 border-t border-[#E2E8F0]">
                  <span className="text-[#64748B] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Status de Segurança
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    2FA & Sessão Master Ativa
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#6366F1] text-white px-5 py-2.5 rounded-xl text-[13.5px] font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações do Perfil"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ABA 2: ALTERAR SENHA */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordMessage && (
                <div
                  className={`p-3.5 rounded-xl text-[13px] flex items-center gap-2.5 font-medium animate-in fade-in duration-200 ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px] flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  Por governança corporativa, a alteração de senha utiliza criptografia com salt <strong>Argon2id</strong> e invalida sessões secundárias do SuperAdmin.
                </p>
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Nova Senha (mínimo 8 caracteres)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha segura"
                  className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:outline-none focus:border-[#007BFF] focus:ring-2 focus:ring-[#007BFF]/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-xl text-[13.5px] font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Atualizando Senha...
                    </>
                  ) : (
                    "Confirmar e Salvar Nova Senha"
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* ── Rodapé Fixo: Botão de Deslogar & Fechar ── */}
        <div className="p-6 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
          {onLogout ? (
            <form action={onLogout} className="flex-1">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                Deslogar da Plataforma
              </button>
            </form>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#475569] hover:bg-[#F1F5F9] text-[13px] font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>

      </aside>
    </div>
  );
}

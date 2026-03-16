"use client";
import { SignIn } from "@clerk/nextjs";
import { FlywheelLogo } from "@/components/flywheel-logo";
import { useT } from "@/lib/i18n";

export default function SignInPage() {
  const { t } = useT();

  const features = [
    { title: t("auth_f1_title"), desc: t("auth_f1_desc") },
    { title: t("auth_f2_title"), desc: t("auth_f2_desc") },
    { title: t("auth_f3_title"), desc: t("auth_f3_desc") },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 gap-6" style={{ backgroundColor: "var(--bg)" }}>
      {/* Scanline overlay (dark mode) */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {/* Left: Product intro */}
      <div className="hidden md:flex flex-col justify-between w-[420px] min-h-[540px] p-6 relative z-10">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <FlywheelLogo size={32} className="animate-[spin_8s_linear_infinite]" style={{ color: "var(--signal)" }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>嗅鐘</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("auth_subtitle")}</p>
            </div>
          </div>

          {/* Main headline */}
          <h2 className="text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
            {t("auth_signin_h_pre")}<span style={{ color: "var(--signal)" }}>8</span>{t("auth_signin_h_mid")}<br/>{t("auth_signin_h_line2")}<br/>{t("auth_signin_h_line3")}
          </h2>
          <p className="text-base mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {t("auth_signin_desc")}
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map(item => (
              <div key={item.title} className="flex gap-3 items-start">
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "var(--signal)" }} />
                <div>
                  <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tags */}
        <div className="flex items-center gap-2 text-sm mt-8" style={{ color: "var(--text-muted)" }}>
          <a href="/" className="underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]">
            {t("auth_invite_tag")}
          </a>
        </div>
      </div>

      {/* Right: Clerk sign-in */}
      <div className="relative z-10">
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#3CB371",
              colorBackground: "#141A12",
              colorText: "#E8EDE6",
              colorTextSecondary: "#8A9A80",
              colorInputBackground: "#111610",
              colorInputText: "#E8EDE6",
              colorNeutral: "#E8EDE6",
            },
            elements: {
              headerTitle: { color: "#E8EDE6" },
              headerSubtitle: { color: "#8A9A80" },
              formFieldLabel: { color: "#8A9A80" },
              socialButtonsBlockButton: { borderColor: "#1E2A1A", backgroundColor: "#111610", color: "#E8EDE6" },
              dividerText: { color: "#556650", opacity: "1" },
              dividerLine: { backgroundColor: "#1E2A1A" },
              footerActionText: { color: "#8A9A80", opacity: "1" },
              footerAction: { opacity: "1" },
              footer: { opacity: "1" },
              footerActionLink: { color: "#3CB371" },
              badge: { opacity: "1", color: "#556650" },
              card: { borderRadius: "16px", border: "1px solid #1E2A1A", boxShadow: "0 0 30px rgba(60,179,113,0.05)", backgroundColor: "#141A12" },
              formButtonPrimary: { backgroundColor: "#3CB371", color: "#0A0E08" },
            }
          }}
          fallbackRedirectUrl="/radar"
        />
      </div>
    </div>
  );
}

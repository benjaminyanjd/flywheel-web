"use client";
import { SignIn } from "@clerk/nextjs";
import { TopNav } from "@/components/top-nav";
import { useT } from "@/lib/i18n";
import { useTheme } from "next-themes";

export default function SignInPage() {
  const { t, lang } = useT();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const clerkDark = {
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
    },
  };

  const clerkLight = {
    variables: {
      colorPrimary: "#2D5A27",
      colorBackground: "#FAFAF7",
      colorText: "#1A2E16",
      colorTextSecondary: "#556650",
      colorInputBackground: "#FFFFFF",
      colorInputText: "#1A2E16",
      colorNeutral: "#1A2E16",
    },
    elements: {
      headerTitle: { color: "#1A2E16" },
      headerSubtitle: { color: "#556650" },
      formFieldLabel: { color: "#556650" },
      socialButtonsBlockButton: { borderColor: "#D4DDD0", backgroundColor: "#FFFFFF", color: "#1A2E16" },
      dividerText: { color: "#8A9A80", opacity: "1" },
      dividerLine: { backgroundColor: "#D4DDD0" },
      footerActionText: { color: "#556650", opacity: "1" },
      footerAction: { opacity: "1" },
      footer: { opacity: "1" },
      footerActionLink: { color: "#2D5A27" },
      badge: { opacity: "1", color: "#8A9A80" },
      card: { borderRadius: "16px", border: "1px solid #D4DDD0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", backgroundColor: "#FFFFFF" },
      formButtonPrimary: { backgroundColor: "#2D5A27", color: "#FFFFFF" },
    },
  };

  const features = [
    { title: t("auth_f1_title"), desc: t("auth_f1_desc") },
    { title: t("auth_f2_title"), desc: t("auth_f2_desc") },
    { title: t("auth_f3_title"), desc: t("auth_f3_desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      <TopNav hideCta hideLogin />
      <div className="flex-1 flex items-center justify-center p-6 gap-6">
      {/* Scanline overlay (dark mode) */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)"
      }} />

      {/* Left: Product intro */}
      <div className="hidden md:flex flex-col justify-between w-[420px] min-h-[540px] p-6 relative z-10">
        <div>
          {/* Main headline */}
          <h2 className="text-4xl font-bold mb-4 leading-tight" style={{ color: "var(--text-primary)" }}>
            {lang === "zh" ? (
              <>看到了，<br/><span style={{ color: "var(--signal)" }}>不等於</span><br/>知道怎麼做</>
            ) : (
              <>You saw it.<br/>But did you<br/><span style={{ color: "var(--signal)" }}>know what to do?</span></>
            )}
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


      </div>

      {/* Right: Clerk sign-in */}
      <div className="relative z-10">
        <SignIn
          appearance={isDark ? clerkDark : clerkLight}
          fallbackRedirectUrl="/radar"
        />
        <a href="/" className="block text-xs mt-3 text-center underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-muted)" }}>
          {t("auth_invite_tag")}
        </a>
      </div>
      </div>
    </div>
  );
}

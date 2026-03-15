"use client";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 gap-6">
      {/* Left: Product intro - no card, just text */}
      <div className="hidden md:flex flex-col justify-between w-[420px] min-h-[540px] p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <FlywheelLogo size={32} className="text-amber-400 animate-[spin_8s_linear_infinite]" />
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Flywheel</h1>
              <p className="text-slate-500 text-sm">{t("auth_subtitle")}</p>
            </div>
          </div>

          {/* Main headline */}
          <h2 className="text-4xl font-bold text-slate-100 mb-4 leading-tight">
            {t("auth_signin_h_pre")}<span className="text-amber-400">8</span>{t("auth_signin_h_mid")}<br/>{t("auth_signin_h_line2")}<br/>{t("auth_signin_h_line3")}
          </h2>
          <p className="text-amber-400/80 text-base mb-10 leading-relaxed">
            {t("auth_signin_desc")}
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map(item => (
              <div key={item.title} className="flex gap-3 items-start">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-200 font-semibold text-base">{item.title}</p>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tags */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mt-8">
          <a href="/" className="underline underline-offset-4 hover:text-slate-300 transition-colors">
            {t("auth_invite_tag")}
          </a>
        </div>
      </div>

      {/* Right: Clerk sign-in */}
      <SignIn
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#f59e0b",
            colorBackground: "#334155",
            colorText: "#f1f5f9",
            colorTextSecondary: "#e2e8f0",
            colorInputBackground: "#1e293b",
            colorInputText: "#f1f5f9",
            colorNeutral: "#f1f5f9",
          },
          elements: {
            headerTitle: { color: "#f1f5f9" },
            headerSubtitle: { color: "#cbd5e1" },
            formFieldLabel: { color: "#cbd5e1" },
            socialButtonsBlockButton: { borderColor: "#64748b" },
            dividerText: { color: "#94a3b8", opacity: "1" },
            dividerLine: { backgroundColor: "#475569" },
            footerActionText: { color: "#cbd5e1", opacity: "1" },
            footerAction: { opacity: "1" },
            footer: { opacity: "1" },
            footerActionLink: { color: "#f59e0b" },
            badge: { opacity: "1", color: "#64748b" },
          }
        }}
        fallbackRedirectUrl="/radar"
      />
    </div>
  );
}

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 gap-6">
      {/* Left: Product intro - no card, just text */}
      <div className="hidden md:flex flex-col justify-between w-[420px] min-h-[540px] p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <FlywheelLogo size={32} className="text-black animate-[spin_8s_linear_infinite]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Flywheel</h1>
              <p className="text-gray-400 text-sm">{t("auth_subtitle")}</p>
            </div>
          </div>

          {/* Main headline */}
          <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t("auth_signin_h_pre")}<span className="text-black">8</span>{t("auth_signin_h_mid")}<br/>{t("auth_signin_h_line2")}<br/>{t("auth_signin_h_line3")}
          </h2>
          <p className="text-gray-500 text-base mb-10 leading-relaxed">
            {t("auth_signin_desc")}
          </p>

          {/* Feature list */}
          <div className="space-y-5">
            {features.map(item => (
              <div key={item.title} className="flex gap-3 items-start">
                <span className="w-2 h-2 rounded-full bg-black mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 font-semibold text-base">{item.title}</p>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tags */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-8">
          <a href="/" className="underline underline-offset-4 hover:text-gray-600 transition-colors">
            {t("auth_invite_tag")}
          </a>
        </div>
      </div>

      {/* Right: Clerk sign-in */}
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#111111",
            colorBackground: "#ffffff",
            colorText: "#111111",
            colorTextSecondary: "#666666",
            colorInputBackground: "#ffffff",
            colorInputText: "#111111",
            colorNeutral: "#111111",
          },
          elements: {
            headerTitle: { color: "#111111" },
            headerSubtitle: { color: "#666666" },
            formFieldLabel: { color: "#666666" },
            socialButtonsBlockButton: { borderColor: "#e8e8e8" },
            dividerText: { color: "#999999", opacity: "1" },
            dividerLine: { backgroundColor: "#e8e8e8" },
            footerActionText: { color: "#666666", opacity: "1" },
            footerAction: { opacity: "1" },
            footer: { opacity: "1" },
            footerActionLink: { color: "#111111" },
            badge: { opacity: "1", color: "#999999" },
            card: { borderRadius: "16px", border: "1px solid #e8e8e8", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
          }
        }}
        fallbackRedirectUrl="/radar"
      />
    </div>
  );
}

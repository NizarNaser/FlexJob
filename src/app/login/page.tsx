import LoginClient from "@/components/LoginClient";

export default function LoginPage() {
  const enableDevLogin = process.env.ENABLE_DEV_LOGIN === "true";
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return <LoginClient enableDevLogin={enableDevLogin} googleConfigured={googleConfigured} />;
}

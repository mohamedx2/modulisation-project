import { AuthProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata = {
  title: "RENAULT AXIS | Industrial Intelligence",
  description: "Plateforme unifiée de gestion technique et automatisation Renault.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
import { AuthProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata = {
  title: "Modulisation Project",
  description: "Enterprise modulisation platform",
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
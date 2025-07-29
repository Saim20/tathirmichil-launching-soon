import "./globals.css";
import AuthProvider from "@/lib/auth/auth-provider";
import { bloxat } from "@/components/fonts";
import Picker from "@/layouts/Picker";
import { Toaster } from "sonner";

export const metadata = {
  title: "Tathirmichil",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${bloxat.className} bg-tathir-cream min-h-screen h-full w-full overflow-x-hidden`}
      >
        <AuthProvider>
          <Picker>{children}</Picker>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

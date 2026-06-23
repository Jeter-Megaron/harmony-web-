import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const display = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const mono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Harmony — gestão financeira",
  description: "Gestão financeira com fontes de renda separadas (Salário, Benefício, Vale) e amarração categoria→fonte.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          afterSignOutUrl="/sign-in"
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: "#8b6cff",
              borderRadius: "0.7rem",
            },
          }}
        >
          <StoreProvider>{children}</StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

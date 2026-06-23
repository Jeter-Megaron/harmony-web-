import { AppShell } from "@/components/AppShell";

// Rotas do app — protegidas pelo middleware do Clerk (src/proxy.ts).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

import { redirect } from "next/navigation";

// Login agora é via Clerk — rota antiga redireciona.
export default function LoginRedirect() {
  redirect("/sign-in");
}

import { redirect } from "next/navigation";

// Ajustes virou "Categorias" — redireciona a rota antiga.
export default function AjustesRedirect() {
  redirect("/categorias");
}

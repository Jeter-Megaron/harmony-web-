import { SignUp } from "@clerk/nextjs";
import { CosmicBg } from "@/components/CosmicBg";

export default function SignUpPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#07070c] px-4">
      <CosmicBg />
      <div className="relative z-10">
        <SignUp />
      </div>
    </main>
  );
}

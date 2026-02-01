import { Button } from "@/components/ui/button";
import Link from "next/link";

interface NavbarProps {
  userEmail?: string;
  onLogout?: () => void;
}

export function Navbar({ userEmail, onLogout }: NavbarProps) {
  return (
    <nav className="w-full bg-slate-800/50 border-b border-slate-700 p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-white hover:text-blue-400 cursor-pointer transition">
            ResidentSim
          </h1>
        </Link>

        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm text-slate-300">{userEmail}</span>
          )}

          <Link href="/profile">
            <Button className="bg-slate-700 hover:bg-slate-600 text-white">
              Perfil
            </Button>
          </Link>

          {onLogout && (
            <Button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cerrar Sesión
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

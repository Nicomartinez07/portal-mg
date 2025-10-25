// app/unauthorized/page.tsx
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold mb-3">Acceso Denegado</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          No tienes los permisos necesarios para ver esta página.  
          Si crees que se trata de un error, contacta con el administrador del sistema.
        </p>

        <Link
          href="/"
          className="inline-block bg-black text-white font-medium px-6 py-2 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

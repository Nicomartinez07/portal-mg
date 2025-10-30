"use client";

export default function Page() {
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Barra superior */}
      <div className="p-4">
        <h1 className="text-4xl font-semibold text-gray-800">Inicio</h1>
      </div>

      {/* Contenido centrado */}
      <div className="flex flex-col items-center justify-center grow">
        <img
          src="/LogoMGSinFondo.png"
          alt="Geely Logo"
          className="w-72 h-auto mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
          Morris Garages
        </h2>
      </div>
    </div>
  );
}

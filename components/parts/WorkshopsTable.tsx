"use client";
import Link from "next/link";

interface Workshop {
    id: number;
    name: string;
    manager: string | null;
    managerEmail: string | null; 
    address: string;
    state: string;
    city: string | null;
    phone1: string | null;
    email: string | null; 
}

export const TalleresTable = ({ talleres }: { talleres: Workshop[] }) => {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Encargado</th>
            <th className="px-4 py-3 text-left">Dirección</th>
            <th className="px-4 py-3 text-left">Provincia</th>
            <th className="px-4 py-3 text-left">Localidad</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-left">Email </th>
            <th className="px-4 py-3 text-left">Documentación</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {talleres.map((t: Workshop) => (
            <tr key={t.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 font-semibold">{t.name}</td>
              <td className="px-4 py-3">{t.manager || "-"}</td>
              <td className="px-4 py-3">{t.address || "-"}</td>
              <td className="px-4 py-3">{t.state || "-"}</td>
              <td className="px-4 py-3">{t.city || "-"}</td>
              <td className="px-4 py-3">{t.phone1 || "-"}</td>
              <td className="px-4 py-3">{t.managerEmail || "-"}</td>
              <td className="px-4 py-3">
                {t.name === "Eximar MG" ? (
                  <Link
                    href="/api/descargarRepuestos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar
                  </Link>
                ) : (
                  <span className="text-gray-400 italic"></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
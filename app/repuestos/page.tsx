"use client";

import { MGDashboard } from "../../components/mg-dashboard";
import { getTalleres, getRepuestos } from "./actions";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from "next/link";
import { useState } from "react";

// Componente del Modal
const ContactModal = ({ contact, onClose }: { 
  contact: any; 
  onClose: () => void; 
}) => {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-auto relative">
        <h2 className="text-2xl font-bold mb-4">Información de Contacto</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ×
        </button>

        {/* Datos del Contacto */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contacto</label>
              <input 
                readOnly 
                value={contact.contactName || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                readOnly 
                value={contact.email || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input 
              readOnly 
              value={contact.address || "-"} 
              className="border rounded px-3 py-2 w-full bg-gray-100" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
              <input 
                readOnly 
                value={contact.state || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localidad</label>
              <input 
                readOnly 
                value={contact.city || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 1</label>
              <input 
                readOnly 
                value={contact.phone1 || "-"} 
                className="border rounded px-3 py-2 w-full bg-gray-100" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 2</label>
            <input 
              readOnly 
              value={contact.phone2 || "-"} 
              className="border rounded px-3 py-2 w-full bg-gray-100" 
            />
          </div>
        </div>

        {/* Botón de Cerrar */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RepuestosPage() {
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Necesitamos hacer la carga de datos de manera diferente porque ahora es un client component
  const [talleres, setTalleres] = useState<any[]>([]);
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos cuando el componente se monte
  useState(() => {
    async function loadData() {
      try {
        const [talleresData, repuestosData] = await Promise.all([
          getTalleres(),
          getRepuestos()
        ]);
        setTalleres(talleresData);
        setRepuestos(repuestosData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  });

  if (loading) {
    return (
      <MGDashboard>
        <div className="bg-white rounded-lg shadow-sm min-h-screen p-6 flex items-center justify-center">
          <p>Cargando...</p>
        </div>
      </MGDashboard>
    );
  }

  return (
    <MGDashboard>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6">Stock de Repuestos</h1>
        <Tabs defaultValue="talleres" className="w-full">
          <TabsList>
            <TabsTrigger value="talleres">Datos de Talleres</TabsTrigger>
            <TabsTrigger value="repuestos">Listado de Repuestos</TabsTrigger>
          </TabsList>

          {/* 🔹 TAB DE TALLERES */}
          <TabsContent value="talleres">
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Encargado</th>
                    <th className="px-4 py-3 text-left">Dirección</th>
                    <th className="px-4 py-3 text-left">Provincia</th>
                    <th className="px-4 py-3 text-left">Localidad</th>
                    <th className="px-4 py-3 text-left">Teléfono</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Documentación</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {talleres.map((t) => (
                    <tr key={t.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{t.name}</td>
                      <td className="px-4 py-3">{t.manager || "-"}</td>
                      <td className="px-4 py-3">{t.address || "-"}</td>
                      <td className="px-4 py-3">{t.state || "-"}</td>
                      <td className="px-4 py-3">{t.city || "-"}</td>
                      <td className="px-4 py-3">{t.phone1 || "-"}</td>
                      <td className="px-4 py-3">{t.email || "-"}</td>
                      <td className="px-4 py-3">
                        <Link 
                          href="/archivos/talleres.pdf" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Descargar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* 🔹 TAB DE REPUESTOS */}
          <TabsContent value="repuestos">
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha de Carga</th>
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-left">Código</th>
                    <th className="px-4 py-3 text-left">Descripción</th>
                    <th className="px-4 py-3 text-left">Modelo</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Precio Venta</th>
                    <th className="px-4 py-3 text-left">Contacto</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {repuestos.map((rep) => (
                    <tr key={rep.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {rep.loadDate?.toLocaleDateString("es-AR") || "-"}
                      </td>
                      <td className="px-4 py-3">{rep.company?.name || "-"}</td>
                      <td className="px-4 py-3">{rep.code || "-"}</td>
                      <td className="px-4 py-3">{rep.description || "-"}</td>
                      <td className="px-4 py-3">{rep.model || "no posee"}</td>
                      <td className="px-4 py-3">{rep.stock ?? "-"}</td>
                      <td className="px-4 py-3">
                        {rep.salePrice ? `$${rep.salePrice}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => setSelectedContact(rep.contact)}
                          className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
                        >
                          contacto
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Contacto */}
      <ContactModal 
        contact={selectedContact} 
        onClose={() => setSelectedContact(null)} 
      />
    </MGDashboard>
  );
}
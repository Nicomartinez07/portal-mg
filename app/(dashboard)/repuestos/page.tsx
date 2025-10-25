"use client";

import { getTalleres, getRepuestos } from "./actions";
import { getCompanies } from "@/app/(dashboard)/actions/companies";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { importarStockRepuestos, descargarEjemploRepuestos } from '@/app/(dashboard)/repuestos/importar/actions'; 


// === TIPOS DE DATOS PARA LOS TALLERES ===
interface Workshop {
    id: number;
    name: string;
    manager: string | null;
    managerEmail: string | null; // <-- ¡El campo que agregaste!
    address: string;
    state: string;
    city: string | null;
    phone1: string | null;
    email: string | null; // El email de la compañía, no del manager
}

// === TIPOS DE DATOS PARA EL FORMULARIO DE IMPORTACIÓN ===
interface Company {
    id: number;
    name: string;
}

interface ReportError {
    fila: number;
    error: string;
}

interface ImportResult {
    success: boolean;
    message: string;
    errors?: ReportError[];
    totalRows?: number;
    inserted?: number;
}
// ========================================================
interface ImportPartFormProps { 
    companies: Company[];
    onClose: () => void; 
    eximarId: number | null; 
}

// === COMPONENTE DEL FORMULARIO DE IMPORTACIÓN (INTEGRADO) ===
const ImportPartForm: React.FC<ImportPartFormProps> = ({ companies, onClose, eximarId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [report, setReport] = useState<ImportResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejador para el botón "Importar"
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !selectedCompanyId || selectedCompanyId === '') {
      alert('Debe seleccionar un archivo y una empresa.');
      return;
    }

    // 💡 3. Calcular la bandera 'isEximar'
    const isEximar = eximarId ? parseInt(selectedCompanyId, 10) === eximarId : false;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('excelFile', selectedFile);
    formData.append('companyId', selectedCompanyId);
    
    // 💡 4. ENVIAR la bandera isEximar al Server Action
    formData.append('isEximar', isEximar.toString()); 

    setReport(null); 
    
    const result = await importarStockRepuestos(formData);
    setReport(result);
    setIsSubmitting(false);
  };
  
  // Manejador para el enlace "Descargar archivo de ejemplo"
  const handleDescargarEjemplo = async (e: React.MouseEvent) => {
      e.preventDefault();
      
      const result = await descargarEjemploRepuestos();

      if (result.success && result.fileBase64) {
          // Lógica para convertir Base64 a Blob y forzar la descarga (CLIENT-SIDE JS)
          const binaryString = atob(result.fileBase64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
      } else {
        alert('Error al generar la plantilla.');
      }
  };


  return (
    <div className="p-6 bg-white shadow-xl rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4">Importación de Stock de Repuestos</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold text-gray-500 hover:text-gray-800"
        >
          ×
        </button>

        <form onSubmit={handleSubmit}>
            {/* Selector de Empresa */}
            <label className="block mb-4">
              <span className="text-gray-700">Empresa a Importar:</span>
              <select 
                value={selectedCompanyId} 
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                required
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione una empresa</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            {/* Descargar Archivo de Ejemplo */}
            <p className="mb-2 text-sm text-gray-600">
              Seleccione un archivo para importar el stock de repuestos (.xlsx).
              <br />
              <a href="#" onClick={handleDescargarEjemplo} className="text-blue-600 hover:underline">
                Descargar archivo de ejemplo
              </a>
            </p>

            {/* Selector de Archivo */}
            <div className="mb-6">
              <input 
                type="file" 
                accept=".xlsx" 
                onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" 
                onClick={onClose} // Cierra el modal
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Importando...' : 'Importar'}
              </button>
            </div>
        </form>

        {/* Reporte de Resultados */}
        {report && (
          <div className={`mt-4 p-4 border rounded-lg ${report.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <p className="font-semibold text-lg mb-1">{report.success ? 'Importación Exitosa' : 'Importación con Errores'}</p>
            <p className="text-sm">
              {report.message}
              {report.inserted !== undefined && report.inserted > 0 && <span> Insertados: **{report.inserted}**</span>}
            </p>
            
            {report.errors && report.errors.length > 0 && (
              <div className="mt-3 text-sm max-h-40 overflow-y-auto border-t pt-2 border-red-200">
                <p className="font-medium text-red-700 mb-1">Detalles de Errores ({report.errors.length}):</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  {report.errors.map((err, i) => (
                    <li key={i} className="text-red-600">**Fila {err.fila}:** {err.error}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Si la importación fue exitosa o tiene errores que no impiden continuar, mostrar un botón para cerrar */}
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={onClose} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Aceptar y Cerrar
                </button>
            </div>
          </div>
        )}
    </div>
  );
};
// ========================================================


// Componente del Modal de Contacto
const ContactModal = ({ contact, onClose }: { 
  contact: any; 
  onClose: () => void; 
}) => {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[80vh] overflow-auto relative">
        <h2 className="text-2xl font-bold mb-4">Información de Contacto</h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ×
        </button>
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [talleres, setTalleres] = useState<any[]>([]);
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros
  const [filterModel, setFilterModel] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterCode, setFilterCode] = useState("");
  
  // Estados para los valores de búsqueda activos
  const [activeFilterModel, setActiveFilterModel] = useState("");
  const [activeFilterCompany, setActiveFilterCompany] = useState("");
  const [activeFilterCode, setActiveFilterCode] = useState("");

  // 🔹 Cargar datos iniciales
  useEffect(() => {
  async function loadData() {
    try {
      const [talleresData, repuestosData, companiesData] = await Promise.all([
        getTalleres(),
        getRepuestos(),
        getCompanies(),
      ]);
      // Forzar el tipo aquí si no está tipado en `useState`
      setTalleres(talleresData as Workshop[]); 
      setRepuestos(repuestosData);
      setCompanies(companiesData.map(c => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 🔹 Función para aplicar los filtros
  const handleSearch = () => {
    setActiveFilterModel(filterModel);
    setActiveFilterCompany(filterCompany);
    setActiveFilterCode(filterCode);
  };

  // 🔹 Filtrar repuestos basado en los filtros activos
  const filteredRepuestos = repuestos.filter((rep) => {
    const matchModel = activeFilterModel
      ? rep.model?.toLowerCase().includes(activeFilterModel.toLowerCase())
      : true;

    // Aquí convertimos el filtro a número antes de comparar
    const matchCompany = activeFilterCompany
        ? rep.company?.id === parseInt(activeFilterCompany)
        : true;

    const matchCode = activeFilterCode
        ? rep.code?.toLowerCase().includes(activeFilterCode.toLowerCase())
        : true;

    return matchModel && matchCompany && matchCode;
  });

  if (loading) {
    return (  
        <div className="bg-white rounded-lg shadow-sm min-h-screen p-6 flex items-center justify-center">
          <p>Cargando...</p>
        </div>
    );
  }

  // Función para cerrar y potencialmente refrescar datos (opcional)
  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    // 💡 Opcional: Podrías querer refrescar los datos de repuestos aquí si la importación fue exitosa
    // loadData(); // Tendrías que refactorizar loadData para que pueda llamarse fácilmente
  }

  return (
     <>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        
        {/* === HEADER CON EL BOTÓN DE IMPORTACIÓN === */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Stock de Repuestos</h1>
            
            {/* BOTÓN PARA ABRIR EL MODAL */}
            <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6-6m-6 6l-6-6M9 10h6" />
                </svg>
                Importar Stock
            </button>
        </div>
        {/* =========================================== */}

        <Tabs defaultValue="talleres" className="w-full">
          <TabsList>
            <TabsTrigger value="talleres">Datos de Talleres</TabsTrigger>
            <TabsTrigger value="repuestos">Listado de Repuestos</TabsTrigger>
          </TabsList>

       
          {/* TAB DE TALLERES */}
          <TabsContent value="talleres">
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
          </TabsContent>

           {/* TAB DE REPUESTOS */}
          <TabsContent value="repuestos">
            {/* Formulario de filtros */}
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex flex-wrap items-end gap-4 mb-6"
              >
                {/* Empresa */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <select
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                  >
                    <option value=""></option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Codigo */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar por código"
                    value={filterCode}
                    onChange={(e) => setFilterCode(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                  />
                </div>
                {/* Nombre */}
                <div className="flex flex-col flex-1 min-w-[200px]">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Modelo 
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar por Modelo"
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                  />
                </div>
                {/* Botón Buscar */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
                      />
                    </svg>
                    Buscar
                  </button>
                </div>
              </form>

            {/* Tabla de repuestos filtrada */}
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
                  {filteredRepuestos.map((rep) => (
                    <tr key={rep.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {rep.loadDate
                          ? new Date(rep.loadDate).toLocaleDateString("es-AR")
                          : "-"}
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
                          Contacto
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRepuestos.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                        {activeFilterModel || activeFilterCompany || activeFilterCode 
                          ? "No se encontraron resultados" 
                          : "Ingrese criterios de búsqueda y haga clic en Buscar"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Contacto (El que ya existía) */}
      <ContactModal 
        contact={selectedContact} 
        onClose={() => setSelectedContact(null)} 
      />

      {/* === MODAL DE IMPORTACIÓN (NUEVO) === */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center bg-black/50 z-[60]"> 
            <ImportPartForm 
                companies={companies} 
                onClose={handleCloseImportModal}
                eximarId={companies.find((c) => c.name === "Eximar MG")?.id ?? null}
            />
        </div>
      )}
      </>
  );
}
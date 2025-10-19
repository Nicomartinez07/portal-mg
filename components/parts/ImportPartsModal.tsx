import { getCompanies } from '@/app/actions/companies'; 
import { importarStockRepuestos, descargarEjemploRepuestos } from '@/app/repuestos/importar/actions'; 

// --- 2.1 Componente Contenedor (Server Component) ---
export default async function ImportPartModal() {
    const companies = await getCompanies();
    
    // 💡 PASO 1: Obtener la ID de Eximar MG
    const eximarCompany = companies.find(c => c.name === "Eximar MG");
    const eximarId = eximarCompany ? eximarCompany.id : null; // Si no existe, es null

    if (companies.length === 0) {
        return (
            <div className="text-red-500 p-4">
                No hay empresas disponibles para importar. Por favor, cree una empresa primero.
            </div>
        );
    }
    
    // 💡 PASO 2: Pasar la ID de Eximar al componente cliente
    return <ImportPartForm companies={companies} eximarId={eximarId} />;
}
// --- 2.2 Componente de Formulario (Client Component) ---
// El 'use client' es necesario para manejar el estado, los archivos y la descarga.

'use client'; 

import { useState } from 'react';

// Define el tipo de dato para las empresas
interface Company {
    id: number;
    name: string;
}

interface ReportError {
    fila: number;
    error: string;
}
interface ImportPartFormProps { 
    companies: Company[];
    eximarId: number | null; // <--- AGREGAR ESTO
}

interface ImportResult {
    success: boolean;
    message: string;
    errors?: ReportError[];
    totalRows?: number;
    inserted?: number;
}


interface DescargarEjemploResult {
      success: boolean;
      fileBase64?: string;
      filename?: string;
      message?: string;
  }


const ImportPartForm: React.FC<ImportPartFormProps> = ({ companies, eximarId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [report, setReport] = useState<ImportResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejador para el botón "Importar"
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !selectedCompanyId) {
      alert('Debe seleccionar un archivo y una empresa.');
      return;
    }

   setIsSubmitting(true);
    
    // 💡 PASO 3: Determinar si la empresa seleccionada es Eximar
    const isEximar = eximarId ? parseInt(selectedCompanyId, 10) === eximarId : false;

    const formData = new FormData();
    formData.append('excelFile', selectedFile);
    formData.append('companyId', selectedCompanyId);
    // 💡 PASO 4: Agregar la bandera al FormData
    formData.append('isEximar', isEximar.toString()); 
    
    setReport(null); 
    
    const result = await importarStockRepuestos(formData);
    setReport(result);
    setIsSubmitting(false);
  };
  
  
  const handleDescargarEjemplo = async (e: React.MouseEvent) => {
        e.preventDefault();
        const result: DescargarEjemploResult = await descargarEjemploRepuestos();
  
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
            a.download = result.filename || 'ejemplo.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
          alert(result.message || 'Error al generar la plantilla.');
        }
    };


  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-xl rounded-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Importación de Stock de Repuestos</h2>
        
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
          onClick={() => { /* Lógica para cerrar el modal o cancelar */ }}
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
        </div>
      )}
    </form>
  );
};
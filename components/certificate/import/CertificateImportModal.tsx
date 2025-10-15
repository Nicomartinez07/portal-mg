'use client'; 

import { useState } from 'react';

// 🚨 Asegúrate de que las rutas a tus actions sean correctas
import { importCertificates, downloadCertificateExample, ImportResult, DescargarEjemploResult } from "@/app/certificados/import/actions"; 

// --- Componente de Formulario ---
const CertificateImportForm: React.FC<{ onImportSuccess: () => void }> = ({ onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<ImportResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setReport(null);
  };


  // Manejador para el botón "Importar"
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Debe seleccionar un archivo.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    // 🚨 Clave consistente con el Server Action: 'excelFile'
    formData.append('excelFile', selectedFile); 

    setReport(null); 
    
    const result: ImportResult = await importCertificates(formData);
    setReport(result);
    setIsSubmitting(false);

    if (result.success && (!result.errors || result.errors.length === 0)) {
        onImportSuccess();
    }
  };
  
  
  const handleDescargarEjemplo = async (e: React.MouseEvent) => {
        e.preventDefault();
        const result: DescargarEjemploResult = await downloadCertificateExample();
  
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
            a.download = result.filename || 'ejemplo_certificados.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } else {
          alert(result.message || 'Error al generar la plantilla.');
        }
    };


  return (
    <>
      <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-md"
      >
          Importar Certificados
      </button>

      {modalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
              <form 
                  onSubmit={handleSubmit} 
                  className="p-6 bg-white shadow-xl rounded-lg max-w-lg w-full" 
                  onClick={e => e.stopPropagation()} // Evita que el clic en el formulario cierre el modal
              >
                  <h2 className="text-2xl font-bold mb-4">Importación de Certificados</h2>
                  
                  {/* Descargar Archivo de Ejemplo */}
                  <p className="mb-2 text-sm text-gray-600">
                      Seleccione un archivo para actualizar los certificados (.xlsx).
                      <br />
                      <a href="#" onClick={handleDescargarEjemplo} className="text-blue-600 hover:underline font-semibold">
                          Descargar plantilla de ejemplo
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
                          onClick={closeModal}
                      >
                          Cerrar
                      </button>
                      <button 
                          type="submit" 
                          disabled={isSubmitting || !selectedFile}
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
                              {report.inserted !== undefined && <span> Registros Actualizados: **{report.inserted}** de {report.totalRows}</span>}
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
          </div>
      )}
    </>
  );
};

export const CertificateImportModal = CertificateImportForm;
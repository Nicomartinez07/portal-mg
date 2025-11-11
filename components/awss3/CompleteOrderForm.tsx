// components/CompleteOrderForm.tsx
'use client';

import { useState } from 'react';
import ImageUploadField from './ImageUploadField';
import MultipleMediaUploadField from './MultipleMediaUploadField';
import PDFUploadField from './PDFUploadField';
import { uploadToS3, uploadMultipleToS3 } from '@/app/(dashboard)/actions/uploadToS3';

export default function CompleteOrderForm() {
  // Fotos únicas
  const [licensePlatePhoto, setLicensePlatePhoto] = useState<File | null>(null);
  const [vinPlatePhoto, setVinPlatePhoto] = useState<File | null>(null);
  const [odometerPhoto, setOdometerPhoto] = useState<File | null>(null);
  
  // Fotos múltiples
  const [additionalPhotos, setAdditionalPhotos] = useState<File[]>([]);
  const [orPhotos, setOrPhotos] = useState<File[]>([]);
  
  // PDFs
  const [pdfs, setPdfs] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar fotos requeridas
    if (!licensePlatePhoto || !vinPlatePhoto || !odometerPhoto) {
      alert('Por favor, sube las 3 fotos requeridas: Patente, VIN y Kilómetros');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // En tu caso real, primero crearías la orden en la BD para obtener el orderId
      // Por ahora usamos un ID de ejemplo
      const orderId = Date.now(); // Simula un ID único

      console.log('📤 Iniciando carga de archivos para orden:', orderId);

      // Subir fotos únicas
      const [licensePlateResult, vinPlateResult, odometerResult] = await Promise.all([
        uploadToS3(licensePlatePhoto, orderId, 'license_plate'),
        uploadToS3(vinPlatePhoto, orderId, 'vin_plate'),
        uploadToS3(odometerPhoto, orderId, 'odometer'),
      ]);

      // Subir fotos/videos múltiples (si existen)
      let additionalResults: any[] = [];
      let orResults: any[] = [];

      if (additionalPhotos.length > 0) {
        additionalResults = await uploadMultipleToS3(additionalPhotos, orderId, 'additional');
      }

      if (orPhotos.length > 0) {
        orResults = await uploadMultipleToS3(orPhotos, orderId, 'or');
      }

      // Subir PDFs (si existen)
      let pdfResults: any[] = [];
      if (pdfs.length > 0) {
        pdfResults = await uploadMultipleToS3(pdfs, orderId, 'report');
      }

      // Verificar que todas las subidas fueron exitosas
      const allResults = [
        licensePlateResult,
        vinPlateResult,
        odometerResult,
        ...additionalResults,
        ...orResults,
        ...pdfResults,
      ];

      const failedUploads = allResults.filter(r => !r.success);
      
      if (failedUploads.length > 0) {
        throw new Error(`Error al subir ${failedUploads.length} archivo(s)`);
      }

      // Preparar datos para guardar en BD (OrderPhoto)
      const photosToSave = [
        { type: 'license_plate', url: licensePlateResult.url! },
        { type: 'vin_plate', url: vinPlateResult.url! },
        { type: 'odometer', url: odometerResult.url! },
        ...additionalResults.map((r, i) => ({ 
          type: `additional_${i + 1}`, 
          url: r.url! 
        })),
        ...orResults.map((r, i) => ({ 
          type: `or_${i + 1}`, 
          url: r.url! 
        })),
        ...pdfResults.map((r, i) => ({ 
          type: `report_pdf_${i + 1}`, 
          url: r.url! 
        })),
      ];

      console.log('✅ Todos los archivos subidos exitosamente');
      console.log('📝 Datos para guardar en OrderPhoto:', photosToSave);

      // Aquí llamarías a tu server action para guardar la orden + fotos
      // Ejemplo:
      // await createOrderWithPhotos({
      //   ...otrosDatos,
      //   photos: photosToSave
      // });

      alert(`¡Formulario enviado con éxito! 
      
Total de archivos subidos: ${photosToSave.length}
- 3 fotos obligatorias
- ${additionalPhotos.length} fotos adicionales
- ${orPhotos.length} fotos OR
- ${pdfs.length} PDFs

Revisa la consola para ver todas las URLs generadas`);
      
      // Limpiar formulario
      setLicensePlatePhoto(null);
      setVinPlatePhoto(null);
      setOdometerPhoto(null);
      setAdditionalPhotos([]);
      setOrPhotos([]);
      setPdfs([]);
      
    } catch (error) {
      console.error('❌ Error al enviar formulario:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-8 bg-white rounded-lg shadow-lg">
      <div className="border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">Pre-Autorización</h2>
        <p className="text-sm text-gray-500 mt-1">
          Completa todos los campos requeridos y adjunta las fotos necesarias
        </p>
      </div>
      
      {/* Fotos obligatorias */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
          Fotos Obligatorias
        </h3>
        
        <ImageUploadField
          label="Foto de Patente"
          value={licensePlatePhoto}
          onChange={setLicensePlatePhoto}
          required
        />

        <ImageUploadField
          label="Foto de Chapa VIN"
          value={vinPlatePhoto}
          onChange={setVinPlatePhoto}
          required
        />

        <ImageUploadField
          label="Foto de Kilómetros"
          value={odometerPhoto}
          onChange={setOdometerPhoto}
          required
        />
      </div>

      {/* Fotos opcionales múltiples */}
      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
          Fotos Adicionales (Opcional)
        </h3>

        <MultipleMediaUploadField
          label="Piezas Adicionales (Fotos/Videos)"
          value={additionalPhotos}
          onChange={setAdditionalPhotos}
          maxFiles={10}
        />

        <MultipleMediaUploadField
          label="Fotos OR (Fotos/Videos)"
          value={orPhotos}
          onChange={setOrPhotos}
          maxFiles={10}
        />
      </div>

      {/* PDFs */}
      <div className="space-y-6 pt-6 border-t">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
          Reportes PDF (Opcional)
        </h3>

        <PDFUploadField
          label="Reportes de Mantenimiento"
          value={pdfs}
          onChange={setPdfs}
          maxFiles={2}
        />
      </div>

      {/* Error */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">❌ {submitError}</p>
        </div>
      )}

      {/* Resumen */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">📋 Resumen:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>✓ Fotos obligatorias: {[licensePlatePhoto, vinPlatePhoto, odometerPhoto].filter(Boolean).length}/3</li>
          <li>• Fotos adicionales: {additionalPhotos.length}</li>
          <li>• Fotos OR: {orPhotos.length}</li>
          <li>• PDFs: {pdfs.length}/2</li>
        </ul>
      </div>

      {/* Botón submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg shadow-md"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subiendo archivos...
          </span>
        ) : (
          '💾 Guardar Pre-Autorización'
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        * Los archivos se subirán a AWS S3 cuando presiones "Guardar"
      </p>
    </form>
  );
}
// components/awss3/PDFUploadField.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, FileText, ExternalLink } from 'lucide-react';
import { validatePDFFile } from '@/lib/fileValidation';

type PDFWithInfo = {
  file: File | null;
  name: string;
  size: string;
  url?: string; // ✅ Para PDFs actuales
  isNew: boolean; // ✅ Para distinguir nuevos de actuales
};

type PDFUploadFieldProps = {
  label: string;
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
  maxFiles?: number;
  required?: boolean;
  currentUrls?: string[]; // ✅ Nueva prop: URLs de PDFs actuales
};

export default function PDFUploadField({
  label,
  value,
  onChange,
  error,
  maxFiles = 2,
  required = false,
  currentUrls = [], // ✅ PDFs actuales desde la BD
}: PDFUploadFieldProps) {
  const [pdfsWithInfo, setPdfsWithInfo] = useState<PDFWithInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Cargar PDFs actuales al montar
  useEffect(() => {
    if (currentUrls.length > 0 && value.length === 0) {
      const currentPdfs: PDFWithInfo[] = currentUrls.map((url) => {
        const fileName = url.split('/').pop() || 'documento.pdf';
        return {
          file: null,
          name: fileName,
          size: '-',
          url,
          isNew: false,
        };
      });
      setPdfsWithInfo(currentPdfs);
    }
  }, [currentUrls, value.length]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Verificar límite de archivos
    const currentCount = pdfsWithInfo.filter(p => p.isNew).length;
    if (currentCount + selectedFiles.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} PDFs nuevos`);
      return;
    }

    const newPdfsWithInfo: PDFWithInfo[] = [];
    const newFiles: File[] = [];

    for (const file of selectedFiles) {
      // Validar archivo
      const validation = validatePDFFile(file);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      newPdfsWithInfo.push({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        isNew: true,
      });

      newFiles.push(file);
    }

    // Actualizar estado
    setPdfsWithInfo([...pdfsWithInfo, ...newPdfsWithInfo]);
    onChange([...value, ...newFiles]);

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const itemToRemove = pdfsWithInfo[index];
    
    if (itemToRemove.isNew) {
      // Si es nuevo, remover del estado
      const newPdfsWithInfo = pdfsWithInfo.filter((_, i) => i !== index);
      const newFilesIndex = pdfsWithInfo.slice(0, index).filter(p => p.isNew).length;
      const newFiles = value.filter((_, i) => i !== newFilesIndex);
      
      setPdfsWithInfo(newPdfsWithInfo);
      onChange(newFiles);
    } else {
      // Si es actual, solo remover de la vista
      const newPdfsWithInfo = pdfsWithInfo.filter((_, i) => i !== index);
      setPdfsWithInfo(newPdfsWithInfo);
    }
  };

  const newPdfsCount = pdfsWithInfo.filter(p => p.isNew).length;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {pdfsWithInfo.length > 0 && (
          <span className="ml-2 text-gray-500">
            ({newPdfsCount} nuevos / {maxFiles} máx)
          </span>
        )}
      </label>

      {/* Lista de PDFs */}
      {pdfsWithInfo.length > 0 && (
        <div className="space-y-2 mb-4">
          {pdfsWithInfo.map((pdf, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                pdf.isNew ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pdf.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">{pdf.size}</p>
                    {!pdf.isNew && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                        Actual
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {/* Botón para abrir si es actual */}
                {!pdf.isNew && pdf.url && (
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

                {/* Botón para eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Área de subida */}
      {newPdfsCount < maxFiles && (
        <div className="flex flex-col items-center justify-center w-full">
          <label
            htmlFor={`pdf-${label}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Agregar PDFs</span>
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              id={`pdf-${label}`}
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
              multiple={maxFiles > 1}
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
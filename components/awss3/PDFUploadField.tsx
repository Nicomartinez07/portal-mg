// components/PDFUploadField.tsx
'use client';

import { useState, useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { validatePDFFile } from '@/lib/fileValidation';

type PDFWithInfo = {
  file: File;
  name: string;
  size: string;
};

type PDFUploadFieldProps = {
  label: string;
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
  maxFiles?: number;
  required?: boolean;
};

export default function PDFUploadField({
  label,
  value,
  onChange,
  error,
  maxFiles = 2,
  required = false,
}: PDFUploadFieldProps) {
  const [pdfsWithInfo, setPdfsWithInfo] = useState<PDFWithInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Verificar límite de archivos
    if (value.length + selectedFiles.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} PDFs`);
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
    const newPdfsWithInfo = pdfsWithInfo.filter((_, i) => i !== index);
    const newFiles = value.filter((_, i) => i !== index);
    
    setPdfsWithInfo(newPdfsWithInfo);
    onChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {value.length > 0 && (
          <span className="ml-2 text-gray-500">
            ({value.length}/{maxFiles})
          </span>
        )}
      </label>

      {/* Área de subida */}
      {value.length < maxFiles && (
        <div className="flex flex-col items-center justify-center w-full mb-4">
          <label
            htmlFor={`pdf-${label}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Toca para seleccionar PDF</span>
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

      {/* Lista de PDFs */}
      {pdfsWithInfo.length > 0 && (
        <div className="space-y-2">
          {pdfsWithInfo.map((pdf, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pdf.name}
                  </p>
                  <p className="text-xs text-gray-500">{pdf.size}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex-shrink-0 ml-4 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
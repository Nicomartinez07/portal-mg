// components/awss3/ImageUploadField.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { validateImageFile } from '@/lib/fileValidation';
import { compressImage } from '@/lib/imageCompression';

type ImageUploadFieldProps = {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
  currentUrl?: string; // ✅ Nueva prop: URL de la imagen actual
};

export default function ImageUploadField({
  label,
  value,
  onChange,
  error,
  required = false,
  currentUrl, // ✅ Imagen actual desde la BD
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Cargar preview de imagen actual al montar
  useEffect(() => {
    if (currentUrl && !value) {
      setPreview(currentUrl);
    }
  }, [currentUrl, value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsCompressing(true);

    try {
      // Comprimir imagen si es necesario
      const processedFile = await compressImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(processedFile);

      // Actualizar valor
      onChange(processedFile);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert('Error al procesar la imagen');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemove = () => {
    setPreview(currentUrl || null); // ✅ Volver a la imagen actual si existe
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Determinar si hay imagen (nueva o actual)
  const hasImage = value || currentUrl;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-4 items-start">
        {/* ✅ Preview de imagen (actual o nueva) */}
        {preview && (
          <div className="relative flex-shrink-0">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
            />
            {value && ( // ✅ Solo mostrar botón X si es una nueva imagen
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            )}
            {isCompressing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <span className="text-white text-xs">Comprimiendo...</span>
              </div>
            )}
          </div>
        )}

        {/* ✅ Botón de subida */}
        <div className="flex-1">
          <label
            htmlFor={`file-${label}`}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">
                  {hasImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </span>
              </p>
              <p className="text-xs text-gray-500">JPG, PNG, WebP (MAX. 5MB)</p>
            </div>
            <input
              ref={fileInputRef}
              id={`file-${label}`}
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              onChange={handleFileChange}
              disabled={isCompressing}
            />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
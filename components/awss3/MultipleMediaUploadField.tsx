// components/MultipleMediaUploadField.tsx
'use client';

import { useState, useRef } from 'react';
import { X, Film } from 'lucide-react';
import { validateMediaFile } from '@/lib/fileValidation';
import { compressImage, isImage, isVideo } from '@/lib/imageCompression';

type FileWithPreview = {
  file: File;
  preview: string;
  isVideo: boolean;
};

type MultipleMediaUploadFieldProps = {
  label: string;
  value: File[];
  onChange: (files: File[]) => void;
  error?: string;
  maxFiles?: number;
  required?: boolean;
};

export default function MultipleMediaUploadField({
  label,
  value,
  onChange,
  error,
  maxFiles = 10,
  required = false,
}: MultipleMediaUploadFieldProps) {
  const [filesWithPreviews, setFilesWithPreviews] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // Verificar límite de archivos
    if (value.length + selectedFiles.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }

    setIsProcessing(true);

    try {
      const newFilesWithPreviews: FileWithPreview[] = [];
      const newFiles: File[] = [];

      for (const file of selectedFiles) {
        // Validar archivo
        const validation = validateMediaFile(file);
        if (!validation.valid) {
          alert(`${file.name}: ${validation.error}`);
          continue;
        }

        let processedFile = file;
        const isVideoFile = isVideo(file);

        // Comprimir solo si es imagen
        if (isImage(file)) {
          processedFile = await compressImage(file);
        }

        // Crear preview
        const preview = await createPreview(processedFile, isVideoFile);

        newFilesWithPreviews.push({
          file: processedFile,
          preview,
          isVideo: isVideoFile,
        });

        newFiles.push(processedFile);
      }

      // Actualizar estado
      setFilesWithPreviews([...filesWithPreviews, ...newFilesWithPreviews]);
      onChange([...value, ...newFiles]);

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al procesar archivos:', error);
      alert('Error al procesar uno o más archivos');
    } finally {
      setIsProcessing(false);
    }
  };

  const createPreview = (file: File, isVideoFile: boolean): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (isVideoFile) {
          // Para videos, crear thumbnail del primer frame
          const video = document.createElement('video');
          video.src = e.target?.result as string;
          video.currentTime = 1; // Capturar frame en 1 segundo
          
          video.onloadeddata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
          };

          video.onerror = () => {
            // Si falla, usar el video src directamente
            resolve(e.target?.result as string);
          };
        } else {
          resolve(e.target?.result as string);
        }
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleRemove = (index: number) => {
    const newFilesWithPreviews = filesWithPreviews.filter((_, i) => i !== index);
    const newFiles = value.filter((_, i) => i !== index);
    
    setFilesWithPreviews(newFilesWithPreviews);
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
                <span className="font-semibold">Toca para seleccionar</span>
              </p>
              <p className="text-xs text-gray-500">
                Fotos (MAX. 5MB) o Videos (MAX. 50MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              id={`file-${label}`}
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,video/webm"
              onChange={handleFileChange}
              disabled={isProcessing}
              multiple
            />
          </label>
        </div>
      )}

      {/* Grid de previews */}
      {filesWithPreviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filesWithPreviews.map((item, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
                {item.isVideo ? (
                  <div className="relative w-full h-full">
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <Film className="text-white" size={32} />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>

              {/* Indicador de tipo de archivo */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {item.isVideo ? 'Video' : 'Foto'}
              </div>
            </div>
          ))}
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-4">
          <span className="text-sm text-gray-500">Procesando archivos...</span>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
// components/PhotoUploader.tsx
'use client';

import { useState, useTransition } from 'react';
import { uploadOrderPhoto } from '@/app/(dashboard)/ordenes/images/actions'; // Asume que 'uploadOrderPhoto' está aquí

interface PhotoUploaderProps {
  orderId: number;
  photoType: string; // ej: "odometer" o "additional_parts"
  label: string;
  isSingle?: boolean; // True si solo se permite una foto (Patente, VIN)
  initialPhotos?: { id: number; url: string }[]; // Fotos ya cargadas (para borradores)
}

export function PhotoUploader({ orderId, photoType, label, isSingle = false, initialPhotos = [] }: PhotoUploaderProps) {
  const [isUploading, startTransition] = useTransition();
  const [photos, setPhotos] = useState(initialPhotos);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Maneja la subida de un archivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Crear FormData y URL local para previsualización
    const formData = new FormData();
    formData.append('photo', file); // 'photo' es el nombre que espera la Server Action

    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);
    event.target.value = ''; // Limpia el input para permitir subir la misma foto si hay error

    // 2. Ejecutar Server Action
    startTransition(async () => {
      const result = await uploadOrderPhoto(orderId, photoType, formData);

      setLocalPreviewUrl(null); // Limpiar previsualización local al terminar la subida

      if (result.success && result.url) {
        setError(null);
        
        // Si es una foto única, reemplaza. Si es múltiple, añade.
        const newPhotoEntry = { id: Date.now(), url: result.url }; // Usar Date.now() como id temporal

        setPhotos(prevPhotos => {
            if (isSingle) {
                return [newPhotoEntry]; // Reemplaza la única foto existente
            } else {
                return [...prevPhotos, newPhotoEntry]; // Añade a la lista
            }
        });

      } else {
        // Mostrar error de validación o subida
        setError(result.message);
      }
    });
  };

  // Función para eliminar una foto (requiere una nueva Server Action: deleteOrderPhoto)
  const handleDeletePhoto = async (photoId: number, url: string) => {
    // ⚠️ TODO: Implementar lógica de ELIMINACIÓN de la foto de S3 y de Prisma.
    // Necesitas un nuevo Server Action: deleteOrderPhoto(photoId, orderId, url)
    
    // Por ahora, solo la eliminamos del estado local:
    setPhotos(photos.filter(p => p.id !== photoId));
  };
  
  const currentPhotoCount = photos.length;

  return (
    <div className="border p-4 rounded-lg bg-white mb-4 shadow-sm">
      <label className="block text-gray-700 font-bold mb-2">{label}</label>

      {/* Input de Carga */}
      {(isSingle && currentPhotoCount > 0) ? (
        <p className="text-sm text-gray-500">Solo se permite una foto. Para cambiar, elimine la actual.</p>
      ) : (
        <input
          type="file"
          accept="image/*,video/mp4" // Aceptar imágenes y videos MP4
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      )}
      
      {isUploading && (
        <div className="mt-2 text-sm text-indigo-600 font-medium">Cargando archivo...</div>
      )}

      {/* Previsualizaciones y Galería */}
      <div className="mt-4 flex flex-wrap gap-3">
        {/* Muestra la miniatura cargando */}
        {localPreviewUrl && isUploading && (
             <div className="relative w-24 h-24 bg-gray-200 rounded-md border flex items-center justify-center animate-pulse">
                <span className="text-xs text-gray-600">Subiendo...</span>
             </div>
        )}

        {/* Muestra las fotos ya subidas */}
        {photos.map((photo) => (
          <div key={photo.id} className="relative w-24 h-24 group">
            <img 
              src={photo.url} 
              alt={photoType} 
              className="w-full h-full object-cover rounded-md border" 
            />
            {/* Botón de eliminar */}
            <button 
              onClick={() => handleDeletePhoto(photo.id, photo.url)}
              className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Eliminar foto"
            >
                {/* Ícono de X o Basura */} 🗑️ 
            </button>
          </div>
        ))}
      </div>

      {/* Manejo de Errores */}
      {error && (
        <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
// components/OrderPhotosSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { getOrderPhotos, OrganizedPhotos } from '@/app/(dashboard)/actions/getOrderPhotos';
import ImageViewer from './ImageViewer';
import MediaGallery from './MediaGallery';
import PDFViewer from './PDFViewer';

type OrderPhotosSectionProps = {
  orderId: number;
};

// --- Componente de "No adjunto" ---
// He movido el texto de "no adjunto" a un componente
// para que todos tengan el mismo estilo y padding.
const NoAttachment = ({ text = 'No adjunta' }: { text?: string }) => (
  <p className="text-gray-500 text-sm pt-1">{text}</p>
);

// --- Componente de Label ---
// Lo mismo para el label, para asegurar alineación.
const GridLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-gray-800 font-medium pt-1">{children}</label>
);


export default function OrderPhotosSection({ orderId }: OrderPhotosSectionProps) {
  const [photos, setPhotos] = useState<OrganizedPhotos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [orderId]);

  const loadPhotos = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getOrderPhotos(orderId);

    if (result.success && result.photos) {
      setPhotos(result.photos);
    } else {
      setError(result.error || 'Error al cargar fotos');
    }

    setIsLoading(false);
  };

  // Mover esta función fuera del return
  const prepareMediaItems = (items: any[]) => {
    return items.map(item => ({
      ...item,
      isVideo: item.url.includes('.mp4') || item.url.includes('.mov') || item.url.includes('.webm'),
    }));
  };

  // --- Estados de Carga y Error ---
  // Estos se mantienen igual que en tu versión funcional

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500 mt-2">Cargando fotos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">❌ {error}</p>
      </div>
    );
  }

  if (!photos) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">No hay fotos disponibles</p>
      </div>
    );
  }

  // Verificar si hay *algo* que mostrar
  const hasAnyContent =
    photos.licensePlate ||
    photos.vinPlate ||
    photos.odometer ||
    photos.additional.length > 0 ||
    photos.or.length > 0 ||
    photos.reportPdfs.length > 0;

  if (!hasAnyContent) {
    return (
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-500">Esta orden no tiene fotos ni documentos adjuntos</p>
      </div>
    );
  }

  // --- Renderizado Principal (Con el nuevo layout) ---

  return (
    <div className="mt-4">
      {/* Tomamos el título de tu primer snippet */}
      <h3 className="font-semibold mb-4 text-gray-900">Fotos y Documentos</h3>
      
      {/* Y aquí aplicamos la grilla que te gustó */}
      <div className="grid grid-cols-[160px_1fr] gap-x-4 gap-y-5 items-start">
        
        {/* Fila 1: Patente */}
        <GridLabel>Foto Patente</GridLabel>
        <div>
          {photos.licensePlate ? (
            <ImageViewer url={photos.licensePlate.url} alt="Foto de patente" />
          ) : (
            <NoAttachment />
          )}
        </div>

        {/* Fila 2: VIN */}
        <GridLabel>Foto VIN</GridLabel>
        <div>
          {photos.vinPlate ? (
            <ImageViewer url={photos.vinPlate.url} alt="Foto de VIN" />
          ) : (
            <NoAttachment />
          )}
        </div>

        {/* Fila 3: Kilómetros */}
        <GridLabel>Foto Kilómetros</GridLabel>
        <div>
          {photos.odometer ? (
            <ImageViewer url={photos.odometer.url} alt="Foto de kilómetros" />
          ) : (
            <NoAttachment />
          )}
        </div>

        {/* Fila 4: Piezas Adicionales */}
        <GridLabel>Fotos Piezas Adicionales</GridLabel>
        <div>
          {photos.additional.length > 0 ? (
            <MediaGallery
              items={prepareMediaItems(photos.additional)}
              label="" // El label ya está en la grilla
            />
          ) : (
            <NoAttachment text="No adjuntas" />
          )}
        </div>

        {/* Fila 5: Fotos OR */}
        <GridLabel>Fotos OR</GridLabel>
        <div>
          {photos.or.length > 0 ? (
            <MediaGallery
              items={prepareMediaItems(photos.or)}
              label="" // El label ya está en la grilla
            />
          ) : (
            <NoAttachment text="No adjuntas" />
          )}
        </div>

        {/* Fila 6: PDFs (Funcionalidad del script 2) */}
        <GridLabel>Reportes PDF</GridLabel>
        <div>
          {photos.reportPdfs.length > 0 ? (
            <PDFViewer
              items={photos.reportPdfs}
              label="" // El label ya está en la grilla
            />
          ) : (
            <NoAttachment text="No adjuntos" />
          )}
        </div>

      </div>
    </div>
  );
}
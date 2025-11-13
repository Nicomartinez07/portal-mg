// components/OrderPhotosSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { getOrderPhotos, OrganizedPhotos } from '@/app/(dashboard)/actions/getOrderPhotos';
import ImageViewer from './ImageViewer';
import MediaGallery from './MediaGallery';
import PDFViewer from './PDFViewer';

type OrderPhotosSectionProps = {
  orderId: number;
  orderType?: 'PRE_AUTORIZACION' | 'RECLAMO' | 'SERVICIO';
};

export default function OrderPhotosSection({ 
  orderId, 
  orderType = 'PRE_AUTORIZACION' 
}: OrderPhotosSectionProps) {
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

  // Verificar si hay fotos obligatorias
  const hasRequiredPhotos = photos.licensePlate && photos.vinPlate && photos.odometer;

  // Verificar si hay foto de firma (solo para RECLAMO)
  const hasCustomerSignature = orderType === 'RECLAMO' && photos.customerSignature;

  // Verificar si hay fotos opcionales
  const hasAdditionalPhotos = photos.additional.length > 0;
  const hasOrPhotos = photos.or.length > 0;
  const hasPdfs = photos.reportPdfs.length > 0;

  // Determinar si es video
  const prepareMediaItems = (items: any[]) => {
    return items.map(item => ({
      ...item,
      isVideo: item.url.includes('.mp4') || item.url.includes('.mov') || item.url.includes('.webm'),
    }));
  };

  return (
    <div className="space-y-6">
      

      {/* Fotos obligatorias */}
      {hasRequiredPhotos && (
        <div className="space-y-4">
          <h4 className="font-medium text-blue-800 text-sm mb-4"></h4>
          
          <div className="space-y-4">
            {photos.licensePlate && (
              <div className="grid grid-cols-[160px_1fr] gap-2 items-start">
                <label className="text-gray-800 text-sm pt-2">Foto patente</label>
                <div className="space-y-1">
                  <div className="max-w-[300px]">
                    <ImageViewer
                      url={photos.licensePlate.url}
                      alt="Foto de patente"
                    />
                  </div>
                  {((photos.licensePlate as any)?.timestamp) && (
                    <p className="text-xs text-gray-500">
                      {(photos.licensePlate as any).timestamp}
                    </p>
                  )}
                </div>
              </div>
            )}

            {photos.vinPlate && (
              <div className="grid grid-cols-[160px_1fr] gap-2 items-start">
                <label className="text-gray-800 text-sm pt-2">Foto chapa VIN</label>
                <div className="space-y-1">
                  <div className="max-w-[300px]">
                    <ImageViewer
                      url={photos.vinPlate.url}
                      alt="Foto de VIN"
                    />
                  </div>
                  {((photos.vinPlate as any)?.timestamp) && (
                    <p className="text-xs text-gray-500">
                      {(photos.vinPlate as any).timestamp}
                    </p>
                  )}
                </div>
              </div>
            )}

            {photos.odometer && (
              <div className="grid grid-cols-[160px_1fr] gap-2 items-start">
                <label className="text-gray-800 text-sm pt-2">Foto cuenta kilómetros</label>
                <div className="space-y-1">
                  <div className="max-w-[300px]">
                    <ImageViewer
                      url={photos.odometer.url}
                      alt="Foto de kilómetros"
                    />
                  </div>
                  {((photos.odometer as any)?.timestamp) && (
                    <p className="text-xs text-gray-500">
                      {(photos.odometer as any).timestamp}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Foto de firma del cliente (solo RECLAMO) */}
          {hasCustomerSignature && (
            <div className="grid grid-cols-[160px_1fr] gap-2 items-start pt-4 border-t border-gray-200">
              <label className="text-gray-800 text-sm pt-2">Firma Conformidad Cliente</label>
              <div className="space-y-1">
                <div className="max-w-[300px]">
                  <ImageViewer
                    url={photos.customerSignature!.url}
                    alt="Firma de conformidad del cliente"
                  />
                </div>
                {((photos.customerSignature as any)?.timestamp) && (
                  <p className="text-xs text-gray-500">
                    {(photos.customerSignature as any).timestamp}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fotos adicionales */}
      {(hasAdditionalPhotos || hasOrPhotos || hasPdfs) && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-800 text-sm mb-4"></h4>

          {hasAdditionalPhotos && (
            <div className="grid grid-cols-[160px_1fr] gap-2 items-start">
              <label className="text-gray-800 text-sm pt-2">Piezas Adicionales</label>
              <div>
                <MediaGallery
                  items={prepareMediaItems(photos.additional)}
                />
              </div>
            </div>
          )}

          {hasOrPhotos && (
            <div className="grid grid-cols-[160px_1fr] gap-2 items-start">
              <label className="text-gray-800 text-sm pt-2">Fotos OR</label>
              <div>
                <MediaGallery
                  items={prepareMediaItems(photos.or)}
                />
              </div>
            </div>
          )}

          {hasPdfs && (
            <PDFViewer
              items={photos.reportPdfs}
              label="Reportes PDF"
            />
          )}
        </div>
      )}

      {/* Si no hay ninguna foto */}
      {!hasRequiredPhotos && !hasAdditionalPhotos && !hasOrPhotos && !hasPdfs && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-500">Esta orden no tiene fotos adjuntas</p>
        </div>
      )}
    </div>
  );
}
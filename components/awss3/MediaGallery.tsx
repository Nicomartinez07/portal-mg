// components/MediaGallery.tsx
'use client';

import { useState } from 'react';
import { X, Film, ChevronLeft, ChevronRight } from 'lucide-react';

type MediaItem = {
  url: string;
  type: string; // 'additional_1', 'or_2', etc.
  isVideo?: boolean;
};

type MediaGalleryProps = {
  items: MediaItem[];
  label?: string;
};

export default function MediaGallery({ items, label }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return null;
  }

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null && selectedIndex < items.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const currentItem = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <>
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} ({items.length})
          </label>
        )}

        {/* Grid de thumbnails */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => openModal(index)}
              className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all aspect-square"
            >
              {item.isVideo ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Film className="text-gray-500" size={40} />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Video
                  </div>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Modal con navegación */}
      {selectedIndex !== null && currentItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
          onClick={closeModal}
        >
          {/* Botón cerrar */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg z-10"
          >
            <X size={24} className="text-gray-800" />
          </button>

          {/* Botón anterior */}
          {selectedIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg z-10"
            >
              <ChevronLeft size={32} className="text-gray-800" />
            </button>
          )}

          {/* Botón siguiente */}
          {selectedIndex < items.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg z-10"
            >
              <ChevronRight size={32} className="text-gray-800" />
            </button>
          )}

          {/* Contenido */}
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {currentItem.isVideo ? (
              <video
                controls
                className="max-w-full max-h-[90vh]"
                src={currentItem.url}
              >
                Tu navegador no soporta videos.
              </video>
            ) : (
              <img
                src={currentItem.url}
                alt={`Media ${selectedIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}

            {/* Contador */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white px-4 py-2 text-center">
              {selectedIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// components/ImageViewer.tsx
'use client';

import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

type ImageViewerProps = {
  url: string;
  alt: string;
  label?: string;
};

export default function ImageViewer({ url, alt, label }: ImageViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Thumbnail clickeable */}
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div
          onClick={() => setIsModalOpen(true)}
          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-all aspect-square max-w-[200px]"
        >
          <img
            src={url}
            alt={alt}
            className="w-full h-full object-cover"
          />
          {/* Overlay al hacer hover */}
          <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
            <ZoomIn className="text-white bg-blackopacity-0 group-hover:opacity-100 transition-opacity" size={32} />
          </div>
        </div>
      </div>

      {/* Modal para ver imagen grande */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-200 transition-colors shadow-lg z-10"
          >
            <X size={24} className="text-gray-800" />
          </button>

          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={url}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {label && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white px-4 py-2 text-center">
                {label}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
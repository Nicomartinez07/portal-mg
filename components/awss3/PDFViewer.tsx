// components/PDFViewer.tsx
'use client';

import { FileText, ExternalLink } from 'lucide-react';

type PDFItem = {
  url: string;
  type: string; // 'report_pdf_1', 'report_pdf_2', etc.
};

type PDFViewerProps = {
  items: PDFItem[];
  label?: string;
};

export default function PDFViewer({ items, label }: PDFViewerProps) {
  if (items.length === 0) {
    return null;
  }

  const handleOpenPDF = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'documento.pdf';
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} ({items.length})
        </label>
      )}

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <FileText className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getFileName(item.url)}
                </p>
                <p className="text-xs text-gray-500">Documento PDF</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenPDF(item.url)}
              className="flex-shrink-0 ml-4 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
            >
              <ExternalLink size={16} />
              Ver PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
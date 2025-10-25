"use client";

import { useState } from "react";
import { useWarranty } from "@/contexts/WarrantyContext"; // Asumo esta ruta a tu contexto
import { exportWarranties, ExportResult } from "@/app/(dashboard)/garantias/export/actions"; // Asumo que el action está aquíx

export const ExportButton = () => {
    const { filters } = useWarranty(); // Obtener los filtros del estado global
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleExport = async () => {
        setIsLoading(true);
        setMessage('Generando archivo...');
        
        try {
            // 2. Llamada: Llamar al Server Action con los filtros actuales
            const result: ExportResult = await exportWarranties(filters);

            if (result.success && result.fileBase64 && result.filename && result.mimeType) {
                // 3. Manejo de Respuesta: Éxito con data binaria

                // 4. Decodificación y 5. Descarga: Base64 a Blob (binario)
                const binaryString = atob(result.fileBase64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: result.mimeType });
                
                // Crear URL del Blob
                const url = window.URL.createObjectURL(blob);
                
                // 6. Forzar Descarga: Crear un elemento <a> invisible y simular click
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                
                // 7. Limpieza
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                setMessage(`¡Éxito! Archivo "${result.filename}" descargado.`);

            } else {
                // Mensaje de error (incluye el caso de no registros)
                setMessage(result.message || 'Error desconocido al exportar.');
                alert(result.message);
            }
        } catch (error) {
            console.error("Error en la descarga:", error);
            setMessage("Error al procesar la exportación.");
            alert("Ocurrió un error inesperado al exportar los datos.");
        } finally {
            setIsLoading(false);
            // Opcional: Limpiar el mensaje después de un tiempo
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="flex flex-col items-start">
            <button
                onClick={handleExport}
                disabled={isLoading} // 1. Estado: Deshabilitar el botón
                className={`px-4 py-2 rounded text-white font-semibold transition-colors 
                           ${isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
            >
                {isLoading ? 'Exportando...' : 'Exportar'}
            </button>
            {message && <p className={`mt-2 text-sm ${message.startsWith('¡Éxito') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
        </div>
    );
};
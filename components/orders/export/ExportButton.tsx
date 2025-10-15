"use client";

import { useState } from "react";
// 🚨 Asegúrate de que esta ruta sea correcta para tu OrderContext
import { useOrder } from "@/contexts/OrdersContext"; 
import { exportOrders, ExportResult } from "@/app/ordenes/export/actions"; // 🚨 Cambiar al nuevo action

export const ExportOrdersButton = () => {
    // 🚨 Usar el hook del contexto de Órdenes
    const { filters } = useOrder(); 
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleExport = async () => {
        setIsLoading(true);
        setMessage('Generando archivo de órdenes...');
        
        try {
            // 2. Llamada: Llamar al Server Action con los filtros actuales
            const result: ExportResult = await exportOrders(filters);

            if (result.success && result.fileBase64 && result.filename && result.mimeType) {
                // Decodificación y Descarga: Base64 a Blob (binario)
                const binaryString = atob(result.fileBase64);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: result.mimeType });
                
                // Forzar Descarga
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = result.filename;
                document.body.appendChild(a);
                a.click();
                
                // Limpieza
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                setMessage(`¡Éxito! Archivo "${result.filename}" descargado.`);

            } else {
                setMessage(result.message || 'Error desconocido al exportar órdenes.');
                alert(result.message);
            }
        } catch (error) {
            console.error("Error en la descarga:", error);
            setMessage("Error al procesar la exportación de órdenes.");
            alert("Ocurrió un error inesperado al exportar los datos.");
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="flex flex-col items-start">
            <button
                onClick={handleExport}
                disabled={isLoading}
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
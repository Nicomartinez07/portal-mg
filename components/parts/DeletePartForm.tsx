// components/parts/DeletePartForm.tsx
"use client";
import { useState } from "react";
import { borrarRepuestosEmpresa } from "@/app/(dashboard)/repuestos/actions";

interface DeletePartFormProps {
  companies: { id: number; name: string }[];
  onClose: () => void;
}

export function DeletePartForm({ companies, onClose }: DeletePartFormProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCompanyId) {
      setMessage({type: 'error', text: 'Por favor selecciona una empresa'});
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await borrarRepuestosEmpresa(Number(selectedCompanyId));
      
      if (result.success) {
        setMessage({type: 'success', text: result.message});
        setSelectedCompanyId("");
        // Opcional: recargar la página o actualizar datos después de 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({type: 'error', text: result.message});
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Error inesperado al intentar borrar repuestos'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-red-600">Borrar Repuestos por Empresa</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Seleccionar Empresa:
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={loading}
          >
            <option value="">Selecciona una empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !selectedCompanyId}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Borrando...' : 'Borrar Repuestos'}
          </button>
        </div>
      </form>
    </div>
  );
}
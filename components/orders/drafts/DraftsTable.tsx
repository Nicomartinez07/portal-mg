"use client";
import { useEffect, useState } from "react";
import { getDraftOrders } from "@/app/ordenes/borradores/actions";
import { useDraft } from "@/contexts/DraftContext";
import type { Draft } from "@/app/types";
import PreAuthorizationModal from "@/components/orders/modals/PreAuthorizationModal";
import ClaimModal from "@/components/orders/modals/ClaimModal";
import ServiceModal from "@/components/orders/modals/ServiceModal";

export const DraftTable = () => {
  const { filters } = useDraft();
  const [drafts, setDrafts] = useState<Draft[]>([]); // Usa el tipo Draft
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchDrafts = async () => {
    setLoading(true);
    const data = await getDraftOrders(filters);
    setDrafts(data as Draft[]); // Asegúrate de que los datos coincidan con el tipo Draft
    setLoading(false);
  };

  useEffect(() => {
    fetchDrafts();
  }, [filters]);

  const handleShowHistory = (draft: Draft) => {
    if (draft.statusHistory) {
      setHistoryData(draft.statusHistory);
      setShowHistoryModal(true);
    } else {
      setHistoryData([]);
      setShowHistoryModal(true);
    }
  };
  const getStatusClasses = (status: string) => {
  switch (status) {
    case 'AUTORIZADO':
      return 'bg-green-500 text-white';
    case 'RECHAZADO':
      return 'bg-red-500 text-white';
  }
};

  return (
    <>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tipo</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Número</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">VIN</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Usuario</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {drafts.length > 0 ? (
              drafts.map((draft) => (
                <tr key={draft.id} className="border-t">
                  <td className="px-4 py-2">
                    {draft.creationDate ? new Date(draft.creationDate as any).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{draft.type}</td>
                  <td className="px-4 py-2">{draft.id}</td>
                  <td className="px-4 py-2">{draft.orderNumber}</td>
                  <td className="px-4 py-2">{draft.vehicle?.vin || "-"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(draft.status)}`}>
                      {draft.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{draft.user?.username || "-"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedDraft(draft)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      data-testid={`detalles-${draft.id}`}   // 👈 identificador único
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  No se encontraron órdenes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Renderizado condicional de los modales */}
      {selectedDraft && (
        <>
          {selectedDraft.type === "PRE_AUTORIZACION" && (
            <PreAuthorizationModal
              drafts={selectedDraft}
              onClose={() => setSelectedDraft(null)}
              onShowHistory={handleShowHistory}
            />
          )}
          {selectedDraft.type === "RECLAMO" && (
            <ClaimModal
              drafts={selectedDraft}
              onClose={() => setSelectedDraft(null)}
              onShowHistory={handleShowHistory}
            />
          )}
          {selectedDraft.type === "SERVICIO" && (
            <ServiceModal
              drafts={selectedDraft}
              onClose={() => setSelectedDraft(null)}
              onShowHistory={handleShowHistory}
            />
          )}
        </>
      )}

      {/* Modal del Historial de Estados (Este es común a todos) */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-1/3 max-h-[80vh] overflow-auto relative">
            <h2 className="text-xl font-bold bg-white mb-4">Historial de Estados</h2>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-xl font-bold"
            >
              ×
            </button>
            <table className="w-full border rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Estado</th>
                  <th className="px-4 py-2 text-left text-sm">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((historyItem, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-xs">
                        <span className={`px-2 py-1 rounded text-white font-semibold 
                          ${historyItem.status === 'REJECTED' ? 'bg-red-500' : 'bg-green-500'}
                        `}>
                          {historyItem.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {new Date(historyItem.changedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-2 text-center text-gray-500">
                      No hay historial de estados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";
import { useEffect, useState } from "react";
import { getOrders } from "@/app/ordenes/actions";
import { useOrder } from "@/contexts/OrdersContext";
import type { Order } from "@/app/types";
import PreAuthorizationModal from "@/components/orders/modals/PreAuthorizationModal";
import ClaimModal from "@/components/orders/modals/ClaimModal";
import ServiceModal from "@/components/orders/modals/ServiceModal";

export default function OrdersTable() {
  const { filters } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]); // Usa el tipo Order
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders(filters);
    setOrders(data as Order[]); // Asegúrate de que los datos coincidan con el tipo Order
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleShowHistory = (order: Order) => {
    if (order.statusHistory) {
      setHistoryData(order.statusHistory);
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
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Estado interno</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Empresa</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Usuario</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">
                    {order.creationDate ? new Date(order.creationDate as any).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{order.type}</td>
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.orderNumber}</td>
                  <td className="px-4 py-2">{order.vehicle?.vin || "-"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{order.internalStatus}</td>
                  <td className="px-4 py-2">{order.company?.name}</td>
                  <td className="px-4 py-2">{order.user?.username || "-"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
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
      {selectedOrder && (
        <>
          {selectedOrder.type === "PRE_AUTORIZACION" && (
            <PreAuthorizationModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onShowHistory={handleShowHistory}
            />
          )}
          {selectedOrder.type === "RECLAMO" && (
            <ClaimModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onShowHistory={handleShowHistory}
            />
          )}
          {selectedOrder.type === "SERVICIO" && (
            <ServiceModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
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
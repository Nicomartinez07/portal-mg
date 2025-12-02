"use client";
import { useEffect, useState, useCallback } from "react";
import { getOrders } from "@/app/(dashboard)/ordenes/actions";
import { useOrder } from "@/contexts/OrdersContext";
import { useUser } from "@/hooks/useUser";
import type { Order } from "@/app/types";
import PreAuthorizationModal from "@/components/orders/modals/PreAuthorizationModal";
import EditObservedPreAuthorizationModal from "@/components/orders/modals/EditObservedPreAuthorizationModal";
import ClaimModal from "@/components/orders/modals/ClaimModal";
import EditObservedClaimModal from "@/components/orders/modals/EditObservedClaimModal";
import ServiceModal from "@/components/orders/modals/ServiceModal";
import Pagination from "@/components/ui/Pagination"; 

const ITEMS_PER_PAGE = 25;

export default function OrdersTable() {
  const { user } = useUser();
  const {
    filters,
    currentPage,
    setCurrentPage,
    totalOrders,
    setTotalOrders,
  } = useOrder();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditObservedModal, setShowEditObservedModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOrders({
        filters,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });

      setOrders(response.data as Order[]);
      setTotalOrders(response.total);
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, setTotalOrders]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShowHistory = (order: Order) => {
    if (order.statusHistory) {
      setHistoryData(order.statusHistory);
      setShowHistoryModal(true);
    } else {
      setHistoryData([]);
      setShowHistoryModal(true);
    }
  };

  // ✅ FUNCIÓN ACTUALIZADA: Detectar si el usuario puede editar una orden observada
  const handleOrderClick = (order: Order) => {
    if (!user) {
      setSelectedOrder(order);
      return;
    }

    // ✅ Si la orden está OBSERVADA, es PRE_AUTORIZACION o RECLAMO, y el usuario es el creador
    if (
      order.status === "OBSERVADO" &&
      (order.type === "PRE_AUTORIZACION" || order.type === "RECLAMO") &&
      order.userId === user.userId &&
      (user.role === "WORKSHOP" || user.role === "DEALER")
    ) {
      // Abrir modal de edición
      setSelectedOrder(order);
      setShowEditObservedModal(true);
    } else {
      // Abrir modal de visualización normal
      setSelectedOrder(order);
      setShowEditObservedModal(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowEditObservedModal(false);
  };

  const getStatusClasses = (status: string | null | undefined) => {
    if (!status) {
      return "text-black";
    }
    switch (status) {
      case "AUTORIZADO":
        return "bg-green-500 text-white";
      case "RECHAZADO":
        return "bg-red-500 text-white";
      case "OBSERVADO":
        return "bg-yellow-500 text-white";
      default:
        return "text-black";
    }
  };
  
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  return (
    <>
      {!loading && totalOrders > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2">
          <div className="hidden sm:block text-sm text-gray-700 mb-2 sm:mb-0">
            Total: <strong>{totalOrders}</strong>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
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
            {loading ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  Cargando órdenes...
                </td>
              </tr>
            ) : orders.length > 0 ? (
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
                      {order.status || "SIN ESTADO"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{order.internalStatus}</td>
                  <td className="px-4 py-2">{order.company?.name}</td>
                  <td className="px-4 py-2">{order.user?.username || "-"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleOrderClick(order)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      data-testid={`detalles-${order.id}`}
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

      {/* ✅ RENDERIZADO CONDICIONAL DE MODALES ACTUALIZADO */}
      {selectedOrder && (
        <>
          {/* Si es OBSERVADA y es el creador, abrir modal de edición */}
          {showEditObservedModal ? (
            <>
              {selectedOrder.type === "PRE_AUTORIZACION" && (
                <EditObservedPreAuthorizationModal
                  order={selectedOrder}
                  onClose={handleCloseModal}
                  onOrderUpdated={fetchOrders}
                />
              )}
              {selectedOrder.type === "RECLAMO" && (
                <EditObservedClaimModal
                  order={selectedOrder}
                  onClose={handleCloseModal}
                  onOrderUpdated={fetchOrders}
                />
              )}
            </>
          ) : (
            /* Si no, abrir modal de visualización normal */
            <>
              {selectedOrder.type === "PRE_AUTORIZACION" && (
                <PreAuthorizationModal
                  order={selectedOrder}
                  onClose={handleCloseModal}
                  onShowHistory={handleShowHistory}
                  onOrderUpdated={fetchOrders}
                />
              )}
              {selectedOrder.type === "RECLAMO" && (
                <ClaimModal
                  order={selectedOrder}
                  onClose={handleCloseModal}
                  onShowHistory={handleShowHistory}
                  onOrderUpdated={fetchOrders}
                />
              )}
              {selectedOrder.type === "SERVICIO" && (
                <ServiceModal
                  order={selectedOrder}
                  onClose={handleCloseModal}
                  onShowHistory={handleShowHistory}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Modal del Historial de Estados */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
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
                  <th className="px-4 py-2 text-left text-sm">Observación</th>
                </tr>
              </thead>
              <tbody>
                {historyData.length > 0 ? (
                  historyData.map((historyItem, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-xs">
                        <span className={`px-2 py-1 rounded text-white font-semibold ${
                          historyItem.status === "REJECTED" ? "bg-red-500" : "bg-green-500"
                        }`}>
                          {historyItem.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {new Date(historyItem.changedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {historyItem.observation || "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
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
"use client";
import { useEffect, useState, useCallback } from "react";
import { getOrders } from "@/app/(dashboard)/ordenes/actions";
import { useOrder } from "@/contexts/OrdersContext";
import type { Order } from "@/app/types";
import PreAuthorizationModal from "@/components/orders/modals/PreAuthorizationModal";
import ClaimModal from "@/components/orders/modals/ClaimModal";
import ServiceModal from "@/components/orders/modals/ServiceModal";
import Pagination from "@/components/ui/Pagination"; 

const ITEMS_PER_PAGE = 25;

export default function OrdersTable() {
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Creamos la función para buscar órdenes
  // Usamos useCallback para evitar que se cree en cada render
  // y para controlar sus dependencias (filters, currentPage)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Llamamos a la server action AHORA con los filtros y la paginación
      const response = await getOrders({
        filters,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });

      // La action nos devuelve un objeto { data, total }
      setOrders(response.data as Order[]);
      setTotalOrders(response.total); // Actualizamos el total en el contexto
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
      setOrders([]); // En caso de error, vaciamos la tabla
      setTotalOrders(0); // y reseteamos el total
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, setTotalOrders]);

  // Este efecto se dispara cuando el componente se monta
  // y CADA VEZ que `fetchOrders` cambia (o sea, cuando filters o currentPage cambian)
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // --- Tus funciones de ayuda (sin cambios) ---
  const handleShowHistory = (order: Order) => {
    if (order.statusHistory) {
      setHistoryData(order.statusHistory);
      setShowHistoryModal(true);
    } else {
      setHistoryData([]);
      setShowHistoryModal(true);
    }
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
      default:
        return "text-black";
    }
  };
  
  // Calculamos el total de páginas
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  return (
    <>
      {/* --- PAGINADOR --- */}
      {!loading && totalOrders > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2">
          {/* Ocultar en mobile */}
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
            {/* Manejo de estado de carga */}
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
                      onClick={() => setSelectedOrder(order)}
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

      {/* --- RENDERIZADO DE MODALES (Sin cambios) --- */}
      {selectedOrder && (
        <>
          {selectedOrder.type === "PRE_AUTORIZACION" && (
            <PreAuthorizationModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onShowHistory={handleShowHistory}
              onOrderUpdated={fetchOrders} // Pasamos fetchOrders para refrescar
            />
          )}
          {selectedOrder.type === "RECLAMO" && (
            <ClaimModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onShowHistory={handleShowHistory}
              onOrderUpdated={fetchOrders} // Pasamos fetchOrders para refrescar
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

      {/* Modal del Historial de Estados (Sin cambios) */}
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
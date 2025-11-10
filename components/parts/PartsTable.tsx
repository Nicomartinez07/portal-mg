"use client";
import { useState, useEffect, useCallback } from "react";
import { useRepuestos } from "@/contexts/PartsContext";
import { getRepuestos } from "@/app/(dashboard)/repuestos/actions"; 
import Pagination from "@/components/ui/Pagination"; 
import { ContactModal } from "@/components/parts/ContactModal";


type Repuesto = any; 
const ITEMS_PER_PAGE = 25;

export const RepuestosTable = () => {
  const {
    filters,
    currentPage,
    setCurrentPage,
    totalRepuestos,
    setTotalRepuestos,
  } = useRepuestos();

  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);

  // Función de búsqueda
  const fetchRepuestos = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await getRepuestos({
        filters,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });
      setRepuestos(response.data);
      setTotalRepuestos(response.total);
    } catch (error) {
      console.error("Error al obtener repuestos:", error);
      setRepuestos([]);
      setTotalRepuestos(0);
    } finally {
      setIsFetching(false);
    }
  }, [filters, currentPage, setTotalRepuestos]);

  // Efecto que llama a la búsqueda
  useEffect(() => {
    fetchRepuestos();
  }, [fetchRepuestos]);

  const totalPages = Math.ceil(totalRepuestos / ITEMS_PER_PAGE);

  return (
    <>
      {/* Paginador (arriba) */}
      {!isFetching && totalRepuestos > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2">
          <div className="hidden sm:block text-sm text-gray-700 mb-2 sm:mb-0">
            Total: <strong>{totalRepuestos}</strong>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}

      {/* Tabla de repuestos */}
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Fecha de Carga</th>
              <th className="px-4 py-3 text-left">Empresa</th>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Precio Venta</th>
              <th className="px-4 py-3 text-left">Contacto</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isFetching ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  Cargando repuestos...
                </td>
              </tr>
            ) : repuestos.length > 0 ? (
              repuestos.map((rep) => (
                <tr key={rep.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {rep.loadDate
                      ? new Date(rep.loadDate).toLocaleDateString("es-AR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{rep.company?.name || "-"}</td>
                  <td className="px-4 py-3">{rep.code || "-"}</td>
                  <td className="px-4 py-3">{rep.description || "-"}</td>
                  <td className="px-4 py-3">{rep.model || "no posee"}</td>
                  <td className="px-4 py-3">{rep.stock ?? "-"}</td>
                  <td className="px-4 py-3">
                    {rep.salePrice ? `$${rep.salePrice}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedContact(rep.contact)}
                      className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300"
                    >
                      Contacto
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  {filters.code || filters.companyId || filters.model
                    ? "No se encontraron resultados para esta búsqueda"
                    : "No hay repuestos para mostrar"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Contacto (El que ya existía) */}
      <ContactModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />
    </>
  );
};
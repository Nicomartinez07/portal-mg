"use client";
import { useState } from "react";
import { useCertificate } from "../../contexts/CertificateContext";
import { useEffect, useCallback } from "react";
import { deleteWarranty } from "../../app/(dashboard)/garantias/actions";
import { getCertificates } from "../../app/(dashboard)/certificados/actions";
import Pagination from "@/components/ui/Pagination";

type Certificate = any;
const ITEMS_PER_PAGE = 25;


const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toISOString().slice(0, 10);
  } catch (e) {
    return "Fecha Inválida";
  }
};

export const CertificateTable = () => {
  const {
    filters,
    currentPage,
    setCurrentPage,
    totalCertificates,
    setTotalCertificates,
  } = useCertificate();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false); 
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);


  const fetchCertificates = useCallback(async () => {
    setIsTableLoading(true);
    try {
      const response = await getCertificates({
        filters,
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      });
      setCertificates(response.data as Certificate[]);
      setTotalCertificates(response.total);
    } catch (error) {
      console.error("Error al obtener los certificados:", error);
      setCertificates([]);
      setTotalCertificates(0);
    } finally {
      setIsTableLoading(false);
    }
  }, [filters, currentPage, setTotalCertificates]);

 
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleDownload = async () => {
    if (!selected || !selected.warranty) {
      alert("Este vehículo no tiene una garantía para descargar.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/certificates/${selected.warranty.id}`, {
        method: "GET",
        credentials: "include",
      });
       if (!res.ok) throw new Error("Error al generar certificado");
       const blob = await res.blob();
       const url = window.URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = `certificado-${selected.warranty.id}.pdf`;
       document.body.appendChild(a);
       a.click();
       a.remove();
       window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el certificado");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCertificates / ITEMS_PER_PAGE);

  return (
    <>
      {/* --- BLOQUE DE PAGINACIÓN --- */}
      {!isTableLoading && totalCertificates > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2">
          <div className="hidden sm:block text-sm text-gray-700 mb-2 sm:mb-0">
            Total: <strong>{totalCertificates}</strong>
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
              <th className="px-4 py-3 text-left">Bloqueado</th>
              <th className="px-4 py-3 text-left">VIN</th>
              <th className="px-4 py-3 text-left">Modelo</th>
              <th className="px-4 py-3 text-left">Nro. Certificado</th>
              <th className="px-4 py-3 text-left">F. Importación</th>
              <th className="px-4 py-3 text-left">Garantia</th>
              <th className="px-4 py-3 text-left">Venta</th>
              <th className="px-4 py-3 text-left">Empresa</th>
              <th className="px-4 py-2 text-left"></th>
              <th className="px-4 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {isTableLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  Cargando certificados...
                </td>
              </tr>
            ) : certificates.length > 0 ? (
              certificates.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={w.blocked ?? false}
                      readOnly
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">{w.vin}</td>
                  <td className="px-4 py-3">{w.model}</td>
                  <td className="px-4 py-3">{w.certificateNumber || "N/A"}</td>
                  <td className="px-4 py-3">{formatDate(w.importDate)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!w.warranty}
                      readOnly
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-3">{formatDate(w.saleDate)}</td>
                  <td className="px-4 py-3">
                    {w.warranty?.company?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(w)}
                      disabled={!w.warranty}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Garantia
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedVehicle(w)}
                      className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    >
                      Certificado
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-gray-500">
                  No se encontraron Certificados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] sm:w-[70%] md:w-[700px] lg:w-[750px] max-h-[90vh] overflow-auto relative">
            <h2 className="text-2xl font-bold bg-white mb-4">Activación de Garantía</h2>
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-xl font-bold"
            >
              ×
            </button>

            {/* Datos del Vehículo */}
            <div className="mb-4 text-sm">
              <h3 className="font-semibold mb-2">Vehículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Fecha</label>
                  <input readOnly value={formatDate(selected.date)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vin</label>
                  <input readOnly value={selected.vin} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  <input readOnly value={selected.brand} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  <input readOnly value={selected.model} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  <input readOnly value={selected.engineNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  <input readOnly value={selected.type || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  <input readOnly value={selected.year || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  <input readOnly value={selected.certificateNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  <input readOnly value={formatDate(selected.importDate)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Empresa</label>
                  <input readOnly value={selected.warranty?.company?.name || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vendedor</label>
                  <input readOnly value={selected.warranty?.user?.username || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Patente</label>
                  <input readOnly value={selected.licensePlate || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="text-sm">
              <h3 className="font-semibold mb-2 border-t pt-2">Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nombre</label>
                  <input readOnly value={selected.warranty?.customer?.firstName || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Apellido</label>
                  <input readOnly value={selected.warranty?.customer?.lastName || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Email</label>   
                  <input readOnly value={selected.warranty?.customer?.email || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Teléfono</label>
                  <input readOnly value={selected.warranty?.customer?.phone || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Dirección</label>
                  <input readOnly value={selected.warranty?.customer?.address || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Provincia</label>
                  <input readOnly value={selected.warranty?.customer?.state || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Localidad</label>
                  <input readOnly value={selected.warranty?.customer?.city || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleDownload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Generando..." : "Certificado"}
              </button>
              <button
                onClick={async () => {
                  if (confirm("¿Seguro que querés anular esta garantía?")) {
                    
                    const res = await deleteWarranty(selected.warranty.id);
                    if (res.success) {
                      alert("Garantía anulada");
                      setSelected(null); 
                      // Llamar a handleSearch() para refrescar la lista
                    } else {
                      alert("Error: " + res.error);
                    }
                  }
                }}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 sm:px-4 sm:py-2"
              >
                Anular Garantía
              </button>
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 sm:px-4 sm:py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVehicle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] sm:w-[70%] md:w-[500px] lg:w-[600px] max-h-[90vh] overflow-auto relative">
            <h2 className="text-2xl font-bold bg-white mb-4">Detalles del Vehículo</h2>
            <button
              onClick={() => setSelectedVehicle(null)}
              className="absolute top-4 right-4 text-xl font-bold"
            >
              ×
            </button>

            {/* Datos del Vehículo */}
            <div className="mb-4 text-sm">
              <h3 className="font-semibold mb-2">Vehículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vin</label>
                  <input readOnly value={selectedVehicle.vin} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  <input readOnly value={selectedVehicle.brand} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  <input readOnly value={selectedVehicle.model} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  <input readOnly value={selectedVehicle.engineNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  <input readOnly value={selectedVehicle.type || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  <input readOnly value={selectedVehicle.year || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Garantía</label>
                  <input readOnly value={selectedVehicle.warranty ? 'Sí' : 'No'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  <input readOnly value={selectedVehicle.certificateNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  <input readOnly value={formatDate(selectedVehicle.importDate)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Bloqueado</label>
                  <input
                    type="checkbox"
                    checked={selectedVehicle.blocked ?? false}
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 sm:px-4 sm:py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- BLOQUE DE PAGINACIÓN --- */}
      {!isTableLoading && totalCertificates > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 px-2">
          <div className="hidden sm:block text-sm text-gray-700 mb-2 sm:mb-0">
            Total: <strong>{totalCertificates}</strong>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </>
  );
};
"use client";
import { useState } from "react";
import { useCertificate } from "../../contexts/CertificateContext";
import { deleteWarranty } from "../../app/garantias/actions";

// Pequeña función helper para formatear fechas (evita errores si la fecha es null)
const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A"; // Devuelve N/A si no hay fecha
  try {
    // Corta la fecha para mostrar solo YYYY-MM-DD (más seguro que toLocaleDateString)
    return new Date(dateString).toISOString().slice(0, 10);
  } catch (e) {
    return "Fecha Inválida";
  }
};

export const CertificateTable = () => {
  const { results, loading, setLoading } = useCertificate(); // Traemos setLoading

  const [selected, setSelected] = useState<any | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const handleDownload = async () => {
    // 1. CORRECCIÓN: 'selected' es un Vehículo. El ID de la garantía
    // está en 'selected.warranty.id'.
    if (!selected || !selected.warranty) {
      alert("Este vehículo no tiene una garantía para descargar.");
      return;
    }

    try {
      setLoading(true);
      // Usamos el ID de la garantía
      const res = await fetch(`/api/certificates/${selected.warranty.id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al generar certificado");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${selected.warranty.id}.pdf`; // ID de garantía
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

  return (
    <>
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
        {results.map((w) => (
        <tr key={w.id} className="border-t">
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={w.blocked ?? false} /* CORREGIDO (antes w.vehicle.blocked) */
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3">{w.vin}</td> {/* CORREGIDO (antes w.vehicle.vin) */}
                <td className="px-4 py-3">{w.model}</td> {/* CORREGIDO (antes w.vehicle.model) */}
                <td className="px-4 py-3">{w.certificateNumber || 'N/A'}</td> {/* CORREGIDO (antes w.vehicle.certificateNumber) */}
                <td className="px-4 py-3">{formatDate(w.importDate)}</td> {/* CORREGIDO (antes w.importDate y daba error) */}
                <td className="px-4 py-3">
                  <input 
                    type="checkbox" 
                    checked={!!w.warranty} /* CORREGIDO (revisa si w.warranty existe) */
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3">{formatDate(w.saleDate)}</td> {/* CORREGIDO (antes w.saleDate y daba error) */}
                <td className="px-4 py-3">{w.warranty?.company?.name || 'N/A'}</td> {/* CORREGIDO (antes w.company.name) */}
                
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(w)}
                    disabled={!w.warranty} // <-- IMPORTANTE: Deshabilita si no hay garantía
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
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Boton de garantia: TU MODAL IDÉNTICO, SOLO CAMBIAN LOS 'value' */}
      {/* 'selected' ahora es un VEHICLE */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-auto relative">
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
                  {/* CORREGIDO: de 'selected.vehicle.date' a 'selected.date' */}
                  <input readOnly value={formatDate(selected.date)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vin</label>
                  {/* CORREGIDO: de 'selected.vehicle.vin' a 'selected.vin' */}
                  <input readOnly value={selected.vin} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  {/* CORREGIDO: de 'selected.vehicle.brand' a 'selected.brand' */}
                  <input readOnly value={selected.brand} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  {/* CORREGIDO: de 'selected.vehicle.model' a 'selected.model' */}
                  <input readOnly value={selected.model} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  {/* CORREGIDO: de 'selected.vehicle.engineNumber' a 'selected.engineNumber' */}
                  <input readOnly value={selected.engineNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  {/* CORREGIDO: de 'selected.vehicle.type' a 'selected.type' */}
                  <input readOnly value={selected.type || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  {/* CORREGIDO: de 'selected.vehicle.year' a 'selected.year' */}
                  <input readOnly value={selected.year || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  {/* CORREGIDO: de 'selected.vehicle.certificateNumber' a 'selected.certificateNumber' */}
                  <input readOnly value={selected.certificateNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  {/* CORREGIDO: de 'selected.vehicle.importDate' a 'selected.importDate' */}
                  <input readOnly value={formatDate(selected.importDate)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Empresa</label>
                  {/* CORREGIDO: de 'selected.company.name' a 'selected.warranty.company.name' */}
                  <input readOnly value={selected.warranty?.company?.name || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vendedor</label>
                  {/* CORREGIDO: de 'selected.user.username' a 'selected.warranty.user.username' */}
                  <input readOnly value={selected.warranty?.user?.username || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Patente</label>
                  {/* CORREGIDO: de 'selected.vehicle.licensePlate' a 'selected.licensePlate' */}
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
                  {/* CORREGIDO: de 'selected.customer.firstName' a 'selected.warranty.customer.firstName' */}
                  <input readOnly value={selected.warranty?.customer?.firstName || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Apellido</label>
                  {/* CORREGIDO: de 'selected.customer.lastName' a 'selected.warranty.customer.lastName' */}
                  <input readOnly value={selected.warranty?.customer?.lastName || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Email</label>
                  {/* CORREGIDO: de 'selected.customer.email' a 'selected.warranty.customer.email' */}
                  <input readOnly value={selected.warranty?.customer?.email || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Teléfono</label>
                  {/* CORREGIDO: de 'selected.customer.phone' a 'selected.warranty.customer.phone' */}
                  <input readOnly value={selected.warranty?.customer?.phone || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Dirección</label>
                  {/* CORREGIDO: de 'selected.customer.address' a 'selected.warranty.customer.address' */}
                  <input readOnly value={selected.warranty?.customer?.address || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Provincia</label>
                  {/* CORREGIDO: de 'selected.customer.state' a 'selected.warranty.customer.state' */}
                  <input readOnly value={selected.warranty?.customer?.state || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Localidad</label>
                  {/* CORREGIDO: de 'selected.customer.city' a 'selected.warranty.customer.city' */}
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
                    // CORREGIDO: de 'selected.id' a 'selected.warranty.id'
                    const res = await deleteWarranty(selected.warranty.id);
                    if (res.success) {
                      alert("Garantía anulada");
                      setSelected(null); // Cierra el modal
                      // Aquí deberías volver a llamar a handleSearch() para refrescar la lista
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

      {/* Detalles del Vehículo (boton que dice certificado): TU MODAL IDÉNTICO */}
      {/* 'selectedVehicle' ahora es un VEHICLE */}
      {selectedVehicle && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-auto relative">
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
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.vin' a 'selectedVehicle.vin' */}
                  <input readOnly value={selectedVehicle.vin} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.brand' a 'selectedVehicle.brand' */}
                  <input readOnly value={selectedVehicle.brand} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.model' a 'selectedVehicle.model' */}
                  <input readOnly value={selectedVehicle.model} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.engineNumber' a 'selectedVehicle.engineNumber' */}
                  <input readOnly value={selectedVehicle.engineNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.type' a 'selectedVehicle.type' */}
                  <input readOnly value={selectedVehicle.type || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.year' a 'selectedVehicle.year' */}
                  <input readOnly value={selectedVehicle.year || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Garantía</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.warranty' a '!!selectedVehicle.warranty' */}
                  <input readOnly value={selectedVehicle.warranty ? 'Sí' : 'No'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.certificateNumber' a 'selectedVehicle.certificateNumber' */}
                  <input readOnly value={selectedVehicle.certificateNumber || 'N/A'} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  {/* CORREGIDO: de 'selectedVehicle.vehicle.importDate' a 'selectedVehicle.importDate' */}
                  <input readOnly value={formatDate(selectedVehicle.importDate)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Bloqueado</label>
                  <input
                    type="checkbox"
                    // CORREGIDO: de 'selectedVehicle.vehicle.warranty' (??) a 'selectedVehicle.blocked'
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
    </>
  );
};
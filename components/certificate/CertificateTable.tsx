"use client";
import { useState } from "react";
import { useCertificate } from "../../contexts/CertificateContext";
import { deleteWarranty } from "../../app/garantias/actions";

export const CertificateTable = () => {
  // Solo lee los datos del contexto, no los carga
  const { results, loading } = useCertificate();

  // Los estados locales para los modales de la UI se mantienen
  const [selected, setSelected] = useState<any | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const handleDownload = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/certificates/${selected.id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al generar certificado");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-${selected.id}.pdf`;
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
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Bloqueado</th>
            <th className="px-4 py-3 text-left">VIN</th>
            <th className="px-4 py-3 text-left">Modelo</th>
            <th className="px-4 py-3 text-left">Nro. Certificado</th>
            <th className="px-4 py-3 text-left">F. Importación</th>
            <th className="px-4 py-3 text-left">Garantia</th>
            <th className="px-4 py-3 text-left">Venta</th>
            <th className="px-4 py-3 text-left">Empresa</th>
          </tr>
        </thead>
        <tbody>
          {results.map((w) => (
            <tr key={w.id} className="border-t">
            <td className="px-4 py-3">
                <input 
                    type="checkbox" 
                    checked={w.vehicle.blocked} 
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td className="px-4 py-3">{w.vehicle.vin}</td>
              <td className="px-4 py-3">{w.vehicle.model}</td>
              <td className="px-4 py-3">{w.vehicle.certificateNumber}</td>
              <td className="px-4 py-3">{new Date(w.importDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <input 
                    type="checkbox" 
                    checked={w.warranty} 
                    readOnly
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td className="px-4 py-3">{new Date(w.saleDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">{w.company.name}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setSelected(w)}
                  className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
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

      
      {/* Boton de garantia */}    
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
                  <input readOnly value={selected.vehicle.date} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vin</label>
                  <input readOnly value={selected.vehicle.vin} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  <input readOnly value={selected.vehicle.brand} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  <input readOnly value={selected.vehicle.model} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  <input readOnly value={selected.vehicle.engineNumber} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  <input readOnly value={selected.vehicle.type} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  <input readOnly value={selected.vehicle.year} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  <input readOnly value={selected.vehicle.certificateNumber} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  <input readOnly value={selected.vehicle.importDate?.toString().slice(0,10)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Empresa</label>
                  <input readOnly value={selected.company.name} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vendedor</label>
                  <input readOnly value={selected.user.username} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Patente</label>
                  <input readOnly value={selected.vehicle.licensePlate} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="text-sm">
              <h3 className="font-semibold mb-2 border-t pt-2">Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nombre</label>
                  <input readOnly value={selected.customer.firstName} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Apellido</label>
                  <input readOnly value={selected.customer.lastName} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Email</label>
                  <input readOnly value={selected.customer.email} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Teléfono</label>
                  <input readOnly value={selected.customer.phone} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Dirección</label>
                  <input readOnly value={selected.customer.address} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Provincia</label>
                  <input readOnly value={selected.customer.state} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Localidad</label>
                  <input readOnly value={selected.customer.city} className="border rounded px-2 py-1 w-full bg-gray-100" />
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
                                  const res = await deleteWarranty(selected.id);
                                  if (res.success) {
                                    alert("Garantía anulada");
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

      {/* Detalles del Vehículo (boton que dice garantía) */}
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
                  <input readOnly value={selectedVehicle.vehicle.vin} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  <input readOnly value={selectedVehicle.vehicle.brand} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  <input readOnly value={selectedVehicle.vehicle.model} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  <input readOnly value={selectedVehicle.vehicle.engineNumber} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  <input readOnly value={selectedVehicle.vehicle.type} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  <input readOnly value={selectedVehicle.vehicle.year} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Garantía</label>
                  <input readOnly value={selectedVehicle.vehicle.warranty} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  <input readOnly value={selectedVehicle.vehicle.certificateNumber} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  <input readOnly value={selectedVehicle.vehicle.importDate?.toString().slice(0,10)} className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                    <label className="text-gray-800">Bloqueado</label>
                  <input
                    type="checkbox"
                    checked={selectedVehicle.vehicle.warranty}
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

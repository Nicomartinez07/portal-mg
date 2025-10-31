"use client";
import { useState } from "react";
import { useWarranty } from "../../contexts/WarrantyContext";
import { deleteWarranty } from "../../app/(dashboard)/garantias/actions";

export const WarrantyTable = () => {
  const { results } = useWarranty();
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">VIN</th>
            <th className="px-4 py-3 text-left">Modelo</th>
            <th className="px-4 py-3 text-left">Patente</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Empresa</th>
            <th className="px-4 py-3 text-left">Usuario</th>
            <th className="px-4 py-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-4 py-3">{new Date(w.activationDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{w.vehicle.vin}</td>
                <td className="px-4 py-3">{w.vehicle.model}</td>
                <td className="px-4 py-3">{w.vehicle.licensePlate}</td>
                <td className="px-4 py-3">
                  {w.customer.firstName} {w.customer.lastName}
                </td>
                <td className="px-4 py-3">{w.company.name}</td>
                <td className="px-4 py-3">{w.user?.username}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(w)}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                    name="Detalles"
                  >
                    Detalles
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                No se encontraron garantías
              </td>
            </tr>
          )}
        </tbody>

      </table>

      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg w-2/3 max-w-md overflow-auto relative">
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
                  <input readOnly value={selected.user?.username} className="border rounded px-2 py-1 w-full bg-gray-100" />
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
    </>
  );
};

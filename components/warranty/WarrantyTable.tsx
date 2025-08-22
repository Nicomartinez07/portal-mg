"use client";
import { useState } from "react";
import { useWarranty } from "../../contexts/WarrantyContext";
import { deleteWarranty } from "../../app/garantias/actions";

export const WarrantyTable = () => {
  const { results } = useWarranty();
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <>
      <table className="w-full border rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">VIN</th>
            <th className="px-4 py-3 text-left">Modelo</th>
            <th className="px-4 py-3 text-left">Patente</th>
            <th className="px-4 py-3 text-left">Cliente</th>
            <th className="px-4 py-3 text-left">Empresa</th>
            <th className="px-4 py-3 text-left">Usuario</th>
          </tr>
        </thead>
        <tbody>
          {results.map((w) => (
            <tr key={w.id} className="border-t">
              <td className="px-4 py-3">{new Date(w.activationDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">{w.vehicle.vin}</td>
              <td className="px-4 py-3">{w.vehicle.model}</td>
              <td className="px-4 py-3">{w.vehicle.licensePlate}</td>
              <td className="px-4 py-3">
                {w.customer.firstName} {w.customer.lastName}
              </td>
              <td className="px-4 py-3">{w.company.name}</td>
              <td className="px-4 py-3">{w.user.username}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => setSelected(w)}
                  className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                  Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              {/* Muestreo de datos en 2 columnas: */}
              {/* <div className="grid grid-cols-1 gap-2"> */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Fecha</label>
                  <input readOnly value={selected.vehicle.date} placeholder="Fecha" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vin</label>
                  <input readOnly value={selected.vehicle.vin} placeholder="Vin" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Marca</label>
                  <input readOnly value={selected.vehicle.brand} placeholder="Marca" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Modelo</label>
                  <input readOnly value={selected.vehicle.model} placeholder="Modelo" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Motor</label>
                  <input readOnly value={selected.vehicle.engineNumber} placeholder="Nro. Motor" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Tipo</label>
                  <input readOnly value={selected.vehicle.type} placeholder="Tipo" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Año</label>
                  <input readOnly value={selected.vehicle.year} placeholder="Año" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nro. Certificado</label>
                  <input readOnly value={selected.vehicle.certificateNumber} placeholder="Nro. Certificado" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">F. Importación</label>
                  <input readOnly value={selected.vehicle.importDate?.toString().slice(0,10)} placeholder="F. Importación" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Empresa</label>
                  <input readOnly value={selected.company.name} placeholder="Empresa" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Vendedor</label>
                  <input readOnly value={selected.user.username} placeholder="Vendedor" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Patente</label>
                  <input readOnly value={selected.vehicle.licensePlate} placeholder="Patente" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="text-sm">
              <h3 className="font-semibold mb-2 border-t pt-2">Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Muestreo de datos en 2 columnas: */}
              {/* <div className="grid grid-cols-1 gap-2"> */}
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Nombre</label>
                  <input readOnly value={selected.customer.firstName} placeholder="Nombre" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Apellido</label>
                  <input readOnly value={selected.customer.lastName} placeholder="Apellido" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Email</label>
                  <input readOnly value={selected.customer.email} placeholder="Email" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Teléfono</label>
                  <input readOnly value={selected.customer.phone} placeholder="Teléfono" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Dirección</label>
                  <input readOnly value={selected.customer.address} placeholder="Dirección" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Provincia</label>
                  <input readOnly value={selected.customer.state} placeholder="Provincia" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <label className="text-gray-800">Localidad</label>
                  <input readOnly value={selected.customer.city} placeholder="Localidad" className="border rounded px-2 py-1 w-full bg-gray-100" />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 sm:px-4 sm:py-2">Certificado</button>
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
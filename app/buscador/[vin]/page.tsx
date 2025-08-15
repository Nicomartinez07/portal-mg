import { prisma } from "@/lib/prisma";
import { MGDashboard } from "../../../components/mg-dashboard";

export default async function BuscadorPage({ params }: { params: { vin: string } }) {
  const { vin } = params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { vin },
    include: {
      warranty: true,
      orders: {
        include: {
          customer: true,
          company: true,
          user: true,
        },
      },
    },
  });

  return (
    <MGDashboard>
      <h1 className="text-2xl font-bold">Detalles del Vehículo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Información del vehículo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Información del vehículo</h2>
          {vehicle ? (
            <div className="space-y-2">
              <p><strong>VIN:</strong> {vehicle.vin}</p>
              <p><strong>Modelo:</strong> {vehicle.brand} {vehicle.model}</p>
              <p><strong>Nro. Motor:</strong> {vehicle.engineNumber || "N/A"}</p>
              <p><strong>Año:</strong> {vehicle.year}</p>
            </div>
          ) : (
            <p className="text-gray-500">No se encontró el vehículo</p>
          )}
        </div>

        {/* Activación de garantía */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Activación de garantía</h2>
          {vehicle?.warranty ? (
            <div className="space-y-2">
              <p><strong>Empresa:</strong> {vehicle.orders[0]?.company?.name || "N/A"}</p>
              <p><strong>Fecha Activación:</strong> {vehicle.warranty.activationDate.toLocaleDateString()}</p>
              <p><strong>Patente:</strong> {vehicle.plate || "N/A"}</p>
              <p><strong>Nombre Cliente:</strong> {vehicle.orders[0]?.customer?.firstName} {vehicle.orders[0]?.customer?.lastName}</p>
            </div>
          ) : (
            <p className="text-gray-500">No hay garantía registrada</p>
          )}
        </div>

        {/* Servicios realizados */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Servicios realizados</h2>
          {vehicle?.services?.length ? (
            <ul className="list-disc list-inside space-y-1">
              {vehicle.services.map((s) => (
                <li key={s.id}>{s.description}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No se realizaron servicios a este vehículo</p>
          )}
        </div>

        {/* Reclamos realizados */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">Reclamos realizados</h2>
          {vehicle?.claims?.length ? (
            <div className="space-y-4">
              {vehicle.claims.map((c) => (
                <div key={c.id} className="border-l-4 border-gray-200 pl-4">
                  <p className="text-sm text-blue-600 font-bold">
                    {new Date(c.date).toLocaleDateString()} {new Date(c.date).toLocaleTimeString()}
                  </p>
                  <p className="text-sm">{c.description}</p>
                  <button className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay reclamos registrados</p>
          )}
        </div>
      </div>
    </MGDashboard>
  );
}

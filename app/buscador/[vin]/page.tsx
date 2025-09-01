import { prisma } from "@/lib/prisma";
import { MGDashboard } from "../../../components/mg-dashboard";

export default async function BuscadorPage({ params }: { params: { vin: string } }) {
  const { vin } = params;

  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { vin },
      include: {
        warranty: {
          include: {
            company: true,
            customer: true,
          }
        },
        orders: {
          include: {
            customer: true,
            company: true,
            tasks: true,
          },
          orderBy: {
            creationDate: 'desc'
          }
        },
      },
    });

    // Obtener servicios (tasks) de todas las órdenes
    const allServices = vehicle?.orders.flatMap(order => 
      order.tasks.map(task => ({
        ...task,
        orderDate: order.creationDate,
        orderNumber: order.orderNumber,
        company: order.company
      }))
    ) || [];

    return (
      <MGDashboard>
        <h1 className="text-2xl font-bold mb-6">Detalles del Vehículo</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Información del vehículo */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Información del vehículo</h2>
            {vehicle ? (
              <div className="space-y-3">
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">VIN:</span>
                  <span>{vehicle.vin}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Modelo:</span>
                  <span>{vehicle.brand} {vehicle.model}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Nro. Motor:</span>
                  <span>{vehicle.engineNumber || "N/A"}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Año:</span>
                  <span>{vehicle.year || "N/A"}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No se encontró el vehículo</p>
            )}
          </div>

          {/* Activación de garantía */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Activación de garantía</h2>
            {vehicle?.warranty ? (
              <div className="space-y-3">
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Empresa:</span>
                  <span>{vehicle.warranty.company.name}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Fecha Activación:</span>
                  <span>{vehicle.warranty.activationDate.toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Patente:</span>
                  <span>{vehicle.licensePlate || "N/A"}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Nombre Cliente:</span>
                  <span>{vehicle.warranty.customer.firstName} {vehicle.warranty.customer.lastName}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No hay garantía registrada</p>
            )}
          </div>

          {/* Servicios realizados */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Servicios realizados</h2>
            {allServices.length > 0 ? (
              <div className="space-y-4">
                {allServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="border-l-4 border-gray-200 pl-4">
                    <p className="text-sm text-blue-600 font-bold">
                      {service.orderDate.toLocaleDateString()} {service.orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm mt-1">{service.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {service.company.name} - {service.orderDate.toLocaleDateString()}
                    </p>
                    <button className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                      Ver Detalles
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No se realizaron servicios a este vehículo</p>
            )}
          </div>

          {/* Reclamos realizados */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Reclamos realizados</h2>
            {vehicle?.orders.filter(order => order.type === 'CLAIM').length > 0 ? (
              <div className="space-y-4">
                {vehicle.orders
                  .filter(order => order.type === 'CLAIM')
                  .slice(0, 3)
                  .map((order) => (
                    <div key={order.id} className="border-l-4 border-gray-200 pl-4">
                      <p className="text-sm text-blue-600 font-bold">
                        {order.creationDate.toLocaleDateString()} {order.creationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm mt-1">Reclamo #{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.diagnosis || "Sin diagnóstico registrado"}</p>
                      <button className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
                        Ver Detalles
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No se realizaron reclamos a este vehículo</p>
            )}
          </div>
        </div>
      </MGDashboard>
    );
  } catch (error) {
    console.error("Error fetching vehicle data:", error);
    return (
      <MGDashboard>
        <h1 className="text-2xl font-bold mb-6">Detalles del Vehículo</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error al cargar la información del vehículo. Por favor, intenta nuevamente.</p>
        </div>
      </MGDashboard>
    );
  }
}
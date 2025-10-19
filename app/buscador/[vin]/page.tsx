// app/vehiculos/buscador/[vin]/page.tsx

import { MGDashboard } from "@/components/mg-dashboard";
import { getVehicleDetails } from "./actions";
import { VehicleDetailsClient } from "./VehicleDetailsClient"; // Importamos el componente de cliente

export default async function BuscadorPage({ params }: { params: { vin: string } }) {
  const { vin } = params;

  try {
    const vehicleData = await getVehicleDetails(vin);

    if (!vehicleData) {
        return (
            <MGDashboard>
                <h1 className="text-2xl font-bold mb-6">Detalles del Vehículo</h1>
                <p className="text-gray-500">No se encontró el vehículo con VIN: {vin}</p>
            </MGDashboard>
        );
    }

    // Pasamos todos los datos necesarios al componente de cliente
    return (
      <MGDashboard>
        <VehicleDetailsClient vehicleData={vehicleData} />
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
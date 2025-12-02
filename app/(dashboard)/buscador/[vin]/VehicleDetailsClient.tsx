// app/vehiculos/buscador/[vin/VehicleDetailsClient.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import ClaimModal from "@/components/orders/modals/ClaimModal";
import ServiceModal from "@/components/orders/modals/ServiceModal";
import HistoryModal from "@/components/orders/modals//HistoryModal"; 
import type { Order } from "@/app/types"; 

// --- ÍCONOS AUXILIARES ---
const ListIcon = () => (
  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs z-10 relative">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  </div>
);
const ToolIcon = () => (
  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs z-10 relative">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </div>
);

type ModalType = 'SERVICE' | 'CLAIM' | 'HISTORY' | null;

interface VehicleDetailsClientProps {
    vehicleData: any; 
}

export function VehicleDetailsClient({ vehicleData }: VehicleDetailsClientProps) {
  const router = useRouter(); 
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { warranty, serviceOrders, claimOrders, ...vehicle } = vehicleData;

  // Función especial para cerrar el modal de historial
  const closeHistoryModal = () => {
    setModalOpen('CLAIM'); // Vuelve al modal de reclamo
  }

  const handleOrderUpdated = () => {
    setModalOpen(null);
    setSelectedOrder(null);
    router.refresh(); 
  };

  // --- 2. MODIFICAR HANDLE ---
  // Esta función ahora abre el modal de HISTORIAL
  const handleShowHistory = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen('HISTORY'); 
  };

  const handleOpenModal = (type: ModalType, order: Order) => {
    setSelectedOrder(order);
    setModalOpen(type);
  };
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Detalles del Vehículo</h1>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- Información del vehículo y Garantía --- */}
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Información del vehículo</h2>
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
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Activación de garantía</h2>
            {warranty ? (
             <div className="space-y-3">
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Empresa:</span>
                  <span>{warranty.company.name}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Fecha Activación:</span>
                  <span>{new Date(warranty.activationDate).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Patente:</span>
                  <span>{vehicle.licensePlate || "N/A"}</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                  <span className="font-semibold">Nombre Cliente:</span>
                  <span>{warranty.customer.firstName} {warranty.customer.lastName}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No hay garantía registrada</p>
            )}
          </div>
        
        {/* --- Servicios realizados --- */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Servicios realizados</h2>
          {serviceOrders && serviceOrders.length > 0 ? (
            <div className="relative">
              <div className="absolute top-0 left-[7px] h-full w-px bg-gray-200"></div>
              <div className="space-y-6">
                {serviceOrders.slice(0, 5).map((order: Order) => (
                  <div key={order.id} className="flex items-start">
                    <div className="mr-4 mt-1"><ListIcon /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(order.creationDate).toLocaleDateString()} {new Date(order.creationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-sm mt-1">
                        {order.service || order.additionalObservations || 'Servicio'}{" "}
                        ({order.company.name}).
                      </p>
                      <p className="text-sm mt-1 text-gray-600">
                        Kilometraje real: {order.actualMileage.toLocaleString()} kilómetros.
                      </p>
                      <button 
                        onClick={() => handleOpenModal('SERVICE', order)}
                        className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No se realizaron servicios a este vehículo</p>
          )}
        </div>

        {/* --- Reclamos realizados --- */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Reclamos realizados</h2>
          {claimOrders && claimOrders.length > 0 ? (
            <div className="relative">
              <div className="absolute top-0 left-[7px] h-full w-px bg-gray-200"></div>
              <div className="space-y-6">
                {claimOrders
                  .slice(0, 3)
                  .map((order: Order) => (
                    <div key={order.id} className="flex items-start">
                      <div className="mr-4 mt-1"><ToolIcon /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(order.creationDate).toLocaleDateString()} {new Date(order.creationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm mt-1 text-gray-600">
                          Ingreso de Reclamo ({order.company.name}).
                        </p>
                        <p className="text-sm mt-1">
                          {order.diagnosis || order.additionalObservations || "Detalles del reclamo no especificados."}
                        </p>
                        <button 
                          onClick={() => handleOpenModal('CLAIM', order)}
                          className="mt-2 px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No se realizaron reclamos a este vehículo</p>
          )}
        </div>
      </div>

      {/* --- RENDERIZADO CONDICIONAL DE MODALES --- */}
      {modalOpen === 'SERVICE' && selectedOrder && (
        <ServiceModal 
            order={selectedOrder} 
            onClose={() => {
              setModalOpen(null);
              setSelectedOrder(null);
            }} 
            onShowHistory={handleShowHistory}
        />
      )}

      {modalOpen === 'CLAIM' && selectedOrder && (
        <ClaimModal 
            order={selectedOrder} 
            onClose={() => {
              setModalOpen(null);
              setSelectedOrder(null);
            }} 
            onShowHistory={handleShowHistory} 
            onOrderUpdated={handleOrderUpdated}
        />
      )}

      {/* --- 3. AGREGAR EL MODAL DE HISTORIAL --- */}
      {modalOpen === 'HISTORY' && selectedOrder && (
        <HistoryModal 
            // Le pasamos el array de la orden seleccionada
            history={selectedOrder.statusHistory || []} 
            // Usamos una función de cierre especial para volver al modal de reclamo
            onClose={closeHistoryModal} 
        />
      )}
    </>
  );
}
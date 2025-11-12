// components/orders/modals/ClaimModal.tsx
import React, { useState, useEffect } from "react";
import type { Order } from "../../../app/types";
import {
  updateOrderInternalStatus,
  updateOrderStatus,
  OrderInternalStatusUpdateData,
} from "@/app/(dashboard)/ordenes/actions";
import OrderPhotosSection from "@/components/awss3/OrderPhotosSection";

interface ClaimModalProps {
  order: Order;
  onClose: () => void;
  onShowHistory: (order: Order) => void;
  onOrderUpdated: () => void;
}

export default function ClaimModal({
  order,
  onClose,
  onShowHistory,
  onOrderUpdated,
}: ClaimModalProps) {
  const [currentInternalStatus, setCurrentInternalStatus] = useState(
    order.internalStatus || ""
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [observation, setObservation] = useState("");
  const [lastStatusObservation, setLastStatusObservation] = useState<
    string | null
  >(null);

  const [internalStatusObservation, setInternalStatusObservation] = useState(
    order.internalStatusObservation || ""
  );
  const [originClaimNumber, setOriginClaimNumber] = useState(
    order.originClaimNumber || ""
  );
  const [laborRecovery, setLaborRecovery] = useState(
    order.laborRecovery ? String(order.laborRecovery) : ""
  );
  const [partsRecovery, setPartsRecovery] = useState(
    order.partsRecovery ? String(order.partsRecovery) : ""
  );

  useEffect(() => {
    if (order.statusHistory && order.statusHistory.length > 0) {
      const sortedHistory = [...order.statusHistory].sort(
        (a, b) =>
          new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
      );
      const lastStatusChange = sortedHistory.find(
        (history) =>
          (history.status === "AUTORIZADO" ||
            history.status === "RECHAZADO") &&
          history.observation
      );
      if (lastStatusChange) {
        setLastStatusObservation(lastStatusChange.observation ?? null);
      } else {
        setLastStatusObservation(null);
      }
    }
  }, [order.statusHistory]);

  const handleChangeStatus = async (newStatus: string, observation?: string) => {
    if (order.status === "AUTORIZADO" || order.status === "RECHAZADO") {
      alert("No se puede cambiar el estado, ya fue procesado.");
      return;
    }
    setIsUpdating(true);
    const result = await updateOrderStatus(order.id, newStatus, observation);
    setIsUpdating(false);
    if (result.success) {
      alert(
        `La orden ha sido ${
          newStatus === "AUTORIZADO" ? "aprobada" : "rechazada"
        } con éxito`
      );
      onOrderUpdated();
      onClose();
    } else {
      alert("Error al actualizar el estado: " + result.error);
    }
  };

  const handleStatusButtonClick = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowObservationModal(true);
  };

  const handleObservationConfirm = (observation: string) => {
    if (pendingStatus) {
      handleChangeStatus(pendingStatus, observation);
    }
    setShowObservationModal(false);
    setPendingStatus(null);
    setObservation("");
  };

  const handleObservationCancel = () => {
    setShowObservationModal(false);
    setPendingStatus(null);
    setObservation("");
  };

  const handleInternalStatusChange = (newStatus: string) => {
    setCurrentInternalStatus(newStatus);

    if (newStatus !== "RECLAMO_EN_ORIGEN") {
      setOriginClaimNumber("");
    }
    if (newStatus !== "APROBADO_EN_ORIGEN" && newStatus !== "CARGADO") {
      setLaborRecovery("");
      setPartsRecovery("");
    }
    if (
      newStatus !== "NO_RECLAMABLE" &&
      newStatus !== "RECHAZADO_EN_ORIGEN"
    ) {
      setInternalStatusObservation("");
    }
  };

  const handleUpdateInternalStatus = async () => {
    setIsUpdating(true);

    const dataToUpdate: OrderInternalStatusUpdateData = {
      internalStatus:
        currentInternalStatus === "" ? null : currentInternalStatus,

      originClaimNumber:
        currentInternalStatus === "RECLAMO_EN_ORIGEN"
          ? originClaimNumber || null
          : null,

      laborRecovery:
        currentInternalStatus === "APROBADO_EN_ORIGEN" ||
        currentInternalStatus === "CARGADO"
          ? laborRecovery
            ? parseFloat(laborRecovery)
            : null
          : null,

      partsRecovery:
        currentInternalStatus === "APROBADO_EN_ORIGEN" ||
        currentInternalStatus === "CARGADO"
          ? partsRecovery
            ? parseFloat(partsRecovery)
            : null
          : null,

      internalStatusObservation:
        currentInternalStatus === "NO_RECLAMABLE" ||
        currentInternalStatus === "RECHAZADO_EN_ORIGEN"
          ? internalStatusObservation || null
          : null,
    };

    const result = await updateOrderInternalStatus(order.id, dataToUpdate);
    setIsUpdating(false);

    if (result.success) {
      alert("Estado interno y campos adicionales actualizados con éxito");
      onOrderUpdated();
      onClose();
    } else {
      alert("Error al actualizar el estado interno: " + result.error);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg w-[90%] sm:w-[70%] md:w-[900px] lg:w-[1000px] max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header fijo */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-2xl font-bold">Solicitud de Reclamo</h2>
            <button
              onClick={onClose}
              className="text-xl font-bold text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          {/* Contenido scrollable */}
          <div className="overflow-y-auto flex-1 p-6">
            {/* Datos del Reclamo */}
            <div className="mb-4 text-xs">
              <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
                <label className="text-gray-800">ID</label>
                <input
                  readOnly
                  value={order.id}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Fecha de Creación</label>
                <input
                  readOnly
                  value={new Date(order.creationDate).toLocaleDateString()}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Empresa</label>
                <input
                  readOnly
                  value={order.company?.name || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Usuario</label>
                <input
                  readOnly
                  value={order.user?.username || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">OR Interna</label>
                <input
                  readOnly
                  value={order.orderNumber}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Pre-autorización</label>
                <input
                  readOnly
                  value={order.preAuthorizationNumber || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <div className="flex items-center gap-0.5">
                  <label className="text-gray-800">Estado</label>
                  <button
                    onClick={() => onShowHistory(order)}
                    className="text-blue-600 hover:underline text-xs whitespace-nowrap"
                  >
                    (historial)
                  </button>
                </div>
                <input
                  readOnly
                  value={order.status ?? "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                {(order.status === "AUTORIZADO" ||
                  order.status === "RECHAZADO") &&
                  lastStatusObservation && (
                    <>
                      <label className="text-gray-800">
                        Observación del Estado
                      </label>
                      <textarea
                        readOnly
                        value={lastStatusObservation}
                        rows={3}
                        className="w-full border rounded px-2 py-1 bg-gray-100 resize-none"
                      />
                    </>
                  )}

                <label className="text-gray-800">Estado Interno</label>
                <select
                  value={currentInternalStatus}
                  onChange={(e) => handleInternalStatusChange(e.target.value)}
                  className="border rounded px-2 py-1 w-full bg-white text-gray-800"
                >
                  <option value=""></option>
                  <option value="PENDIENTE_RECLAMO">Pendiente de reclamo</option>
                  <option value="RECLAMO_EN_ORIGEN">Reclamada al origen</option>
                  <option value="APROBADO_EN_ORIGEN">Aprobada por origen</option>
                  <option value="RECHAZADO_EN_ORIGEN">Rechazada por origen</option>
                  <option value="CARGADO">Cobrada</option>
                  <option value="NO_RECLAMABLE">No reclamable</option>
                </select>

                {currentInternalStatus === "RECLAMO_EN_ORIGEN" && (
                  <>
                    <label className="text-gray-800">Nro. Reclamo Origen</label>
                    <input
                      type="text"
                      value={originClaimNumber}
                      onChange={(e) => setOriginClaimNumber(e.target.value)}
                      className="border rounded px-2 py-1 w-full bg-white text-gray-800"
                      placeholder="Ingrese el número de reclamo en origen"
                    />
                  </>
                )}

                {(currentInternalStatus === "APROBADO_EN_ORIGEN" ||
                  currentInternalStatus === "CARGADO") && (
                  <>
                    <label className="text-gray-800">Recupero Mano de Obra</label>
                    <input
                      type="number"
                      step="0.01"
                      value={laborRecovery}
                      onChange={(e) => setLaborRecovery(e.target.value)}
                      placeholder=""
                      className="border rounded px-2 py-1 w-full bg-white text-gray-800"
                    />
                    <label className="text-gray-800">Recupero Repuestos</label>
                    <input
                      type="number"
                      step="0.01"
                      value={partsRecovery}
                      onChange={(e) => setPartsRecovery(e.target.value)}
                      placeholder=""
                      className="border rounded px-2 py-1 w-full bg-white text-gray-800"
                    />
                  </>
                )}

                {(currentInternalStatus === "NO_RECLAMABLE" ||
                  currentInternalStatus === "RECHAZADO_EN_ORIGEN") && (
                  <>
                    <label className="text-gray-800">
                      Observaciones Estado Interno
                    </label>
                    <textarea
                      value={internalStatusObservation}
                      onChange={(e) =>
                        setInternalStatusObservation(e.target.value)
                      }
                      rows={3}
                      className="w-full border rounded px-2 py-1 bg-white text-gray-800 resize-none"
                      placeholder="Escriba aquí por qué no es reclamable o fue rechazado..."
                    />
                  </>
                )}

                <label className="text-gray-800">Nombre Completo Cliente</label>
                <input
                  readOnly
                  value={`${order.customer?.firstName} ${order.customer?.lastName}`}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">VIN</label>
                <input
                  readOnly
                  value={order.vehicle?.vin || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Activación Garantía</label>
                <input
                  readOnly
                  value={
                    order.vehicle?.warranty?.activationDate
                      ? new Date(
                          order.vehicle.warranty.activationDate
                        ).toLocaleDateString()
                      : "-"
                  }
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Nro. Motor</label>
                <input
                  readOnly
                  value={order.vehicle?.engineNumber || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Modelo</label>
                <input
                  readOnly
                  value={order.vehicle?.model || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Kilometraje Real</label>
                <input
                  readOnly
                  value={order.actualMileage || "-"}
                  className="border rounded px-2 py-1 w-full bg-gray-100"
                />
                <label className="text-gray-800">Diagnóstico</label>
                <textarea
                  readOnly
                  value={order.diagnosis || ""}
                  rows={4}
                  className="w-full border rounded px-2 py-1 bg-gray-100 resize-none"
                />
                <label className="text-gray-800">Observaciones Adicionales</label>
                <textarea
                  readOnly
                  value={order.additionalObservations || ""}
                  rows={4}
                  className="w-full border rounded px-2 py-1 bg-gray-100 resize-none"
                />
              </div>
            </div>

            {/* Tareas */}
            <div className="text-xs mt-4">
              <h3 className="font-semibold mb-2">Tareas</h3>
              {order.tasks && order.tasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700 text-left">
                        <th className="px-3 py-2 border">Tarea</th>
                        <th className="px-3 py-2 border text-center">Cant. horas</th>
                        <th className="px-3 py-2 border text-center">Nro. repuesto</th>
                        <th className="px-3 py-2 border">Descripción repuesto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.tasks.map((task, index) => (
                        <tr key={index} className="odd:bg-white even:bg-gray-50">
                          <td className="px-3 py-1 border">
                            <input
                              readOnly
                              value={task.description || "-"}
                              className="w-full bg-gray-100 border rounded px-2 py-1"
                            />
                          </td>
                          <td className="px-3 py-1 border text-center">
                            <input
                              readOnly
                              value={task.hoursCount || "-"}
                              className="w-full bg-gray-100 border rounded px-2 py-1 text-center"
                            />
                          </td>
                          <td className="px-3 py-1 border text-center">
                            <input
                              readOnly
                              value={task.parts?.[0]?.part?.code || "-"}
                              className="w-full bg-gray-100 border rounded px-2 py-1 text-center"
                            />
                          </td>
                          <td className="px-3 py-1 border">
                            <input
                              readOnly
                              value={task.parts?.[0]?.part?.description || "-"}
                              className="w-full bg-gray-100 border rounded px-2 py-1"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No hay tareas asociadas a esta orden.
                </div>
              )}
            </div>

            {/* SECCIÓN DE FOTOS - NUEVO */}
            <div className="mt-6 pt-6 border-t">
              <OrderPhotosSection orderId={order.id} orderType="RECLAMO" />
            </div>

            {/* Botones */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 sm:px-4 sm:py-2"
              >
                Cerrar
              </button>
              <button
                onClick={handleUpdateInternalStatus}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                {isUpdating ? "Guardando..." : "Guardar cambios"}
              </button>

              {order.status === "PENDIENTE" && (
                <>
                  <button
                    onClick={() => handleStatusButtonClick("AUTORIZADO")}
                    className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    disabled={isUpdating}
                    name="Aprobar"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleStatusButtonClick("RECHAZADO")}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                    disabled={isUpdating}
                    name="Rechazar"
                  >
                    Rechazar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Observación */}
      {showObservationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
          <div className="bg-white p-6 rounded-lg w-1/3 shadow">
            <h3 className="text-lg font-bold mb-2">
              {pendingStatus === "RECHAZADO"
                ? "Rechazo de Reclamo"
                : "Aprobación de Reclamo"}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Ingresá un mensaje (opcional) para {pendingStatus === "RECHAZADO" ? "rechazar" : "aprobar"} esta solicitud:
            </p>
            <textarea
              className="w-full border rounded p-2 mb-4 resize-none"
              rows={4}
              placeholder="Podés dejarlo vacío si querés..."
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={handleObservationCancel}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleObservationConfirm(observation)}
                className={`px-3 py-1 rounded text-white ${
                  pendingStatus === "RECHAZADO"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {pendingStatus === "RECHAZADO" ? "Rechazar" : "Aprobar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
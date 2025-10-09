// src/app/components/InsertPreAuthorizationModal.tsx
import React, { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";

interface InsertPreAuthorizationModalProps {
  onClose: () => void;
  open: boolean;
}

export default function InsertPreAuthorizationModal({
  onClose,
  open,
}: InsertPreAuthorizationModalProps) {
  const [creationDate, setCreationDate] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [vin, setVin] = useState("");
  const [warrantyActivation, setWarrantyActivation] = useState("");
  const [engineNumber, setEngineNumber] = useState("");
  const [model, setModel] = useState("");
  const [actualMileage, setActualMileage] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [additionalObservations, setAdditionalObservations] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Setea la fecha de creación al abrir el modal
  useEffect(() => {
    setCreationDate(new Date().toLocaleString());
  }, [open]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Por favor selecciona un archivo primero");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch("/api/upload-tarifario", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("Archivo subido ✅");
    } else {
      alert("Error al subir archivo ❌");
    }
  };

  // 🔹 Cuando toques guardar, muestra los datos en consola (por ahora)
  const handleSave = () => {
    const newOrder = {
      creationDate,
      orderNumber,
      customerName,
      vin,
      warrantyActivation,
      engineNumber,
      model,
      actualMileage,
      diagnosis,
      additionalObservations,
    };

    console.log("Orden guardada:", newOrder);
    alert("Datos registrados (ver consola)");
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-2/3 max-h-[80vh] overflow-auto relative text-xs">
        <h2 className="text-2xl font-bold mb-4">Ingreso de Pre-autorización</h2>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ×
        </button>

        <div className="grid grid-cols-[160px_1fr] gap-2 items-center mb-4">
          <label>Fecha de Creación</label>
          <input
            readOnly
            value={creationDate}
            className="border rounded px-2 py-1 w-full bg-gray-100"
          />

          <label>OR Interna</label>
          <input
            placeholder="Ingrese número interno de orden"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          <label>Nombre Cliente</label>
          <input
            placeholder="Ingrese nombre completo"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          <label>VIN</label>
          <input
            placeholder="Ingrese VIN del vehículo"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          <label>Activación Garantía</label>
            <input
            value={warrantyActivation || ""}
            className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
            readOnly
            />

            <label>Nro. Motor</label>
            <input
            value={engineNumber || ""}
            className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
            readOnly
            />

            <label>Modelo</label>
            <input
            value={model || ""}
            className="border rounded px-2 py-1 w-full bg-gray-100 cursor-not-allowed"
            readOnly
            />


          <label>Kilometraje Real</label>
          <input
            placeholder="Ingrese kilometraje"
            value={actualMileage}
            onChange={(e) => setActualMileage(e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />

          <label>Diagnóstico</label>
          <textarea
            placeholder="Ingrese el diagnóstico"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={3}
            className="border rounded px-2 py-1 w-full resize-none"
          />

          <label>Observaciones adicionales</label>
          <textarea
            placeholder="Ingrese observaciones"
            value={additionalObservations}
            onChange={(e) => setAdditionalObservations(e.target.value)}
            rows={3}
            className="border rounded px-2 py-1 w-full resize-none"
          />
        </div>

        {/* Subida de archivo */}
        <div className="mt-4 text-xs">
          <h3 className="font-semibold mb-2">Fotos</h3>
          <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
            <label>Foto Patente</label>
            <div className="flex items-center gap-4 mb-4">
              <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
                Seleccionar archivo
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {selectedFile && (
                <>
                  <span className="text-gray-600">{selectedFile.name}</span>
                  <button
                    onClick={handleUpload}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <FaUpload className="w-4 h-4" /> Subir
                  </button>
                </>
              )}
            </div>
            <label>Foto Chapa VIN</label>
            <label>Foto kilometros</label>
            <label>Foto piezas adicionales</label>
            <label>Foto Patente</label>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Guardar
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// lib/uploadClaimPhotos.ts
import { uploadToS3, uploadMultipleToS3 } from "@/app/(dashboard)/actions/uploadToS3";

type ClaimPhotoFiles = {
  licensePlatePhoto: File;
  vinPlatePhoto: File;
  odometerPhoto: File;
  customerSignaturePhoto?: File; // Opcional
  additionalPhotos?: File[];
  orPhotos?: File[];
  reportPdfs?: File[];
};

// Usar el mismo tipo que en getOrderPhotos
export type OrderPhoto = {
  id: number;
  type: string;
  url: string;
};

export type OrganizedPhotos = {
  licensePlate?: OrderPhoto;
  vinPlate?: OrderPhoto;
  odometer?: OrderPhoto;
  customerSignature?: OrderPhoto;
  additional: OrderPhoto[];
  or: OrderPhoto[];
  reportPdfs: OrderPhoto[];
};

type UploadClaimPhotosResult = {
  success: boolean;
  photoUrls?: OrganizedPhotos;
  error?: string;
};

/**
 * Sube todas las fotos/videos/PDFs de un reclamo a S3
 * @param orderId - ID de la orden (puede ser temporal para borradores)
 * @param files - Archivos a subir
 * @returns URLs de los archivos subidos en formato OrganizedPhotos
 */
export async function uploadClaimPhotos(
  orderId: number,
  files: ClaimPhotoFiles
): Promise<UploadClaimPhotosResult> {
  try {
    console.log(`📤 Subiendo archivos de reclamo para orden ${orderId}...`);

    // Subir fotos obligatorias en paralelo
    const [licensePlateResult, vinPlateResult, odometerResult] = await Promise.all([
      uploadToS3(files.licensePlatePhoto, orderId, "license_plate"),
      uploadToS3(files.vinPlatePhoto, orderId, "vin_plate"),
      uploadToS3(files.odometerPhoto, orderId, "odometer"),
    ]);

    // Verificar que las fotos obligatorias se subieron correctamente
    if (!licensePlateResult.success || !vinPlateResult.success || !odometerResult.success) {
      const failedPhoto = !licensePlateResult.success
        ? "Foto de patente"
        : !vinPlateResult.success
        ? "Foto de VIN"
        : "Foto de kilómetros";
      
      throw new Error(`Error al subir: ${failedPhoto}`);
    }

    // Subir foto de firma del cliente (opcional)
    let customerSignatureResult = null;
    if (files.customerSignaturePhoto) {
      console.log(`📸 Subiendo firma del cliente...`);
      customerSignatureResult = await uploadToS3(
        files.customerSignaturePhoto,
        orderId,
        "customer_signature"
      );

      if (!customerSignatureResult.success) {
        throw new Error("Error al subir firma del cliente");
      }
    }

    // Subir fotos opcionales
    let additionalResults: any[] = [];
    let orResults: any[] = [];
    let pdfResults: any[] = [];

    if (files.additionalPhotos && files.additionalPhotos.length > 0) {
      console.log(`📸 Subiendo ${files.additionalPhotos.length} fotos adicionales...`);
      additionalResults = await uploadMultipleToS3(
        files.additionalPhotos,
        orderId,
        "additional"
      );
    }

    if (files.orPhotos && files.orPhotos.length > 0) {
      console.log(`📸 Subiendo ${files.orPhotos.length} fotos OR...`);
      orResults = await uploadMultipleToS3(files.orPhotos, orderId, "or");
    }

    if (files.reportPdfs && files.reportPdfs.length > 0) {
      console.log(`📄 Subiendo ${files.reportPdfs.length} PDFs...`);
      pdfResults = await uploadMultipleToS3(files.reportPdfs, orderId, "report_pdf");
    }

    // Construir objeto OrganizedPhotos con el mismo formato que getOrderPhotos
    const organizedPhotos: OrganizedPhotos = {
      licensePlate: licensePlateResult.success ? {
        id: Date.now(), // ID temporal, se reemplazará al guardar en BD
        type: "license_plate",
        url: licensePlateResult.url!
      } : undefined,
      
      vinPlate: vinPlateResult.success ? {
        id: Date.now() + 1,
        type: "vin_plate", 
        url: vinPlateResult.url!
      } : undefined,
      
      odometer: odometerResult.success ? {
        id: Date.now() + 2,
        type: "odometer",
        url: odometerResult.url!
      } : undefined,
      
      customerSignature: customerSignatureResult?.success ? {
        id: Date.now() + 3,
        type: "customer_signature",
        url: customerSignatureResult.url!
      } : undefined,
      
      additional: additionalResults
        .filter(result => result.success)
        .map((result, index) => ({
          id: Date.now() + 100 + index,
          type: `additional_${index + 1}`,
          url: result.url!
        })),
      
      or: orResults
        .filter(result => result.success)
        .map((result, index) => ({
          id: Date.now() + 200 + index,
          type: `or_${index + 1}`,
          url: result.url!
        })),
      
      reportPdfs: pdfResults
        .filter(result => result.success)
        .map((result, index) => ({
          id: Date.now() + 300 + index,
          type: `report_pdf_${index + 1}`,
          url: result.url!
        }))
    };

    const totalFiles =
      3 + // fotos obligatorias
      (customerSignatureResult ? 1 : 0) +
      additionalResults.filter(r => r.success).length +
      orResults.filter(r => r.success).length +
      pdfResults.filter(r => r.success).length;

    console.log(`✅ ${totalFiles} archivos subidos exitosamente`);

    return {
      success: true,
      photoUrls: organizedPhotos,
    };
  } catch (error) {
    console.error("❌ Error al subir fotos de reclamo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al subir archivos",
    };
  }
}
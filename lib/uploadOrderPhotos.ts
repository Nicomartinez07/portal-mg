// lib/uploadOrderPhotos.ts
import { uploadToS3, uploadMultipleToS3 } from "@/app/(dashboard)/actions/uploadToS3";

type PhotoFiles = {
  licensePlatePhoto: File;
  vinPlatePhoto: File;
  odometerPhoto: File;
  additionalPhotos?: File[];
  orPhotos?: File[];
  reportPdfs?: File[];
};

type PhotoUrls = {
  licensePlate: string;
  vinPlate: string;
  odometer: string;
  additional: string[];
  or: string[];
  reportPdfs: string[];
};

type UploadPhotosResult = {
  success: boolean;
  photoUrls?: PhotoUrls;
  error?: string;
};

/**
 * Sube todas las fotos/videos/PDFs de una orden a S3
 * @param orderId - ID de la orden (puede ser temporal para borradores)
 * @param files - Archivos a subir
 * @returns URLs de los archivos subidos
 */
export async function uploadOrderPhotos(
  orderId: number,
  files: PhotoFiles
): Promise<UploadPhotosResult> {
  try {
    console.log(`📤 Subiendo archivos para orden ${orderId}...`);

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
      pdfResults = await uploadMultipleToS3(files.reportPdfs, orderId, "report");
    }

    // Verificar que todas las subidas opcionales fueron exitosas
    const allOptionalResults = [...additionalResults, ...orResults, ...pdfResults];
    const failedOptionalUploads = allOptionalResults.filter((r) => !r.success);

    if (failedOptionalUploads.length > 0) {
      throw new Error(`Error al subir ${failedOptionalUploads.length} archivo(s) opcional(es)`);
    }

    // Construir objeto con todas las URLs
    const photoUrls: PhotoUrls = {
      licensePlate: licensePlateResult.url!,
      vinPlate: vinPlateResult.url!,
      odometer: odometerResult.url!,
      additional: additionalResults.map((r) => r.url!),
      or: orResults.map((r) => r.url!),
      reportPdfs: pdfResults.map((r) => r.url!),
    };

    const totalFiles =
      3 + // fotos obligatorias
      additionalResults.length +
      orResults.length +
      pdfResults.length;

    console.log(`✅ ${totalFiles} archivos subidos exitosamente`);

    return {
      success: true,
      photoUrls,
    };
  } catch (error) {
    console.error("❌ Error al subir fotos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al subir archivos",
    };
  }
}
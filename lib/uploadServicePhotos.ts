// lib/uploadServicePhotos.ts
import { uploadToS3, uploadMultipleToS3 } from "@/app/(dashboard)/actions/uploadToS3";

type ServicePhotoFiles = {
  vinPlatePhoto: File;
  orPhotos: File[]; // Siempre múltiples
};

type ServicePhotoUrls = {
  vinPlate: string;
  or: string[];
};

type UploadServicePhotosResult = {
  success: boolean;
  photoUrls?: ServicePhotoUrls;
  error?: string;
};

/**
 * Sube las fotos de un servicio a S3
 * @param orderId - ID de la orden (puede ser temporal para borradores)
 * @param files - Archivos a subir
 * @returns URLs de los archivos subidos
 */
export async function uploadServicePhotos(
  orderId: number,
  files: ServicePhotoFiles
): Promise<UploadServicePhotosResult> {
  try {
    console.log(`📤 Subiendo fotos de servicio para orden ${orderId}...`);

    // Subir foto VIN
    const vinPlateResult = await uploadToS3(files.vinPlatePhoto, orderId, "vin_plate");

    // Verificar que la foto VIN se subió correctamente
    if (!vinPlateResult.success) {
      throw new Error("Error al subir foto de VIN");
    }

    // Subir fotos OR (siempre múltiples)
    console.log(`📸 Subiendo ${files.orPhotos.length} fotos OR...`);
    const orResults = await uploadMultipleToS3(files.orPhotos, orderId, "or");

    // Verificar que todas las fotos OR se subieron correctamente
    const failedOrUploads = orResults.filter((r) => !r.success);

    if (failedOrUploads.length > 0) {
      throw new Error(`Error al subir ${failedOrUploads.length} foto(s) OR`);
    }

    // Construir objeto con todas las URLs
    const photoUrls: ServicePhotoUrls = {
      vinPlate: vinPlateResult.url!,
      or: orResults.map((r) => r.url!),
    };

    const totalFiles = 1 + orResults.length; // 1 VIN + N OR

    console.log(`✅ ${totalFiles} archivos subidos exitosamente`);

    return {
      success: true,
      photoUrls,
    };
  } catch (error) {
    console.error("❌ Error al subir fotos de servicio:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al subir archivos",
    };
  }
}
// actions.ts

'use server';

import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3-uploader'; // Importa la función que acabamos de crear

// Definimos los tipos de archivo permitidos y el tamaño máximo (ej: 10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = [
  'image/jpeg', 
  'image/png', 
  'image/webp', 
  'video/mp4', // Para los videos que mencionaste
];

/**
 * Server Action para subir un archivo y guardarlo en una Orden.
 * @param orderId El ID de la Orden a la que pertenece la foto.
 * @param photoType El tipo de foto (ej: "odometer").
 * @param formData El FormData que contiene el archivo.
 */
export async function uploadOrderPhoto(orderId: number, photoType: string, formData: FormData) {
  const file = formData.get('photo') as File; // 'photo' es el nombre que le daremos al input

  // --- 1. VALIDACIÓN ---
  if (!file || file.size === 0) {
    return { success: false, message: 'Debe seleccionar un archivo para subir.' };
  }
  
  if (!ALLOWED_MIMES.includes(file.type)) {
    return { success: false, message: 'Formato no permitido. Solo se aceptan JPEG, PNG, WEBP y MP4.' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, message: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB.` };
  }

  // --- 2. SUBIDA A S3 ---
  let imageUrl: string;
  try {
    const folder = `ordenes/${orderId}/`; // Cada orden tendrá su propia carpeta en S3
    imageUrl = await uploadToS3(file, folder, photoType);
  } catch (error) {
    console.error("Error al subir a S3:", error);
    return { success: false, message: 'Fallo al subir el archivo al servidor de AWS S3.' };
  }

  // --- 3. GUARDAR/ACTUALIZAR EN PRISMA ---
  try {
    // Para los tipos de foto que solo permiten UNA imagen (ej: "odometer", "vin_plate"):
    // Debemos buscar si ya existe una foto con ese type para esa orden y actualizarla (reemplazarla).
    // Si la foto es para un tipo que permite múltiples (ej: "additional_parts"), simplemente la creamos.

    const singlePhotoTypes = ["license_plate", "vin_plate", "odometer", "or_photo"]; 
    // *Según tu esquema, OR_PHOTO está en OrderPhoto, lo que soporta múltiples.
    // *Si necesitas que OR_PHOTO sea siempre 1, añádele la lógica de reemplazo.

    if (singlePhotoTypes.includes(photoType)) {
      // 3.1. Intentar actualizar (reemplazar la foto anterior)
      const existingPhoto = await prisma.orderPhoto.findFirst({
        where: { orderId: orderId, type: photoType },
      });

      if (existingPhoto) {
        // En un caso real, aquí deberíamos ELIMINAR el archivo anterior de S3.
        // Por simplicidad, solo actualizaremos la URL en la DB:
        await prisma.orderPhoto.update({
          where: { id: existingPhoto.id },
          data: { url: imageUrl },
        });
      } else {
        // 3.2. Si no existe, crear
        await prisma.orderPhoto.create({
          data: {
            orderId: orderId,
            type: photoType,
            url: imageUrl,
          },
        });
      }
    } else {
        // 3.3. Si permite múltiples (como "additional_parts"), simplemente crea la nueva entrada:
        await prisma.orderPhoto.create({
          data: {
            orderId: orderId,
            type: photoType,
            url: imageUrl,
          },
        });
    }

    return { success: true, message: 'Archivo subido y guardado exitosamente.', url: imageUrl };
  } catch (error) {
    console.error("Error al guardar en la base de datos:", error);
    return { success: false, message: 'Error de base de datos al guardar la referencia de la foto.' };
  }
}
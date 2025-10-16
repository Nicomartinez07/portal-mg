// lib/s3-uploader.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid'; // Para generar nombres de archivo únicos

// Inicialización del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Sube un archivo (File) a AWS S3.
 * @param file El objeto File del formulario.
 * @param folder La carpeta dentro del bucket (ej: 'ordenes/').
 * @param fileType El tipo de foto ('odometer', 'additional_parts', etc.).
 * @returns La URL pública del archivo subido.
 */
export async function uploadToS3(file: File, folder: string, fileType: string): Promise<string> {
  // 1. Generar nombre de archivo único
  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${folder}${fileType}-${uuidv4()}.${fileExtension}`;

  // 2. Convertir File a Buffer (necesario para S3)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Crear el comando de subida
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: uniqueFileName, // La ruta completa en el bucket
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read', // Permite que la imagen sea accesible públicamente por URL
  });

  // 4. Ejecutar la subida
  await s3Client.send(command);

  // 5. Construir y retornar la URL pública
  const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
  
  return publicUrl;
}
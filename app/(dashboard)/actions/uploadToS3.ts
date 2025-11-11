// actions/uploadToS3.ts
'use server';

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, AWS_BUCKET_NAME, AWS_REGION } from "@/lib/s3Client";

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

export async function uploadToS3(
  file: File,
  orderId: number,
  fileType: string // 'license_plate', 'vin_plate', 'odometer', 'extra', 'report_pdf'
): Promise<UploadResult> {
  try {
    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${fileType}-${timestamp}.${fileExtension}`;
    const key = `orders/${orderId}/${fileName}`;

    // Comando para subir a S3
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Construir URL pública del archivo
    const url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al subir el archivo',
    };
  }
}

export async function uploadMultipleToS3(
  files: File[],
  orderId: number,
  fileType: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file, index) => 
    uploadToS3(file, orderId, `${fileType}-${index + 1}`)
  );

  return Promise.all(uploadPromises);
}
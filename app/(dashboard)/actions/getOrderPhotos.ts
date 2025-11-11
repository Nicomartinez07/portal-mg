// actions/getOrderPhotos.ts
'use server';

import { prisma } from "@/lib/prisma";

export type OrderPhoto = {
  id: number;
  type: string;
  url: string;
};

export type OrganizedPhotos = {
  licensePlate?: OrderPhoto;
  vinPlate?: OrderPhoto;
  odometer?: OrderPhoto;
  additional: OrderPhoto[];
  or: OrderPhoto[];
  reportPdfs: OrderPhoto[];
};

export type GetOrderPhotosResult = {
  success: boolean;
  photos?: OrganizedPhotos;
  error?: string;
};

export async function getOrderPhotos(orderId: number): Promise<GetOrderPhotosResult> {
  try {
    const photos = await prisma.orderPhoto.findMany({
      where: { orderId },
      select: {
        id: true,
        type: true,
        url: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    // Organizar fotos por tipo
    const organized: OrganizedPhotos = {
      licensePlate: undefined,
      vinPlate: undefined,
      odometer: undefined,
      additional: [],
      or: [],
      reportPdfs: [],
    };

    photos.forEach((photo) => {
      if (photo.type === 'license_plate') {
        organized.licensePlate = photo;
      } else if (photo.type === 'vin_plate') {
        organized.vinPlate = photo;
      } else if (photo.type === 'odometer') {
        organized.odometer = photo;
      } else if (photo.type.startsWith('additional_')) {
        organized.additional.push(photo);
      } else if (photo.type.startsWith('or_')) {
        organized.or.push(photo);
      } else if (photo.type.startsWith('report_pdf_')) {
        organized.reportPdfs.push(photo);
      }
    });

    return {
      success: true,
      photos: organized,
    };
  } catch (error) {
    console.error('Error al cargar fotos de la orden:', error);
    return {
      success: false,
      error: 'Error al cargar las fotos',
    };
  }
}
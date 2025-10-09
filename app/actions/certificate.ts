"use server";

import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const logoPath = path.join(process.cwd(), "public", "logoMG.png");





export async function generateCertificate(warrantyId: number) {


    const warranty = await prisma.warranty.findUnique({


        where: { id: warrantyId },


        include: { customer: true, vehicle: true, company: true },


    });





    if (!warranty) throw new Error("Garantía no encontrada");





    const pdfDoc = await PDFDocument.create();


    const page = pdfDoc.addPage([600, 800]);


    const { width, height } = page.getSize();


    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);


    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);





    // --- LOGO ---


    const logoBytes = fs.readFileSync(logoPath);


    const logoImage = await pdfDoc.embedPng(logoBytes);


    const logoDims = logoImage.scale(0.5);


    page.drawImage(logoImage, {


        x: (width - logoDims.width) / 2,


        y: height - logoDims.height - 20,


        width: logoDims.width,


        height: logoDims.height,


    });





    // --- TÍTULO CENTRADO ---


    const title = "DATOS DEL CERTIFICADO";


    const titleWidth = boldFont.widthOfTextAtSize(title, 20);


    page.drawText(title, {


        x: (width - titleWidth) / 2, // Centrado horizontalmente


        y: height - logoDims.height - 80,


        size: 20,


        font: boldFont,


        color: rgb(0.1, 0.3, 0.7),


    });





    // --- DATOS VEHÍCULO ---


    const boxWidth = 350; // Reducido de 400 a 350 (más angosto)


    const boxHeight = 180; // Reducido de 200 a 180 (más bajo)


    const boxX = (width - boxWidth) / 2; // Centrado horizontalmente


    const boxYStart = height - logoDims.height - 120;





    // Dibujar recuadro centrado


    page.drawRectangle({


        x: boxX,


        y: boxYStart - boxHeight + 20,


        width: boxWidth,


        height: boxHeight,


        borderColor: rgb(0.1, 0.3, 0.7),


        borderWidth: 1,


        color: rgb(1, 1, 1),


    });





    const vehicleLines = [


        `Modelo: ${warranty.vehicle.model}`,


        `Tipo: ${warranty.vehicle.type}`,


        `VIN: ${warranty.vehicle.vin}`,


        `Motor: ${warranty.vehicle.engineNumber}`,


        `Año modelo: ${warranty.vehicle.year}`,


        `Nro. Certificado: ${warranty.vehicle.certificateNumber}`,


        `Fecha Importación: ${warranty.vehicle.importDate?.toISOString().slice(0, 10)}`,


    ];





    // Ajustar la posición vertical del contenido dentro del recuadro (más arriba)


    const totalContentHeight = vehicleLines.length * 25;


    const verticalPadding = 0;


    const startY = boxYStart - verticalPadding - (boxHeight - totalContentHeight) / 2;





    let y = startY;


    for (const line of vehicleLines) {


        page.drawText(line, {


            x: boxX + 20, // 20px de margen izquierdo


            y,


            size: 12,


            font: boldFont,


            color: rgb(0, 0, 0),


        });


        y -= 25;


    }





    // --- OBSERVACIONES ---


    const obsTextLines = [


        "Obs: La verificación del nro vin y motor para confeccionar los formularios 01 y 12 debe hacerse",


        "desde la unidad y no utilizando este documento y/o cualquier otro.",


        "",


        "La garantía de la unidad comienza a regir a partir de la fecha de facturación al cliente o al año",


        "de la fecha de fabricación, lo que se de primero."


    ];





    // Dibujar cada línea de observaciones con ancho máximo


    let obsY = y - 30;


    for (const line of obsTextLines) {


        page.drawText(line, {


            x: 50, // Margen izquierdo


            y: obsY,


            size: 10,


            font,


            color: rgb(0, 0, 0),


            maxWidth: width - 100, // Ancho máximo (márgenes de 50px a cada lado)


        });


        obsY -= 15;


    }





    const pdfBytes = await pdfDoc.save();


    return Buffer.from(pdfBytes);


}
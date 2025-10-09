// app/actions/certificates.ts
import PDFDocument from 'pdfkit';

/**
 * Genera un certificado de PDF básico para evitar errores de despliegue.
 * La lógica de generación completa se desarrollará posteriormente.
 * @param warrantyId El ID de la garantía (usado para el ejemplo).
 * @returns Una Promise que resuelve a un Buffer con los datos del PDF.
 */
export async function generateCertificate(warrantyId: number): Promise<Buffer> {
    // Retorna un PDF de prueba simple
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        // Escribir algo de texto en el PDF
        doc.fontSize(25)
            .text(`Certificado de Prueba - ID: ${warrantyId}`, 100, 100);

        doc.fontSize(12)
            .text('Este es un PDF temporal para permitir el despliegue.', 100, 150);

        // Manejo de eventos para recolectar el Buffer
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        doc.on('error', reject);

        // Finalizar el documento
        doc.end();
    });
}
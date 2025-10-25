// lib/email.ts
import { Resend } from 'resend';

import { getImporterEmailsForNotification } from "@/app/(dashboard)/general/actions"
// ... (tu const resend, baseUrl, y tu función sendPasswordResetEmail) ...
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Envía una notificación de nueva orden a una lista de emails (BCC).
 */export async function sendNewOrderNotificationEmail(
  toEmails: string[], // Array de emails
  orderNumber: number, // N° de orden (ej: 100001)
  orderType: string, // "RECLAMO" o "PRE_AUTORIZACION"
  vin: string,
  createdByUser: string
) {
  const subject = `Nueva Orden (${orderType}) N° ${orderNumber} requiere atención - Postventa MG`;
  console.log(`[EMAIL] Preparando notificación de orden ${orderNumber} para ${toEmails.length} usuarios.`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Postventa MG <no-reply@tu-dominio-verificado.com>', // ⚠️ Usa tu dominio de Resend
      
      // Ponemos un email genérico en el 'to:'.
      to: 'notificaciones@tu-dominio-verificado.com', // ⚠️ Usa un email tuyo o de la app
      
      // 🚨 ¡LA LISTA COMPLETA VA ACÁ! 🚨
      bcc: toEmails, 
      
      subject: subject,
      html: `
        <h1>Nueva Orden Creada</h1>
        <p>Se ha creado una nueva orden de tipo <strong>${orderType}</strong> que requiere su atención.</p>
        <hr>
        <ul>
          <li><strong>N° de Orden:</strong> ${orderNumber}</li>
          <li><strong>VIN del Vehículo:</strong> ${vin}</li>
          <li><strong>Creado por Usuario:</strong> ${createdByUser}</li>
        </ul>
        <p>Por favor, ingrese a la plataforma para gestionarla.</p>
      `,
    });

    if (error) {
      console.error("[RESEND_ERROR] al enviar notificación de orden:", error);
      throw new Error("Error al enviar el email de notificación");
    }

    console.log(`[EMAIL] Notificación de orden ${orderNumber} enviada con éxito.`);
    return data; // Éxito

  } catch (error) {
    console.error("Error en sendNewOrderNotificationEmail:", error);
    throw error;
  }
}

/**
 * Función "Disparadora" (Fire-and-Forget)
 * Esta es la función que llamarás desde tus server actions.
 */
export function triggerNewOrderNotification(
  orderNumber: number,
  vin: string,
  createdByUser: string,
  orderType: string
) {
  (async () => {
    try {
      console.log(`[NOTIFY] Disparando notificación para Orden ${orderNumber} (${orderType})...`);
      
      // 1. Buscar emails de Importadores
      const emails = await getImporterEmailsForNotification();

      if (emails.length > 0) {
        // 2. Enviar el correo
        await sendNewOrderNotificationEmail(
          emails,
          orderNumber,
          orderType,
          vin,
          createdByUser
        );
      } else {
        console.log("[NOTIFY] No hay importadores (con notifs activas) para avisar.");
      }
    } catch (error) {
      // Si falla el envío de emails, solo lo registramos.
      // No debe fallar la creación de la orden por esto.
      console.error(`[NOTIFY_ERROR] Falló el envío de emails en segundo plano para orden ${orderNumber}:`, error);
    }
  })(); 
}
// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * ⚠️ IMPORTANTE:
 * Como NO tenés dominio verificado todavía, el email "from:"
 * DEBE usar "onboarding@resend.dev".
 *
 * Cuando la empresa te dé el dominio, cambiar:
 *   from: `Nombre <no-reply@tudominio.com>`
 */

// -------------------------------------------------------------
// 1) Enviar email de nueva orden (varios destinatarios vía BCC)
// -------------------------------------------------------------
export async function triggerNewOrderNotification(
  toEmails: string[],
  orderNumber: number,
  vin: string,
  createdByUser: string,
  orderType: string
) {
  console.log(
    `[EMAIL] Preparando notificación de orden ${vin} para ${toEmails?.length ?? 0} usuarios.`
  );

  try {
    const { data, error } = await resend.emails.send({
      from: "Postventa MG <onboarding@resend.dev>", // SIN dominio
      to: "nicolasmartinezalfonso@gmail.com",                   // requerido sin dominio

      // ⚠️ Resend sin dominio NO acepta array en BCC → usamos string
      bcc: Array.isArray(toEmails) ? toEmails.join(",") : "",

      subject: `Nueva Orden (${orderType}) N° ${orderNumber}`,
      html: `
          <div style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden;">
              <!-- HEADER -->
              <tr>
                <td style="background: #222; padding: 20px; text-align: center;">
                    <h2 style="margin: 0; font-size: 22px; color: #f4f4f4;">
                      PORTAL MG 
                    </h2>
                </td>
              </tr>

              <!-- TITLE -->
              <tr>
                <td style="padding: 25px 20px 10px 20px;">
                  <h2 style="margin: 0; font-size: 22px; color: #333;">
                    Nueva Orden (${orderType}) Nº ${orderNumber}
                  </h2>
                </td>
              </tr>

              <!-- CONTENT BODY -->
              <tr>
                <td style="padding: 0 20px 20px 20px; color: #444; font-size: 16px; line-height: 1.6;">
                  <p>Se ha generado una nueva orden.</p>

                  <table width="100%" cellpadding="8" style="margin-top: 15px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px;">
                    <tr>
                      <td><strong>Tipo:</strong></td>
                      <td>${orderType}</td>
                    </tr>
                    <tr>
                      <td><strong>VIN:</strong></td>
                      <td>${vin}</td>
                    </tr>
                    <tr>
                      <td><strong>Creado por:</strong></td>
                      <td>${createdByUser}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA BUTTON -->
              <tr>
                <td style="padding: 20px; text-align: center;">
                  <a href="http://localhost:3000/ordenes" 
                    style="
                      display: inline-block;
                      background: #e30613;
                      color: white;
                      padding: 12px 20px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      font-size: 15px;
                    "
                  >
                    Ver Orden
                  </a>
                </td>
              </tr>

              <!-- FOOTER -->
              <tr>
                <td style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                  <p style="margin: 0;">© 2025 Postventa MG · Sistema de Gestión Interna</p>
                </td>
              </tr>
            </table>
          </div>
        `,
    });

    if (error) {
      console.error("[RESEND_ERROR] Error enviando notificación:", error);
      throw new Error("Error al enviar el email de notificación");
    }

    console.log(
      `[EMAIL] Notificación de orden ${orderNumber} enviada con éxito. Orden enviada a ${toEmails?.[0]}.`
      

    );
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// -------------------------------------------------------------
// 2) Enviar email de restablecimiento de contraseña
// -------------------------------------------------------------
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Postventa MG <onboarding@resend.dev>", // ⚠️ SIN DOMINIO
      to: email,
      subject: "Restablecer contraseña - Postventa MG",
      html: `
        <h1>Restablecimiento de Contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">Restablecer Contraseña</a>
        <p>Si no solicitaste esto, puedes ignorar el mensaje.</p>
      `,
    });

    if (error) {
      console.error("[RESEND_ERROR] al enviar email de reset:", error);
      throw new Error("Error al enviar el email de restablecimiento");
    }

    console.log(`[EMAIL] Email de reset enviado a ${email}`);
  } catch (err) {
    console.error("[RESET_ERROR] Fallo al enviar email de reset:", err);
    throw err;
  }
}

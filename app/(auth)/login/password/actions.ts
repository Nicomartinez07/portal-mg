// app/actions/password.ts
'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto'; // Para generar el token
import bcrypt from 'bcrypt';
import { z } from 'zod'; // ¡Ideal para validar!

const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ESQUEMA DE VALIDACIÓN
const RequestSchema = z.object({
  email: z.string().email({ message: 'Debe ser un email válido.' }),
});

const ResetSchema = z.object({
  token: z.string().min(1, { message: 'Token inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

// --- ACTION 1: Pedir el reseteo (la llama el modal) ---
export async function requestPasswordReset(formData: FormData) {
  const validatedFields = RequestSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }
  
  const { email } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`[RESET_PASSWORD] ❌ Usuario NO encontrado. (Respuesta de seguridad enviada)`);
      return { success: 'Si tu email está registrado, recibirás un correo en breve.' };
    }

    console.log(`[RESET_PASSWORD] ✅ Usuario encontrado: ${user.username} (ID: ${user.id})`);

    // 1. Generar token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex'); 
    const tokenExpires = new Date(Date.now() + 3600 * 1000);

    // 2. Guardar token hasheado en la BD
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken, 
        expires: tokenExpires,
      },
    });

    // 3. Crear el link de reseteo (con el token original)
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    console.log(`[RESET_PASSWORD] 📧 Intentando enviar email a ${email}...`);

    // 4. Enviar email con Resend
    await resend.emails.send({
      from: 'Postventa MG <no-reply@postventamg.com>', //CONFIGURAR ACA
      to: [email],
      subject: 'Reseteo de contraseña - Postventa MG',
      html: `
        <h1>Hola ${user.username},</h1>
        <p>Recibimos una solicitud para resetear tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Resetear Contraseña
        </a>
        <p>Si no solicitaste esto, puedes ignorar este email.</p>
        <p>El enlace expirará en 1 hora.</p>
      `,
    });
    console.log(`[RESET_PASSWORD] ✉️ ¡Email enviado exitosamente a ${email}!`);
    return { success: 'Si tu email está registrado, recibirás un correo en breve.' };

  } catch (error) {
    console.error('[PASSWORD_RESET_REQUEST]', error);
    return { error: 'Ocurrió un error en el servidor.' };
  }
}

// --- ACTION 2: Resetear la contraseña (la llama la página nueva) ---
export async function resetPassword(formData: FormData) {
  const validatedFields = ResetSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { token, password } = validatedFields.data;
  
  // 1. Hashear el token que nos llega del link
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    // 2. Buscar el token en la BD
    const dbToken = await prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!dbToken) {
      return { error: 'Token inválido o expirado.' };
    }

    if (new Date() > dbToken.expires) {
      return { error: 'Token inválido o expirado.' };
    }

    // 3. Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { id: dbToken.userId },
      data: {
        password: hashedPassword,
      },
    });

    // 5. Borrar el token para que no se re-use
    await prisma.passwordResetToken.delete({
      where: { id: dbToken.id },
    });

    return { success: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.' };

  } catch (error) {
    console.error('[PASSWORD_RESET]', error);
    return { error: 'Ocurrió un error en el servidor.' };
  }
}
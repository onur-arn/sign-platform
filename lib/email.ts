import nodemailer from 'nodemailer';
import { generateApprovalToken } from './approval-token';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const FROM = `"Sign Language" <${process.env.GMAIL_USER}>`;

export async function sendApprovalRequestEmail(newUser: { name: string | null; email: string; id: string }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;

  const approveToken = generateApprovalToken(newUser.id, 'approve');
  const rejectToken  = generateApprovalToken(newUser.id, 'reject');
  const base = process.env.NEXTAUTH_URL;
  const approveUrl = `${base}/api/admin/approve?token=${approveToken}`;
  const rejectUrl  = `${base}/api/admin/approve?token=${rejectToken}`;

  const info = await getTransporter().sendMail({
    from: FROM,
    to: adminEmail,
    subject: `Nouvelle demande d'inscription — ${newUser.name || newUser.email}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;">
        <h2 style="color:#5ba4b0;">Nouvelle demande d'inscription</h2>
        <p><strong>Nom :</strong> ${newUser.name || '—'}</p>
        <p><strong>Email :</strong> ${newUser.email}</p>
        <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <div style="margin-top:24px;">
          <a href="${approveUrl}" style="background:#16a34a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            ✓ Approuver
          </a>
          &nbsp;&nbsp;
          <a href="${rejectUrl}" style="background:#dc2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
            ✗ Rejeter
          </a>
        </div>
        <p style="margin-top:20px;color:#64748b;font-size:12px;">
          Lien valable 48 heures. Vous pouvez aussi gérer les demandes depuis
          <a href="${base}/admin">le panneau admin</a>.
        </p>
      </div>
    `,
  });
  console.log('[email] admin notifié:', info.messageId);
}

export async function sendStatusEmail(userEmail: string, approved: boolean) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const base = process.env.NEXTAUTH_URL;

  const info = await getTransporter().sendMail({
    from: FROM,
    to: userEmail,
    subject: approved ? 'Votre compte a été approuvé' : 'Votre demande a été refusée',
    html: approved
      ? `<div style="font-family:sans-serif;max-width:500px;margin:auto;">
           <h2 style="color:#5ba4b0;">Compte approuvé ✓</h2>
           <p>Bonjour,</p>
           <p>Votre compte a été <strong style="color:#16a34a">approuvé</strong>. Vous pouvez maintenant vous connecter.</p>
           <a href="${base}/login" style="display:inline-block;margin-top:16px;background:#5ba4b0;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
             Se connecter
           </a>
         </div>`
      : `<div style="font-family:sans-serif;max-width:500px;margin:auto;">
           <h2 style="color:#dc2626;">Demande refusée</h2>
           <p>Bonjour,</p>
           <p>Votre demande d'inscription a été <strong style="color:#dc2626">refusée</strong>.<br>
           Contactez l'administrateur pour plus d'informations.</p>
         </div>`,
  });
  console.log('[email] statut envoyé à', userEmail, ':', info.messageId);
}

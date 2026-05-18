export async function sendValidationEmail(submission: any) {
  // TODO: Replace with an actual email provider like Nodemailer or Resend
  console.log("=================================================");
  console.log("📧 MOCK EMAIL DISPATCHED (VALIDATION)");
  console.log(`To: ${submission.email}`);
  console.log(`Subject: Confirmation de votre dépôt d'amiante - Dossier ${submission.code}`);
  console.log(`
Bonjour ${submission.prenom} ${submission.nom},

Nous avons le plaisir de vous informer que votre justificatif de domicile a été vérifié et que votre dossier d'inscription (Code: ${submission.code}) pour la campagne amiante 2026 a été VALIDÉ par nos équipes.

Voici le récapitulatif définitif de vos deux rendez-vous :

1️⃣ Rendez-vous pour la Remise de vos équipements (EPI) :
📅 Date : ${formatDateFR(submission.epiDate)}
🕒 Heure : ${submission.epiTime}
📍 Lieu : Pôle administratif du SITCOM (ou lieu défini)

2️⃣ Rendez-vous pour le Dépôt de vos déchets d'amiante :
📅 Date : ${formatDateFR(submission.dropDate)}
🕒 Heure : ${submission.dropTime}
📍 Site : Déchetterie de ${submission.site}

⚠️ N'oubliez pas de vous munir de votre code de dossier (${submission.code}) et de bien respecter l'ordre de ces rendez-vous. Il est impératif d'utiliser les équipements de protection pour votre dépôt.

Merci de votre participation à cette campagne.
L'équipe SITCOM.
  `);
  console.log("=================================================");

  // Return true to simulate successful sending
  return true;
}

export async function sendInitialConfirmationEmail(submission: any) {
  console.log("=================================================");
  console.log("📧 MOCK EMAIL DISPATCHED (INITIAL REGISTRATION)");
  console.log(`To: ${submission.email}`);
  console.log(`Subject: Prise en compte de votre demande - Dossier ${submission.code}`);
  console.log(`
Bonjour ${submission.prenom} ${submission.nom},

Nous avons bien enregistré votre demande d'inscription à la campagne de collecte d'amiante 2026.
Votre numéro de dossier est le : ${submission.code}

Votre justificatif de domicile est actuellement en cours d'examen par nos équipes.
Vous recevrez un nouvel email de confirmation dès que votre dossier sera validé.

Récapitulatif de vos rendez-vous (sous réserve de validation) :
- Remise des EPI : le ${formatDateFR(submission.epiDate)} à ${submission.epiTime}
- Dépôt des déchets : le ${formatDateFR(submission.dropDate)} à ${submission.dropTime} sur le site de ${submission.site}

Merci de votre participation.
L'équipe SITCOM.
  `);
  console.log("=================================================");

  return true;
}

function formatDateFR(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

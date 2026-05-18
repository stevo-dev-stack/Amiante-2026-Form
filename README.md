# SITCOM - Campagne Amiante 2026

Plateforme d'inscription en ligne et backoffice de gestion pour la campagne de collecte d'amiante 2026 organisée par le SITCOM Côte sud des Landes.

## 📱 Interface Citoyen (Formulaire d'inscription)

Le formulaire d'inscription (`AmianteForm`) est conçu avec une approche **Mobile-First**, garantissant une utilisation optimale sur smartphone, tablette et bureau. Il est divisé en 4 étapes fluides :

1. **Identité & Justificatif** : 
   - Sélection du site de collecte (Messanges ou Bénesse-Maremne).
   - Informations de contact (Nom, Prénom, Adresse complète, Email).
   - Upload d'un justificatif de domicile (PDF, JPG, PNG) avec prévisualisation et possibilité d'utiliser l'appareil photo sur mobile.
2. **RDV Remise EPI (Équipements de Protection Individuelle)** : 
   - Calendrier dynamique pour choisir la date de remise du matériel.
   - *Logique métier* : Obligation de sélectionner une date antérieure ou égale à la date du dépôt des déchets.
3. **RDV Dépôt des déchets** : 
   - Calendrier interactif pour sélectionner la date de dépôt de l'amiante.
   - Sélection dynamique des créneaux horaires disponibles.
4. **Récapitulatif & Validation** : 
   - Résumé des informations saisies et des rendez-vous sélectionnés.
   - Validation des Conditions Générales d'Utilisation.
   - Génération d'un code de suivi de dossier à la soumission.

## 🛠️ Backoffice Administratif

Le tableau de bord (`AdminDashboard`) permet aux agents du SITCOM de gérer l'afflux des demandes et de valider les dossiers.

- **Authentification sécurisée** : Accès restreint par mot de passe via l'endpoint `/admin/login`.
- **Gestion des dossiers** : Tableau récapitulatif listant l'ensemble des inscriptions.
- **Validation des justificatifs** : Possibilité de visualiser directement le justificatif de domicile téléchargé par l'usager.
- **Statut des demandes** : Changement d'état des dossiers (En attente `PENDING`, Validé `VALIDATED`, Rejeté `REJECTED`). L'acceptation du justificatif peut déclencher un second email de confirmation à l'usager.

## 🚀 Stack Technique

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript / React
- **Base de données** : SQLite (via Prisma ORM) pour le stockage des inscriptions.
- **Stockage** : Upload des justificatifs dans le répertoire `/public/uploads`.
- **Style** : CSS-in-JS & Inline Styles sur-mesure (pas de dépendances tierces type Tailwind, intégration fluide).

## 💻 Démarrer le projet en local

```bash
# Installer les dépendances
npm install

# Générer le client Prisma et synchroniser la base de données SQLite
npx prisma generate
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

Rendez-vous sur [http://localhost:3000](http://localhost:3000) pour voir le formulaire, et sur [http://localhost:3000/admin](http://localhost:3000/admin) pour accéder au backoffice.

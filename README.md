# **💰 Budget App (V1)**

Une application de gestion de budget personnelle, simple et efficace. Conçue pour offrir une vision claire des finances (Revenus vs Dépenses) avec une interface fluide et responsive.

## **✨ Fonctionnalités Principales**

* **Tableau de bord synthétique** : Vue immédiate du solde, des revenus et des dépenses du mois en cours.  
* **Saisie rapide** : Ajout d'opérations avec catégorisation et sous-catégories dynamiques.  
* **Analyses mensuelles** : Graphiques (Donut & Barres) pour visualiser la répartition des dépenses.  
* **Drill-down** : Détail des transactions par catégorie via un système d'accordéon.  
* **Authentification sécurisée** : Connexion via Google ou Email (géré par Clerk).  
* **Sync Cloud** : Base de données PostgreSQL hébergée sur Supabase.

## **🛠 Stack Technique**

* **Framework** : [Next.js 15](https://nextjs.org/) (App Router & Server Actions)  
* **Langage** : TypeScript  
* **Base de données** : PostgreSQL (via [Supabase](https://supabase.com/))  
* **ORM** : [Prisma](https://www.prisma.io/)  
* **Authentification** : [Clerk](https://clerk.com/)  
* **UI** : [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/ui](https://ui.shadcn.com/)  
* **Graphiques** : [Recharts](https://recharts.org/)  
* **Déploiement** : Docker / [Coolify](https://coolify.io/)

## **🚀 Installation & Démarrage Local**

### **Pré-requis**

* Node.js 18+  
* Un compte Clerk (pour les clés API)  
* Un projet Supabase (pour la DB)

### **1\. Cloner le projet**

git clone \[https://github.com/votre-pseudo/budget-app.git\](https://github.com/votre-pseudo/budget-app.git)  
cd budget-app

### **2\. Installer les dépendances**

npm install

### **3\. Configurer l'environnement**

Créez un fichier .env à la racine et remplissez-le avec vos clés :

\# SUPABASE (Connection Pooling & Direct)  
DATABASE\_URL="postgres://postgres.\[ref\]:\[password\]@\[aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true\](https://aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true)"  
DIRECT\_URL="postgres://postgres.\[ref\]:\[password\]@\[aws-0-eu-central-1.pooler.supabase.com:5432/postgres\](https://aws-0-eu-central-1.pooler.supabase.com:5432/postgres)"

\# CLERK (Auth)  
NEXT\_PUBLIC\_CLERK\_PUBLISHABLE\_KEY=pk\_test\_...  
CLERK\_SECRET\_KEY=sk\_test\_...

\# CLERK URLS  
NEXT\_PUBLIC\_CLERK\_SIGN\_IN\_URL=/sign-in  
NEXT\_PUBLIC\_CLERK\_SIGN\_UP\_URL=/sign-up  
NEXT\_PUBLIC\_CLERK\_AFTER\_SIGN\_IN\_URL=/  
NEXT\_PUBLIC\_CLERK\_AFTER\_SIGN\_UP\_URL=/

### **4\. Initialiser la Base de Données**

Synchronisez le schéma Prisma avec votre base Supabase et chargez les catégories par défaut.

npx prisma db push  
npx prisma db seed

### **5\. Lancer le serveur de développement**

npm run dev

Ouvrez [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) pour voir l'application.

## **📦 Structure du Projet**

/actions        \# Server Actions (Logique métier backend)  
/app            \# Pages et Routing (Next.js App Router)  
  ├── (auth)    \# Routes Clerk (sign-in, sign-up)  
  ├── stats     \# Page d'analyse  
  └── page.tsx  \# Dashboard principal  
/components     \# Composants React  
  ├── charts    \# Graphiques Recharts  
  ├── forms     \# Formulaires (React Hook Form \+ Zod)  
  ├── layout    \# Navbar, Layout wrappers  
  └── ui        \# Composants atomiques Shadcn  
/lib            \# Utilitaires (Prisma client, Helpers)  
/prisma         \# Schéma de base de données et Seed

## **🌍 Déploiement (Coolify)**

Ce projet est configuré pour être déployé facilement sur Coolify (Self-hosted PaaS).

1. **Source** : Connectez votre dépôt GitHub.  
2. **Build Pack** : Utilisez **Nixpacks**.  
3. **Variables** : Copiez-collez le contenu de votre .env dans les variables d'environnement de Coolify.  
4. **Domaine** : Configurez votre URL (ex: budget.mon-domaine.com).  
5. **Build** : Lancez le déploiement.

*Note : Le script postinstall dans package.json s'assure que le client Prisma est généré avant le build.*

Développé avec ❤️ pour reprendre le contrôle de ses finances.
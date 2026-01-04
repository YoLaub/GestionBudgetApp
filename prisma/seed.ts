import { PrismaClient } from '@prisma/client'

// VERSION STANDARD : Pas d'arguments bizarres, il lit le .env tout seul
const prisma = new PrismaClient()


async function main() {
  console.log('🌱 Début du seeding...')

  // Suppression des anciennes données (optionnel, pour nettoyer en dev)
  // await prisma.subCategory.deleteMany()
  // await prisma.category.deleteMany()

   // Définition des catégories "Système" (userId = null)
  const categoriesData = [
    {
      name: 'Prêt_Conso',
      icon: '💳',
      type: 'EXPENSE',
      subCategories: ['MonRythme', 'Conso_1','Conso_2','voiture_2', 'BNP']
    },
    {
      name: 'Prêt_Immo',
      icon: '🏠',
      type: 'EXPENSE',
      subCategories: ['prêt_1','prêt_2', 'Eco-PTZ']
    },
    {
      name: 'Charge_Fixe',
      icon: '🧾',
      type: 'EXPENSE',
      subCategories: ['Électricité', 'Eau', 'Internet', 'Téléphone_1','Téléphone_2', 'Assurance Habitation']
    },
    {
      name: 'Essence',
      icon: '⛽',
      type: 'EXPENSE',
      subCategories: ['Plein', 'Parking', 'Lavage', 'Entretien']
    },
    {
      name: 'Clope',
      icon: '🚬',
      type: 'EXPENSE',
      subCategories: ['Paquet', 'Cartouche']
    },
    {
      name: 'Course',
      icon: '🛒',
      type: 'EXPENSE',
      subCategories: ['Supermarché', 'Drive', 'Boulangerie', 'Marché', 'Boucherie']
    },
    {
      name: 'Autre',
      icon: '📦',
      type: 'EXPENSE',
      subCategories: ['Divers', 'Imprévu', 'Cadeaux', 'Retrait Espèces']
    },
    {
      name: 'Revenu',
      icon: '💰',
      type: 'INCOME',
      subCategories: ['Salaire', 'Prime', 'Freelance', 'Remboursement Sécu', 'Ventes', 'Aides']
    },
  ]

  for (const cat of categoriesData) {
    // 1. On cherche d'abord si la catégorie existe (évite le bug upsert sur null)
    let category = await prisma.category.findFirst({
      where: { 
        name: cat.name, 
        userId: null 
      } 
    })

    // 2. Si elle n'existe pas, on la crée
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cat.name,
          icon: cat.icon,
          type: cat.type as any,
          userId: null 
        },
      })
      console.log(`Created category: ${category.name}`)
    } else {
      console.log(`Category already exists: ${category.name}`)
    }

    // 3. Gestion des sous-catégories (ici upsert fonctionne bien car pas de null)
    for (const subName of cat.subCategories) {
      await prisma.subCategory.upsert({
        where: { name_categoryId: { name: subName, categoryId: category.id } },
        update: {},
        create: {
          name: subName,
          categoryId: category.id
        }
      })
    }
  }

  console.log('✅ Seeding terminé avec succès.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
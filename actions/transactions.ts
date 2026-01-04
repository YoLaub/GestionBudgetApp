'use server'

import prisma from "../lib/prisma"
import { revalidatePath } from "next/cache"
// FIX: On importe le schéma depuis le fichier neutre
import { TransactionSchema, TransactionValues } from "@/lib/schemas"
import { checkUser } from "@/lib/check-user"

export async function createTransaction(data: TransactionValues) {
  const result = TransactionSchema.safeParse(data)
  
  if (!result.success) {
    console.error("Validation error:", result.error)
    return { error: "Données invalides" }
  }

  try {
    const dummyUser = await checkUser()
    
    if (!dummyUser) {
      return { error: "Aucun utilisateur trouvé. Veuillez créer un compte." }
    }

    await prisma.transaction.create({
      data: {
        amount: result.data.amount,
        description: result.data.description,
        date: result.data.date,
        type: result.data.type,
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId || null,
        userId: dummyUser.id,
      }
    })

    revalidatePath('/')
    return { success: true }
    
  } catch (error) {
    console.error("Erreur création transaction:", error)
    return { error: "Erreur serveur lors de la création" }
  }
}

export async function getRecentTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
      take: 10, 
      include: {
        category: true,
        subCategory: true
      }
    })

    // FIX : On force la sérialisation pour éviter les erreurs "Passable Object" de Next.js
    // Cela transforme les Dates en Strings et retire les méthodes internes de Prisma
    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error("Erreur récupération transactions:", error)
    return []
  }
}
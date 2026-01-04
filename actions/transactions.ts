'use server'

import prisma from "../lib/prisma"
import { revalidatePath } from "next/cache"
import { TransactionSchema, TransactionValues } from "@/lib/schemas"
// IMPORTANT : On importe le checkUser pour l'authentification
import { checkUser } from "@/lib/check-user"

export async function createTransaction(data: TransactionValues) {
  const result = TransactionSchema.safeParse(data)
  
  if (!result.success) {
    console.error("Validation error:", result.error)
    return { error: "Données invalides" }
  }

  try {
    // 1. Authentification stricte
    const user = await checkUser()
    if (!user) {
      return { error: "Vous devez être connecté pour ajouter une transaction." }
    }

    // 2. Gestion du libellé par défaut
    // Si pas de libellé, on va chercher le nom de la catégorie pour remplir le champ
    let finalDescription = result.data.description;
    
    if (!finalDescription) {
      const category = await prisma.category.findUnique({
        where: { id: result.data.categoryId }
      })
      finalDescription = category?.name || "Opération"
    }

    await prisma.transaction.create({
      data: {
        amount: result.data.amount,
        description: finalDescription, // On utilise le libellé calculé
        date: result.data.date,
        type: result.data.type,
        categoryId: result.data.categoryId,
        subCategoryId: result.data.subCategoryId || null,
        userId: user.id, // CRITIQUE : On lie à l'utilisateur connecté
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
    // 1. Authentification stricte pour la lecture
    const user = await checkUser()
    
    // Si pas d'utilisateur, on renvoie une liste vide (pas d'erreur, juste vide)
    if (!user) return []

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id // CRITIQUE : On ne récupère QUE les transactions de cet utilisateur
      },
      orderBy: {
        date: 'desc',
      },
      take: 10, 
      include: {
        category: true,
        subCategory: true
      }
    })

    return JSON.parse(JSON.stringify(transactions))
  } catch (error) {
    console.error("Erreur récupération transactions:", error)
    return []
  }
}
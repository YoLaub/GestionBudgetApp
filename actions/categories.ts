'use server'

import prisma from "../lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  try {
    // On récupère les catégories globales (userId null)
    // TODO: Plus tard, ajouter .or({ userId: user.id }) pour les catégories perso
    const categories = await prisma.category.findMany({
      where: {
        userId: null 
      },
      include: {
        subCategories: true // On a besoin des sous-catégories pour le 2ème select
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return categories
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return []
  }
}

// NOUVELLE FONCTION : Créer une sous-catégorie à la volée
export async function createSubCategory(categoryId: string, name: string) {
  try {
    if (!name || name.length < 2) {
      return { error: "Le nom doit faire au moins 2 caractères" }
    }

    const newSubCategory = await prisma.subCategory.create({
      data: {
        name: name,
        categoryId: categoryId
      }
    })

    // On rafraichit les données pour que le formulaire soit à jour au prochain chargement
    revalidatePath('/')
    
    return { success: true, data: newSubCategory }
  } catch (error) {
    console.error("Erreur création sous-catégorie:", error)
    return { error: "Impossible de créer ce type" }
  }
}
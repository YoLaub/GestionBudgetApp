import { z } from "zod"

export const TransactionSchema = z.object({
  amount: z.coerce.number().positive("Le montant doit être positif"),
  description: z.string().optional().or(z.literal('')),
  date: z.date(), 
  categoryId: z.string().min(1, "La catégorie est requise"),
  subCategoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]),
})

export type TransactionValues = z.infer<typeof TransactionSchema>
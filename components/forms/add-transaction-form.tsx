"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, Plus, Check, X } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { createTransaction } from "@/actions/transactions"
import { createSubCategory } from "@/actions/categories"
import { TransactionSchema, TransactionValues } from "@/lib/schemas"

// --- TYPES LOCAUX ---
type SubCategoryFn = { id: string; name: string }
type CategoryFn = { 
  id: string
  name: string
  icon: string | null
  subCategories: SubCategoryFn[] 
}

interface AddTransactionFormProps {
  categories: CategoryFn[]
}

export function AddTransactionForm({ categories = [] }: AddTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // États pour la création de sous-catégorie à la volée
  const [localCategories, setLocalCategories] = useState<CategoryFn[]>(categories)
  const [isCreatingType, setIsCreatingType] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [isSavingType, setIsSavingType] = useState(false)

  const form = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      amount: 0,
      description: "",
      date: new Date(),
      type: "EXPENSE" as const,
      categoryId: "", 
      subCategoryId: "",
    },
  })

  // Surveillance
  const selectedCategoryId = form.watch("categoryId")
  
  const safeCategories = Array.isArray(localCategories) ? localCategories : []
  // const selectedCategory = safeCategories.find(c => c.id === selectedCategoryId) // (Non utilisé ici directement mais utile si besoin)
  
  // Correction: On récupère les sous-catégories de la catégorie sélectionnée
  const currentCategory = safeCategories.find(c => c.id === selectedCategoryId)
  const subCategories = currentCategory?.subCategories || []

  // --- LOGIQUE D'AJOUT DE TYPE ---
  const handleCreateType = async () => {
    if (!newTypeName.trim() || !selectedCategoryId) return

    setIsSavingType(true)
    const result = await createSubCategory(selectedCategoryId, newTypeName)
    
    if (result.success && result.data) {
      // 1. Mettre à jour la liste locale
      const updatedCategories = localCategories.map(cat => {
        if (cat.id === selectedCategoryId) {
          return {
            ...cat,
            subCategories: [...cat.subCategories, result.data!]
          }
        }
        return cat
      })
      setLocalCategories(updatedCategories)

      // 2. Sélectionner le nouveau type
      form.setValue("subCategoryId", result.data.id)

      // 3. Reset UI
      setIsCreatingType(false)
      setNewTypeName("")
    } else {
      alert(result.error || "Erreur lors de la création")
    }
    setIsSavingType(false)
  }

  // --- LOGIQUE SOUMISSION ---
  const onSubmit: SubmitHandler<TransactionValues> = async (data) => {
    setIsSubmitting(true)
    try {
      const result = await createTransaction(data)
      if (result.error) {
        alert("Erreur: " + result.error) 
      } else {
        form.reset({
          amount: 0,
          description: "",
          date: new Date(),
          type: "EXPENSE",
          categoryId: "",
          subCategoryId: "",
        })
        setIsCreatingType(false)
      }
    } catch (error) {
      console.error("Erreur inattendue:", error)
      alert("Une erreur est survenue lors de l'envoi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Nouvelle Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Type : Dépense ou Revenu */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <div className="flex space-x-4 mb-4">
                    <Button
                      type="button"
                      variant={field.value === 'EXPENSE' ? 'destructive' : 'outline'}
                      className="w-1/2"
                      onClick={() => field.onChange('EXPENSE')}
                    >
                      Dépense
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'INCOME' ? 'default' : 'outline'}
                      className="bg-green-600 hover:bg-green-700 w-1/2 text-white"
                      onClick={() => field.onChange('INCOME')}
                    >
                      Revenu
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            {/* Montant */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field}
                      value={field.value as number}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Catégorie */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Colonne 1 : Catégorie */}
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select 
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue("subCategoryId", "")
                        setIsCreatingType(false)
                      }} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {safeCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Colonne 2 : Type (Sous-catégorie) */}
              <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    
                    {isCreatingType ? (
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Nom..." 
                          className="h-10 px-2 text-sm"
                          value={newTypeName}
                          onChange={(e) => setNewTypeName(e.target.value)}
                          autoFocus
                        />
                        <Button 
                          type="button" 
                          size="icon" 
                          className="h-10 w-10 shrink-0"
                          onClick={handleCreateType}
                          disabled={isSavingType}
                        >
                          {isSavingType ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4"/>}
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 shrink-0 text-red-500"
                          onClick={() => {
                            setIsCreatingType(false)
                            setNewTypeName("")
                          }}
                        >
                          <X className="h-4 w-4"/>
                        </Button>
                      </div>
                    ) : (
                      <Select 
                        onValueChange={(val) => {
                          if (val === "CREATE_NEW") {
                            setIsCreatingType(true)
                          } else {
                            field.onChange(val)
                          }
                        }}
                        value={field.value || ""}
                        disabled={!selectedCategoryId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={!selectedCategoryId ? "-" : "Détail..."} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="CREATE_NEW" className="text-blue-600 font-medium bg-blue-50 focus:bg-blue-100 cursor-pointer border-t mt-1">
                            <div className="flex items-center">
                              <Plus className="mr-2 h-4 w-4" />
                              Nouveau type...
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Libellé (Déplacé en dessous et rendu optionnel) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Libellé <span className="text-xs text-muted-foreground font-normal">(Optionnel)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: McDo, Loyer..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                "Ajouter la transaction"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
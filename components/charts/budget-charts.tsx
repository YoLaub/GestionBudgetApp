"use client"

import { useMemo } from "react"
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Couleurs harmonieuses pour les catégories
const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#a855f7', '#ec4899', '#64748b']

interface CategoryStat {
  name: string
  total: number
  icon: string | null
}

interface BudgetChartsProps {
  data: CategoryStat[]
  totalExpenses: number
}

export function BudgetCharts({ data, totalExpenses }: BudgetChartsProps) {
  
  // Formatage des données pour le PieChart (on garde les catégories > 0)
  const chartData = useMemo(() => {
    return data.filter(d => d.total > 0).map((d, index) => ({
      ...d,
      fill: COLORS[index % COLORS.length]
    }))
  }, [data])

  if (totalExpenses === 0) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée pour ce mois.</p>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="pie" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Répartition</h3>
        <TabsList>
          <TabsTrigger value="pie">Donut</TabsTrigger>
          <TabsTrigger value="bar">Barres</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pie">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="total"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                   // FIX: Idem ici, sécurisation du typage
                    formatter={(value: any) => `${Number(value).toFixed(2)} €`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bar">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Comparatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{fontSize: 12}} 
                  />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    // FIX: Idem ici, sécurisation du typage
                    formatter={(value: any) => `${Number(value).toFixed(2)} €`}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
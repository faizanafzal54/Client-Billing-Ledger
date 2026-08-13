"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatPKR } from "@/lib/money"

export function SalesChart({
  data,
}: {
  data: Array<{ label: string; total: number }>
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#d8d0c2" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#6b645b", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#6b645b", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={72}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
          />
          <Tooltip
            cursor={{ fill: "#f3eee4" }}
            formatter={(value) => formatPKR(Number(value))}
            contentStyle={{ border: "1px solid #d8d0c2", borderRadius: 8 }}
          />
          <Bar dataKey="total" fill="#14221c" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

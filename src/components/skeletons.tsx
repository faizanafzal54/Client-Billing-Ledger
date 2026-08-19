"use client"

import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-line/80", className)} />
}

export function PageHeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {withAction ? <Skeleton className="h-10 w-32" /> : null}
    </div>
  )
}

export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-8 w-28" />
          <Skeleton className="mt-2 h-3 w-36" />
        </div>
      ))}
    </div>
  )
}

export function CardListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <Skeleton className="h-10 w-full max-w-xl" />
      </div>
      <div className="overflow-x-auto p-4">
        <div className="space-y-3">
          <div className="flex gap-3">
            {Array.from({ length: cols }).map((_, index) => (
              <Skeleton key={index} className="h-4 flex-1" />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, row) => (
            <div key={row} className="flex gap-3">
              {Array.from({ length: cols }).map((_, col) => (
                <Skeleton key={col} className="h-8 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="card space-y-4 p-4 sm:p-5">
      <Skeleton className="h-6 w-40" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}

export function InvoiceSheetSkeleton() {
  return (
    <div className="mx-auto min-h-[297mm] w-[210mm] max-w-full overflow-hidden rounded-md border border-line bg-white p-10">
      <div className="flex justify-between">
        <Skeleton className="h-28 w-28" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="mt-8 h-px w-full" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function PageSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div>
      <PageHeaderSkeleton withAction={withAction} />
      <TableSkeleton />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton withAction />
      <StatRowSkeleton />
      <div className="mt-6">
        <CardListSkeleton rows={5} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <CardListSkeleton rows={6} />
        <CardListSkeleton rows={5} />
      </div>
    </div>
  )
}

export function LoadError({ message = "Could not load this page." }: { message?: string }) {
  return (
    <div className="card p-6">
      <p className="font-medium">{message}</p>
      <button className="btn-primary mt-4" type="button" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  )
}

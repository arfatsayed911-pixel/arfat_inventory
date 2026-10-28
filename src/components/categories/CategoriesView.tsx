"use client";

import React, { useState } from "react";
import { Category, Product } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Plus, Trash2, Package } from "lucide-react";
import { CategoryModal } from "./CategoryModal";

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onCreateCategory: (cat: { name: string; slug: string; description?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoriesView({
  categories,
  products,
  onCreateCategory,
  onDeleteCategory,
}: CategoriesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Group stats by category
  const categoryStats = React.useMemo(() => {
    const map = new Map<string, { count: number; totalCost: number; totalRetail: number }>();

    for (const c of categories) {
      map.set(c.id, { count: 0, totalCost: 0, totalRetail: 0 });
    }

    for (const p of products) {
      const entry = map.get(p.category_id);
      if (entry) {
        entry.count += 1;
        entry.totalCost += (p.cost_price || 0) * (p.current_stock || 0);
        entry.totalRetail += (p.selling_price || 0) * (p.current_stock || 0);
      }
    }

    return map;
  }, [categories, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Group your products by taxonomy, track category asset values, and maintain clean catalog organization.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => {
          const stats = categoryStats.get(c.id) || { count: 0, totalCost: 0, totalRetail: 0 };

          return (
            <Card key={c.id} className="relative overflow-hidden flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{c.name}</CardTitle>
                      <span className="text-[11px] font-mono text-slate-400">/{c.slug}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stats.count} {stats.count === 1 ? "item" : "items"}
                  </Badge>
                </div>
                {c.description && (
                  <CardDescription className="pt-2 text-xs">
                    {c.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-2 text-xs pt-0">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Valuation (Cost)</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stats.totalCost)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[11px] block">Retail Potential</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(stats.totalRetail)}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (stats.count > 0) {
                      alert(`Cannot delete category "${c.name}" because it still has ${stats.count} product(s) assigned.`);
                      return;
                    }
                    if (confirm(`Delete category "${c.name}"?`)) {
                      onDeleteCategory(c.id);
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={onCreateCategory}
      />
    </div>
  );
}


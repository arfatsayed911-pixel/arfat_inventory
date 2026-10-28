"use client";

import React, { useState } from "react";
import { Category, Product } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Plus, Trash2, ArrowLeft } from "lucide-react";
import { CategoryModal } from "./CategoryModal";

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onBackToHome: () => void;
  onCreateCategory: (cat: { name: string; slug: string; description?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export function CategoriesView({
  categories,
  products,
  onBackToHome,
  onCreateCategory,
  onDeleteCategory,
}: CategoriesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onBackToHome}
            className="h-8 px-2.5 text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Categories ({categories.length})
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Category
        </Button>
      </div>

      {/* Grid of Categories (Contained with internal scroll) */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.map((c) => {
          const stats = categoryStats.get(c.id) || { count: 0, totalCost: 0, totalRetail: 0 };

          return (
            <Card key={c.id} className="p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-slate-600" />
                    <span className="font-semibold text-sm">{c.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                    {stats.count} {stats.count === 1 ? "item" : "items"}
                  </Badge>
                </div>
                {c.description && (
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Cost Value</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(stats.totalCost)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (stats.count > 0) {
                      alert(`Category contains ${stats.count} items.`);
                      return;
                    }
                    if (confirm(`Delete ${c.name}?`)) onDeleteCategory(c.id);
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                  title="Delete Category"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
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

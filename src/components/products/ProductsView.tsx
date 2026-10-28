"use client";

import React, { useState, useMemo } from "react";
import { Product, Category } from "@/types/inventory";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Pencil, 
  Trash2,
  ArrowLeft
} from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  onBackToHome: () => void;
  onOpenProductModal: (product?: Product) => void;
  onOpenMovementModal: (productId: string, type: "IN" | "OUT") => void;
  onOpenHistoryModal: (product: Product) => void;
  onDeleteProduct: (id: string) => Promise<void>;
}

export function ProductsView({
  products,
  categories,
  onBackToHome,
  onOpenProductModal,
  onOpenMovementModal,
  onOpenHistoryModal,
  onDeleteProduct,
}: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "ALL" || p.category_id === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === "OUT_OF_STOCK") {
        matchesStatus = p.current_stock === 0;
      } else if (statusFilter === "LOW_STOCK") {
        matchesStatus = p.current_stock > 0 && p.current_stock <= p.min_threshold;
      } else if (statusFilter === "IN_STOCK") {
        matchesStatus = p.current_stock > p.min_threshold;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, statusFilter]);

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden">
      {/* Header with Back button and Actions */}
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
            Products ({products.length})
          </h1>
        </div>

        <Button
          size="sm"
          onClick={() => onOpenProductModal()}
          className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white px-2.5"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <div className="flex-1 min-w-[200px] max-w-xs relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search SKU or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs shadow-xs focus-visible:outline-none dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 text-xs dark:border-slate-800 dark:bg-slate-950">
          {(["ALL", "IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                statusFilter === filter
                  ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {filter === "ALL" ? "All" : filter === "IN_STOCK" ? "In Stock" : filter === "LOW_STOCK" ? "Low" : "Out"}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container (Fits remaining height without page scrolling) */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10 shadow-xs">
              <TableRow className="h-8">
                <TableHead className="py-2 text-[11px]">Product</TableHead>
                <TableHead className="py-2 text-[11px]">Category</TableHead>
                <TableHead className="py-2 text-[11px]">Stock</TableHead>
                <TableHead className="py-2 text-[11px]">Price</TableHead>
                <TableHead className="py-2 text-[11px]">Location</TableHead>
                <TableHead className="py-2 text-[11px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-400">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.current_stock === 0;
                  const isLowStock = !isOutOfStock && p.current_stock <= p.min_threshold;

                  return (
                    <TableRow key={p.id} className="h-10 hover:bg-slate-50/70">
                      <TableCell className="py-2">
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {p.sku}
                        </div>
                      </TableCell>

                      <TableCell className="py-2">
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {p.category?.name || "-"}
                        </span>
                      </TableCell>

                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs">{p.current_stock}</span>
                          <span className="text-[10px] text-slate-400">{p.unit}</span>
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-[9px] py-0 px-1">Out</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning" className="text-[9px] py-0 px-1">Low</Badge>
                          ) : (
                            <Badge variant="success" className="text-[9px] py-0 px-1">OK</Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-2 text-xs">
                        <span className="font-semibold">{formatCurrency(p.selling_price)}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({formatCurrency(p.cost_price)})</span>
                      </TableCell>

                      <TableCell className="py-2 text-xs text-slate-500">
                        {p.location || "-"}
                      </TableCell>

                      <TableCell className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenMovementModal(p.id, "IN")}
                            className="h-7 w-7 p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            title="Stock In"
                          >
                            <ArrowDownLeft className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onOpenMovementModal(p.id, "OUT")}
                            disabled={p.current_stock === 0}
                            className="h-7 w-7 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 disabled:opacity-30"
                            title="Stock Out"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenHistoryModal(p)}
                            className="h-7 w-7 p-0 text-slate-500"
                            title="History"
                          >
                            <History className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onOpenProductModal(p)}
                            className="h-7 w-7 p-0 text-slate-500"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Delete ${p.name}?`)) onDeleteProduct(p.id);
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

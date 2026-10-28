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
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  Pencil, 
  Trash2, 
  AlertTriangle,
  ArrowUpDown
} from "lucide-react";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  onOpenProductModal: (product?: Product) => void;
  onOpenMovementModal: (productId: string, type: "IN" | "OUT") => void;
  onOpenHistoryModal: (product: Product) => void;
  onDeleteProduct: (id: string) => Promise<void>;
}

export function ProductsView({
  products,
  categories,
  onOpenProductModal,
  onOpenMovementModal,
  onOpenHistoryModal,
  onDeleteProduct,
}: ProductsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK">("ALL");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

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
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "stock") {
        comparison = a.current_stock - b.current_stock;
      } else if (sortBy === "price") {
        comparison = a.selling_price - b.selling_price;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [products, searchTerm, selectedCategory, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field: "name" | "stock" | "price") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Product Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage catalog items, monitor real-time stock balances, and track movements.
          </p>
        </div>
        <Button onClick={() => onOpenProductModal()} className="bg-slate-900 hover:bg-slate-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by product, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "ALL"
                  ? "bg-slate-100 text-slate-900 font-semibold dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("IN_STOCK")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "IN_STOCK"
                  ? "bg-emerald-100 text-emerald-800 font-semibold dark:bg-emerald-950 dark:text-emerald-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStatusFilter("LOW_STOCK")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "LOW_STOCK"
                  ? "bg-amber-100 text-amber-800 font-semibold dark:bg-amber-950 dark:text-amber-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStatusFilter("OUT_OF_STOCK")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === "OUT_OF_STOCK"
                  ? "bg-rose-100 text-rose-800 font-semibold dark:bg-rose-950 dark:text-rose-300"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Out of Stock
            </button>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                <div className="flex items-center gap-1">
                  Product / SKU
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("stock")}>
                <div className="flex items-center gap-1">
                  Current Stock
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort("price")}>
                <div className="flex items-center gap-1">
                  Cost / Retail Price
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Quick Stock Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-slate-500">
                  No products found matching your search or filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => {
                const isOutOfStock = p.current_stock === 0;
                const isLowStock = !isOutOfStock && p.current_stock <= p.min_threshold;

                return (
                  <TableRow key={p.id}>
                    {/* Name & SKU */}
                    <TableCell>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                            {p.sku}
                          </span>
                          {p.barcode && <span>UPC: {p.barcode}</span>}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-xs">
                        {p.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>

                    {/* Stock & Status */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                            {p.current_stock}
                          </span>
                          <span className="text-xs text-slate-500">{p.unit}</span>
                          
                          {isOutOfStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Alert threshold: {p.min_threshold} {p.unit}
                        </div>
                      </div>
                    </TableCell>

                    {/* Pricing */}
                    <TableCell>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(p.selling_price)}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Cost: {formatCurrency(p.cost_price)}
                        </div>
                      </div>
                    </TableCell>

                    {/* Location */}
                    <TableCell>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {p.location || "Default Shelf"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Stock In */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenMovementModal(p.id, "IN")}
                          title="Record Stock In"
                          className="h-8 w-8 p-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        </Button>

                        {/* Quick Stock Out */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenMovementModal(p.id, "OUT")}
                          title="Record Stock Out"
                          disabled={p.current_stock === 0}
                          className="h-8 w-8 p-0 text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950 disabled:opacity-30"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>

                        {/* History Audit Trail */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenHistoryModal(p)}
                          title="View Movement Audit Trail"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenProductModal(p)}
                          title="Edit Product"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}? This will also remove its movement history.`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          title="Delete Product"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
  );
}


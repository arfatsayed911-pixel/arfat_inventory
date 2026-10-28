"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, Product } from "@/types/inventory";

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
  categories: Category[];
  onSave: (product: any) => Promise<void>;
}

export function ProductFormModal({
  open,
  onOpenChange,
  productToEdit,
  categories,
  onSave,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category_id: "",
    description: "",
    unit: "pcs",
    cost_price: "",
    selling_price: "",
    current_stock: "",
    min_threshold: "5",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        barcode: productToEdit.barcode || "",
        category_id: productToEdit.category_id || (categories[0]?.id || ""),
        description: productToEdit.description || "",
        unit: productToEdit.unit || "pcs",
        cost_price: String(productToEdit.cost_price),
        selling_price: String(productToEdit.selling_price),
        current_stock: String(productToEdit.current_stock),
        min_threshold: String(productToEdit.min_threshold),
        location: productToEdit.location || "",
      });
    } else {
      setFormData({
        name: "",
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: "",
        category_id: categories[0]?.id || "",
        description: "",
        unit: "pcs",
        cost_price: "0.00",
        selling_price: "0.00",
        current_stock: "0",
        min_threshold: "5",
        location: "Warehouse A",
      });
    }
    setError(null);
  }, [productToEdit, open, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!formData.sku.trim()) {
      setError("SKU is required.");
      return;
    }
    if (!formData.category_id) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        current_stock: parseInt(formData.current_stock) || 0,
        min_threshold: parseInt(formData.min_threshold) || 5,
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>{productToEdit ? "Edit Product" : "Create New Product"}</DialogTitle>
        <DialogDescription>
          {productToEdit
            ? "Update product details, pricing, and reorder threshold."
            : "Register a new inventory item with stock and pricing details."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Product Name *
            </label>
            <Input
              required
              placeholder="e.g. Ergonomic Office Chair"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              SKU (Stock Keeping Unit) *
            </label>
            <Input
              required
              placeholder="e.g. FURN-CHR-001"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Barcode / UPC
            </label>
            <Input
              placeholder="e.g. 890123456789"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Measurement Unit
            </label>
            <select
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="box">Box (box)</option>
              <option value="pack">Pack (pack)</option>
              <option value="ream">Ream (ream)</option>
              <option value="kg">Kilogram (kg)</option>
              <option value="litres">Litres (L)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Cost Price ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Selling Price ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.selling_price}
              onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Current Stock Quantity
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              disabled={Boolean(productToEdit)} // For existing product, use Stock In / Out
              value={formData.current_stock}
              onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
            />
            {productToEdit && (
              <span className="text-[10px] text-slate-500">
                To alter existing stock, use the Stock-In/Out action.
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Low-Stock Alert Threshold
            </label>
            <Input
              type="number"
              min="1"
              placeholder="5"
              value={formData.min_threshold}
              onChange={(e) => setFormData({ ...formData, min_threshold: e.target.value })}
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Warehouse / Storage Location
            </label>
            <Input
              placeholder="e.g. Warehouse A - Shelf 3B"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : productToEdit ? "Update Product" : "Create Product"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}


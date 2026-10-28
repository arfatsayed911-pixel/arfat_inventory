"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ProductsView } from "@/components/products/ProductsView";
import { MovementsView } from "@/components/stock/MovementsView";
import { CategoriesView } from "@/components/categories/CategoriesView";
import { ReportsView } from "@/components/reports/ReportsView";
import { SetupView } from "@/components/setup/SetupView";

import { ProductFormModal } from "@/components/products/ProductFormModal";
import { StockMovementModal } from "@/components/stock/StockMovementModal";
import { ProductHistoryModal } from "@/components/products/ProductHistoryModal";
import { LowStockNotificationModal } from "@/components/alerts/LowStockNotificationModal";

import { InventoryService } from "@/lib/services/inventoryService";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { 
  Category, 
  Product, 
  StockMovement, 
  InventoryStats, 
  LowStockAlertItem, 
  MovementType 
} from "@/types/inventory";

export default function InventoryApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Core Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalStockUnits: 0,
    totalCostValue: 0,
    totalRetailValue: 0,
    potentialProfit: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    inStockCount: 0,
    recentMovementsCount: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockAlertItem[]>([]);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedProductIdForMovement, setSelectedProductIdForMovement] = useState<string | undefined>();
  const [movementTypeForModal, setMovementTypeForModal] = useState<MovementType>("IN");

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);

  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [cats, prods, movs, st, low] = await Promise.all([
        InventoryService.getCategories(),
        InventoryService.getProducts(),
        InventoryService.getStockMovements(),
        InventoryService.getStats(),
        InventoryService.getLowStockItems(),
      ]);

      setCategories(cats);
      setProducts(prods);
      setMovements(movs);
      setStats(st);
      setLowStockItems(low);
    } catch (err) {
      console.error("Error loading inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product Actions
  const handleOpenProductModal = (product?: Product) => {
    setEditingProduct(product || null);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    if (editingProduct) {
      await InventoryService.updateProduct(editingProduct.id, productData);
    } else {
      await InventoryService.createProduct(productData);
    }
    await loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    await InventoryService.deleteProduct(id);
    await loadData();
  };

  // Stock Movement Actions
  const handleOpenMovementModal = (productId?: string, type: MovementType = "IN") => {
    setSelectedProductIdForMovement(productId);
    setMovementTypeForModal(type);
    setMovementModalOpen(true);
  };

  const handleRecordMovement = async (params: any) => {
    const result = await InventoryService.recordStockMovement(params);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // History Action
  const handleOpenHistoryModal = (product: Product) => {
    setSelectedProductForHistory(product);
    setHistoryModalOpen(true);
  };

  // Category Actions
  const handleCreateCategory = async (catData: { name: string; slug: string; description?: string }) => {
    await InventoryService.createCategory(catData);
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    await InventoryService.deleteCategory(id);
    await loadData();
  };

  // Demo Reset
  const handleResetDemo = () => {
    if (confirm("Reset local inventory back to default sample items & movement history?")) {
      InventoryService.resetToDemoData();
      loadData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockItems.length}
        onOpenAlerts={() => setAlertsModalOpen(true)}
        isSupabaseLive={isSupabaseConfigured}
        onResetData={handleResetDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto dark:border-slate-100" />
              <p className="text-xs text-slate-500">Loading inventory system...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardView
                stats={stats}
                lowStockItems={lowStockItems}
                recentMovements={movements}
                onOpenProductModal={() => handleOpenProductModal()}
                onOpenMovementModal={(type) => handleOpenMovementModal(undefined, type || "IN")}
                onOpenAlertsModal={() => setAlertsModalOpen(true)}
                onNavigateToTab={setActiveTab}
              />
            )}

            {activeTab === "products" && (
              <ProductsView
                products={products}
                categories={categories}
                onOpenProductModal={handleOpenProductModal}
                onOpenMovementModal={handleOpenMovementModal}
                onOpenHistoryModal={handleOpenHistoryModal}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === "movements" && (
              <MovementsView
                movements={movements}
                onOpenMovementModal={handleOpenMovementModal}
              />
            )}

            {activeTab === "categories" && (
              <CategoriesView
                categories={categories}
                products={products}
                onCreateCategory={handleCreateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === "reports" && (
              <ReportsView
                products={products}
                categories={categories}
                movements={movements}
                stats={stats}
                lowStockItems={lowStockItems}
              />
            )}

            {activeTab === "deployment" && (
              <SetupView
                isSupabaseLive={isSupabaseConfigured}
                onOpenAlertsModal={() => setAlertsModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">StockPulse</span> &mdash; Modern Inventory & Stock Management System
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Next.js &bull; Supabase &bull; Resend &bull; Tailwind CSS</span>
            <button
              onClick={() => setActiveTab("deployment")}
              className="text-slate-700 hover:underline dark:text-slate-300 font-medium"
            >
              Setup Docs
            </button>
          </div>
        </div>
      </footer>

      {/* Dialog Modals */}
      <ProductFormModal
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        productToEdit={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
      />

      <StockMovementModal
        open={movementModalOpen}
        onOpenChange={setMovementModalOpen}
        products={products}
        initialProductId={selectedProductIdForMovement}
        initialType={movementTypeForModal}
        onRecord={handleRecordMovement}
      />

      <ProductHistoryModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        product={selectedProductForHistory}
      />

      <LowStockNotificationModal
        open={alertsModalOpen}
        onOpenChange={setAlertsModalOpen}
        lowStockItems={lowStockItems}
      />
    </div>
  );
}


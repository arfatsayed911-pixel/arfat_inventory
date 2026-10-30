"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { SidePanel } from "@/components/layout/SidePanel";
import { LoginPage } from "@/components/auth/LoginPage";

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
import { AuthService, AuthUser } from "@/lib/services/authService";
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
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [tabHistory, setTabHistory] = useState<string[]>(["dashboard"]);
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

  // Initialize Auth
  useEffect(() => {
    setMounted(true);
    const existingUser = AuthService.getStoredUser();
    if (existingUser) {
      setCurrentUser(existingUser);
    }
  }, []);

  // Navigation handlers with historical Back support
  const handleNavigate = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabHistory((prev) => [...prev, tab]);
  };

  const handleBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop();
      const previousTab = newHistory[newHistory.length - 1] || "dashboard";
      setTabHistory(newHistory);
      setActiveTab(previousTab);
    } else {
      setActiveTab("dashboard");
      setTabHistory(["dashboard"]);
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setCurrentUser(null);
    setActiveTab("dashboard");
    setTabHistory(["dashboard"]);
  };

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
    if (mounted && currentUser) {
      loadData();
    }
  }, [mounted, currentUser, loadData]);

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

  const handleResetDemo = () => {
    if (confirm("Reset local inventory back to default sample items & movements?")) {
      InventoryService.resetToDemoData();
      loadData();
    }
  };

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent dark:border-slate-100" />
      </div>
    );
  }

  // If user is not logged in, show the Login Page
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          loadData();
        }} 
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50/70 dark:bg-slate-950">
      {/* Top Navbar with Primary Feature Tabs, Back & Logout */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onBack={handleBack}
        canGoBack={activeTab !== "dashboard" || tabHistory.length > 1}
        lowStockCount={lowStockItems.length}
        onOpenAlerts={() => setAlertsModalOpen(true)}
        isSupabaseLive={isSupabaseConfigured}
        user={currentUser}
        onLogout={handleLogout}
        isSidePanelOpen={isSidePanelOpen}
        onToggleSidePanel={() => setIsSidePanelOpen(!isSidePanelOpen)}
      />

      {/* Main Container Area with Optional Minor Tools Side Panel */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* Main Feature Viewport (No Scroll on Window) */}
        <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto p-3 sm:p-4 flex flex-col overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto dark:border-slate-100" />
                <p className="text-xs text-slate-400 font-semibold">Loading Arfat Inventory...</p>
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
                  onNavigateToTab={handleNavigate}
                />
              )}

              {activeTab === "products" && (
                <ProductsView
                  products={products}
                  categories={categories}
                  onBackToHome={handleBack}
                  onOpenProductModal={handleOpenProductModal}
                  onOpenMovementModal={handleOpenMovementModal}
                  onOpenHistoryModal={handleOpenHistoryModal}
                  onDeleteProduct={handleDeleteProduct}
                />
              )}

              {activeTab === "movements" && (
                <MovementsView
                  movements={movements}
                  onBackToHome={handleBack}
                  onOpenMovementModal={handleOpenMovementModal}
                />
              )}

              {activeTab === "categories" && (
                <CategoriesView
                  categories={categories}
                  products={products}
                  onBackToHome={handleBack}
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
                  onBackToHome={handleBack}
                />
              )}

              {activeTab === "deployment" && (
                <SetupView
                  isSupabaseLive={isSupabaseConfigured}
                  onBackToHome={handleBack}
                  onOpenAlertsModal={() => setAlertsModalOpen(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Side Panel for Minor Features (Categories, Reports, Setup, Tools) */}
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          activeTab={activeTab}
          onNavigate={handleNavigate}
          stats={stats}
          isSupabaseLive={isSupabaseConfigured}
          onOpenAlerts={() => setAlertsModalOpen(true)}
          onResetDemo={handleResetDemo}
        />
      </div>

      {/* Modals */}
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

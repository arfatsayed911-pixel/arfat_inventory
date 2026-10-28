import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Category, Product, StockMovement, MovementType, MovementReason, InventoryStats, LowStockAlertItem } from "@/types/inventory";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_MOVEMENTS } from "@/lib/data/initialData";

const STORAGE_KEYS = {
  CATEGORIES: "arfat_categories_v1",
  PRODUCTS: "arfat_products_v1",
  MOVEMENTS: "arfat_movements_v1",
};

export class InventoryService {
  // Helper to get local data safely
  private static getLocalCategories(): Category[] {
    if (typeof window === "undefined") return INITIAL_CATEGORIES;
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  private static saveLocalCategories(categories: Category[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
  }

  private static getLocalProducts(): Product[] {
    if (typeof window === "undefined") return INITIAL_PRODUCTS;
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  private static saveLocalProducts(products: Product[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
  }

  private static getLocalMovements(): StockMovement[] {
    if (typeof window === "undefined") return INITIAL_MOVEMENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
      return INITIAL_MOVEMENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOVEMENTS;
    }
  }

  private static saveLocalMovements(movements: StockMovement[]) {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    }
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  static async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name", { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase categories fetch error, fallback to local:", err);
      }
    }
    return this.getLocalCategories();
  }

  static async createCategory(category: Omit<Category, "id" | "created_at">): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cat_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("categories")
          .insert(newCategory)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase create category error, saving locally:", err);
      }
    }

    const categories = this.getLocalCategories();
    categories.push(newCategory);
    this.saveLocalCategories(categories);
    return newCategory;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("categories").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete category error:", err);
      }
    }
    const categories = this.getLocalCategories().filter(c => c.id !== id);
    this.saveLocalCategories(categories);
    return true;
  }

  // ==========================================
  // PRODUCTS
  // ==========================================
  static async getProducts(): Promise<Product[]> {
    let products: Product[] = [];
    const categories = await this.getCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data) {
          products = data;
        }
      } catch (err) {
        console.warn("Supabase products fetch error, fallback to local:", err);
      }
    }

    if (products.length === 0) {
      products = this.getLocalProducts();
    }

    // Attach category object for easy UI rendering
    return products.map(p => ({
      ...p,
      category: categoryMap.get(p.category_id),
    }));
  }

  static async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  static async createProduct(productData: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `prod_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newProduct: Product = {
      ...productData,
      id,
      cost_price: Number(productData.cost_price),
      selling_price: Number(productData.selling_price),
      current_stock: Number(productData.current_stock) || 0,
      min_threshold: Number(productData.min_threshold) || 5,
      created_at: timestamp,
      updated_at: timestamp,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("products")
          .insert({
            id: newProduct.id,
            name: newProduct.name,
            sku: newProduct.sku,
            barcode: newProduct.barcode || null,
            category_id: newProduct.category_id,
            description: newProduct.description || null,
            unit: newProduct.unit,
            cost_price: newProduct.cost_price,
            selling_price: newProduct.selling_price,
            current_stock: newProduct.current_stock,
            min_threshold: newProduct.min_threshold,
            location: newProduct.location || null,
          })
          .select()
          .single();
        if (!error && data) {
          // If initial stock was provided, record initial movement
          if (newProduct.current_stock > 0) {
            await this.recordStockMovement({
              product_id: newProduct.id,
              type: "IN",
              quantity: newProduct.current_stock,
              reason: "initial",
              reference: "INITIAL-STOCK",
              notes: "Initial inventory registration",
              created_by: "System",
            });
          }
          return data;
        }
      } catch (err) {
        console.warn("Supabase create product error, fallback to local:", err);
      }
    }

    const localProducts = this.getLocalProducts();
    localProducts.unshift(newProduct);
    this.saveLocalProducts(localProducts);

    if (newProduct.current_stock > 0) {
      await this.recordStockMovement({
        product_id: newProduct.id,
        type: "IN",
        quantity: newProduct.current_stock,
        reason: "initial",
        reference: "INITIAL-STOCK",
        notes: "Initial inventory registration",
        created_by: "System",
      });
    }

    return newProduct;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("products")
          .update({
            ...updates,
            updated_at: timestamp,
          })
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn("Supabase update product error:", err);
      }
    }

    const localProducts = this.getLocalProducts();
    const index = localProducts.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated = {
      ...localProducts[index],
      ...updates,
      updated_at: timestamp,
    };
    localProducts[index] = updated;
    this.saveLocalProducts(localProducts);
    return updated;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("products").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete product error:", err);
      }
    }

    const localProducts = this.getLocalProducts().filter(p => p.id !== id);
    this.saveLocalProducts(localProducts);

    // Also filter out movements
    const localMovements = this.getLocalMovements().filter(m => m.product_id !== id);
    this.saveLocalMovements(localMovements);

    return true;
  }

  // ==========================================
  // STOCK MOVEMENTS & ACCURATE CALCULATIONS
  // ==========================================
  static async recordStockMovement(params: {
    product_id: string;
    type: MovementType;
    quantity: number;
    reason: MovementReason;
    reference?: string;
    notes?: string;
    created_by?: string;
  }): Promise<{ success: boolean; movement?: StockMovement; error?: string }> {
    const products = await this.getProducts();
    const product = products.find(p => p.id === params.product_id);

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const previousStock = Number(product.current_stock) || 0;
    const qty = Math.abs(Number(params.quantity));

    if (qty <= 0) {
      return { success: false, error: "Quantity must be greater than zero" };
    }

    let newStock = previousStock;

    if (params.type === "IN") {
      newStock = previousStock + qty;
    } else if (params.type === "OUT") {
      if (previousStock < qty) {
        return {
          success: false,
          error: `Insufficient stock! Current stock is ${previousStock} ${product.unit}, cannot dispatch ${qty} ${product.unit}.`,
        };
      }
      newStock = previousStock - qty;
    } else if (params.type === "ADJUSTMENT") {
      // For adjustment, quantity passed is the actual count from physical audit
      newStock = qty;
    }

    const movementId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `mov_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const movement: StockMovement = {
      id: movementId,
      product_id: params.product_id,
      type: params.type,
      quantity: params.type === "ADJUSTMENT" ? Math.abs(newStock - previousStock) : qty,
      previous_stock: previousStock,
      new_stock: newStock,
      reason: params.reason,
      reference: params.reference || "-",
      notes: params.notes || "",
      created_by: params.created_by || "Admin",
      created_at: timestamp,
    };

    // Update Product Stock in DB or Local
    await this.updateProduct(params.product_id, {
      current_stock: newStock,
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("stock_movements").insert(movement);
        if (error) console.warn("Supabase record movement error:", error);
      } catch (err) {
        console.warn("Supabase insert movement exception:", err);
      }
    }

    const movements = this.getLocalMovements();
    movements.unshift(movement);
    this.saveLocalMovements(movements);

    return { success: true, movement };
  }

  static async getStockMovements(productId?: string): Promise<StockMovement[]> {
    const products = await this.getProducts();
    const productMap = new Map(products.map(p => [p.id, p]));

    let movements: StockMovement[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("stock_movements").select("*").order("created_at", { ascending: false });
        if (productId) {
          query = query.eq("product_id", productId);
        }
        const { data, error } = await query;
        if (!error && data) {
          movements = data;
        }
      } catch (err) {
        console.warn("Supabase stock movements fetch error, fallback to local:", err);
      }
    }

    if (movements.length === 0) {
      movements = this.getLocalMovements();
      if (productId) {
        movements = movements.filter(m => m.product_id === productId);
      }
    }

    return movements.map(m => ({
      ...m,
      product: productMap.get(m.product_id),
    }));
  }

  // ==========================================
  // INVENTORY STATS & LOW STOCK ALERTS
  // ==========================================
  static async getStats(): Promise<InventoryStats> {
    const products = await this.getProducts();
    const categories = await this.getCategories();
    const movements = await this.getStockMovements();

    let totalStockUnits = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    for (const p of products) {
      const stock = Number(p.current_stock) || 0;
      const cost = Number(p.cost_price) || 0;
      const price = Number(p.selling_price) || 0;
      const threshold = Number(p.min_threshold) || 5;

      totalStockUnits += stock;
      totalCostValue += cost * stock;
      totalRetailValue += price * stock;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= threshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    }

    return {
      totalProducts: products.length,
      totalCategories: categories.length,
      totalStockUnits,
      totalCostValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalCostValue,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      recentMovementsCount: movements.length,
    };
  }

  static async getLowStockItems(): Promise<LowStockAlertItem[]> {
    const products = await this.getProducts();
    const lowStockItems: LowStockAlertItem[] = [];

    for (const p of products) {
      const stock = Number(p.current_stock) || 0;
      const threshold = Number(p.min_threshold) || 5;

      if (stock <= threshold) {
        lowStockItems.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category?.name || "Uncategorized",
          current_stock: stock,
          min_threshold: threshold,
          deficit: threshold - stock,
          cost_price: p.cost_price,
        });
      }
    }

    return lowStockItems.sort((a, b) => a.current_stock - b.current_stock);
  }

  // Reset to initial demo data
  static resetToDemoData() {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    }
  }
}


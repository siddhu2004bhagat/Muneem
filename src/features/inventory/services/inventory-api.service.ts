/**
 * Inventory API Service
 * Connects frontend with backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_ENDPOINT = `${API_BASE_URL}/api/v1/inventory`;

export interface InventoryItem {
  id: number;
  name: string;
  name_key: string;
  sku?: string;
  hsn_code?: string;
  gst_rate: number;
  opening_qty: number;
  unit: string;
  min_qty?: number;
  mrp?: number;
  sale_price?: number;
  purchase_price?: number;
  is_active: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: number;
  item_id: number;
  date: string;
  type: 'open' | 'purchase' | 'sale' | 'adjustment';
  qty: number;
  ref_ledger_id?: number;
  created_at: string;
  updated_at: string;
}

export interface InventorySummary {
  item_id: number;
  name: string;
  stock: number;
  value: number;
  gst_rate: number;
}

export interface InventoryResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<InventoryResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle structured error responses
      if (typeof data.detail === 'object') {
        return { error: data.detail.message || data.detail.error || 'Request failed' };
      }
      return { error: data.detail || 'Request failed' };
    }

    return { data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { error: 'Network error - please check your connection' };
  }
}

/**
 * Get paginated inventory items with search
 */
export async function getItems(
  skip: number = 0,
  limit: number = 50,
  search: string = ''
): Promise<InventoryResponse<InventoryItem[]>> {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });

  return apiRequest<InventoryItem[]>(`${API_ENDPOINT}/items?${params}`);
}

/**
 * Get single inventory item by ID
 */
export async function getItem(itemId: number): Promise<InventoryResponse<InventoryItem>> {
  return apiRequest<InventoryItem>(`${API_ENDPOINT}/items/${itemId}`);
}

/**
 * Create new inventory item
 */
export async function createItem(
  item: Omit<InventoryItem, 'id' | 'name_key' | 'created_at' | 'updated_at' | 'is_active'>
): Promise<InventoryResponse<InventoryItem>> {
  return apiRequest<InventoryItem>(`${API_ENDPOINT}/items`, {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

/**
 * Update inventory item
 */
export async function updateItem(
  itemId: number,
  item: Partial<InventoryItem>
): Promise<InventoryResponse<InventoryItem>> {
  return apiRequest<InventoryItem>(`${API_ENDPOINT}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  });
}

/**
 * Soft delete inventory item
 */
export async function deleteItem(itemId: number): Promise<InventoryResponse<void>> {
  return apiRequest<void>(`${API_ENDPOINT}/items/${itemId}`, {
    method: 'DELETE',
  });
}

/**
 * Create stock transaction
 */
export async function createStockTransaction(
  transaction: Omit<StockTransaction, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryResponse<StockTransaction>> {
  return apiRequest<StockTransaction>(`${API_ENDPOINT}/stock-transactions`, {
    method: 'POST',
    body: JSON.stringify(transaction),
  });
}

/**
 * Get inventory summary
 */
export async function getSummary(): Promise<InventoryResponse<InventorySummary[]>> {
  return apiRequest<InventorySummary[]>(`${API_ENDPOINT}/summary`);
}

/**
 * Get total stock value
 */
export async function getStockValue(): Promise<InventoryResponse<{
  total_items: number;
  total_value: number;
  currency: string;
}>> {
  return apiRequest(`${API_ENDPOINT}/stock-value`);
}


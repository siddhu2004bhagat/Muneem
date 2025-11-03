import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { createItem, createStockTransaction } from '../services/inventory-api.service';
import type { GSTRate } from '../types/inventory.types';
import { Package, CheckCircle } from 'lucide-react';

interface ItemFormProps {
  onSuccess?: () => void;
  initialData?: {
    name?: string;
    unit?: string;
    gstRate?: GSTRate;
    openingQty?: number;
    sku?: string;
    hsnCode?: string;
    mrp?: number;
    salePrice?: number;
    purchasePrice?: number;
    minQty?: number;
  };
}

const GST_RATES: GSTRate[] = [0, 5, 12, 18, 28];

export function ItemForm({ onSuccess, initialData }: ItemFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [unit, setUnit] = useState(initialData?.unit || 'pieces');
  const [gstRate, setGstRate] = useState<GSTRate>(initialData?.gstRate || 18);
  const [openingQty, setOpeningQty] = useState(initialData?.openingQty?.toString() || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [hsnCode, setHsnCode] = useState(initialData?.hsnCode || '');
  const [mrp, setMrp] = useState(initialData?.mrp?.toString() || '');
  const [salePrice, setSalePrice] = useState(initialData?.salePrice?.toString() || '');
  const [purchasePrice, setPurchasePrice] = useState(initialData?.purchasePrice?.toString() || '');
  const [minQty, setMinQty] = useState(initialData?.minQty?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; unit?: string; sku?: string }>({});

  // Validation helpers
  const isValid = name.trim() && unit.trim();
  const isLowStock = openingQty && minQty && parseFloat(openingQty) <= parseFloat(minQty) && parseFloat(openingQty) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate required fields
    if (!name.trim()) {
      setErrors({ name: 'Item name is required' });
      return;
    }
    
    if (!unit.trim()) {
      setErrors({ unit: 'Unit is required' });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create item using backend API
      const result = await createItem({
        name: name.trim(),
        unit,
        gst_rate: gstRate,
        opening_qty: parseFloat(openingQty) || 0,
        sku: sku.trim() || undefined,
        hsn_code: hsnCode.trim() || undefined,
        mrp: mrp ? parseFloat(mrp) : undefined,
        sale_price: salePrice ? parseFloat(salePrice) : undefined,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        min_qty: minQty ? parseFloat(minQty) : undefined
      });
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (!result.data) {
        toast.error('No data returned from server');
        return;
      }
      
      const itemId = result.data.id;
      
      // Add opening stock if provided
      const qty = parseFloat(openingQty);
      if (qty > 0) {
        const stockResult = await createStockTransaction({
          item_id: itemId,
          date: new Date().toISOString().split('T')[0],
          type: 'open',
          qty
        });
        
        if (stockResult.error) {
          console.warn('Failed to add opening stock:', stockResult.error);
        }
      }
      
      toast.success('Item added successfully!');
      
      // Reset form
      setName('');
      setUnit('pieces');
      setGstRate(18);
      setOpeningQty('');
      setSku('');
      setHsnCode('');
      setMrp('');
      setSalePrice('');
      setPurchasePrice('');
      setMinQty('');
      setErrors({});
      
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
      toast.error(errorMessage);
      console.error('Add item error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-medium gradient-card animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(145_70%_32%)] to-[hsl(145_75%_42%)] shadow-glow">
          <Package className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
          Add Item
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Enter item name"
              required
              className="touch-friendly"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => {
                setUnit(e.target.value);
                if (errors.unit) setErrors({ ...errors, unit: undefined });
              }}
              placeholder="pieces, kg, liters"
              required
              className="touch-friendly"
            />
            {errors.unit && <p className="text-sm text-red-500">{errors.unit}</p>}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gstRate">GST Rate (%) *</Label>
            <Select value={gstRate.toString()} onValueChange={(v) => setGstRate(parseInt(v) as GSTRate)}>
              <SelectTrigger className="touch-friendly">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GST_RATES.map(rate => (
                  <SelectItem key={rate} value={rate.toString()}>{rate}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="openingQty">Opening Quantity</Label>
            <Input
              id="openingQty"
              type="number"
              value={openingQty}
              onChange={(e) => setOpeningQty(e.target.value)}
              placeholder=""
              min="0"
              className="touch-friendly"
            />
            {isLowStock && (
              <p className="text-sm text-orange-500">⚠️ Opening quantity is at or below minimum quantity</p>
            )}
          </div>
        </div>
        
        {/* Optional Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Product code"
              className="touch-friendly"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hsnCode">HSN Code</Label>
            <Input
              id="hsnCode"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="HSN code"
              className="touch-friendly"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">💡 Optional: GST is calculated separately for compliance</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mrp">MRP (₹)</Label>
            <Input
              id="mrp"
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              placeholder=""
              min="0"
              step="0.01"
              className="touch-friendly"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salePrice">Sale Price (₹)</Label>
            <Input
              id="salePrice"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder=""
              min="0"
              step="0.01"
              className="touch-friendly"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price (₹)</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder=""
              min="0"
              step="0.01"
              className="touch-friendly"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="minQty">Minimum Quantity</Label>
          <Input
            id="minQty"
            type="number"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            placeholder=""
            min="0"
            className="touch-friendly"
          />
        </div>
        
        <Button
          type="submit"
          disabled={loading || !isValid}
          className="w-full gradient-hero touch-friendly hover-glow hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          {loading ? 'Adding...' : 'Add Item'}
        </Button>
      </form>
    </Card>
  );
}


import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemForm } from './components/ItemForm';
import { ItemList } from './components/ItemList';
import { SummaryTable } from './components/SummaryTable';
import type { Item } from './types/inventory.types';
import { Package, FileText, Plus, List } from 'lucide-react';

export function InventoryPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleItemAdded = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedItem(null);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-gradient-to-br from-[hsl(145_70%_32%)] to-[hsl(145_75%_42%)] shadow-glow">
          <Package className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(145_70%_32%)] to-[hsl(40_98%_48%)] bg-clip-text text-transparent">
            Inventory Management
          </h2>
          <p className="text-sm text-muted-foreground">Manage items, stock, and inventory</p>
        </div>
      </div>

      <Tabs defaultValue="add" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card shadow-medium">
          <TabsTrigger 
            value="add" 
            className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </TabsTrigger>
          <TabsTrigger 
            value="edit" 
            className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth"
          >
            <List className="w-4 h-4 mr-2" />
            Edit Item
          </TabsTrigger>
          <TabsTrigger 
            value="summary" 
            className="touch-friendly data-[state=active]:gradient-hero data-[state=active]:text-white transition-smooth"
          >
            <FileText className="w-4 h-4 mr-2" />
            Inventory Summary
          </TabsTrigger>
        </TabsList>
        
        {/* Optional Marketplace Button */}
        <div className="flex justify-center mt-4">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 touch-friendly text-lg font-semibold">
            Go Online Marketplace !!!
          </button>
        </div>

        <TabsContent value="add">
          <ItemForm 
            onSuccess={handleItemAdded}
            initialData={selectedItem ? {
              name: selectedItem.name,
              unit: selectedItem.unit,
              gstRate: selectedItem.gstRate,
              openingQty: selectedItem.openingQty,
              sku: selectedItem.sku,
              hsnCode: selectedItem.hsnCode,
              mrp: selectedItem.mrp,
              salePrice: selectedItem.salePrice,
              purchasePrice: selectedItem.purchasePrice,
              minQty: selectedItem.minQty
            } : undefined}
          />
        </TabsContent>

        <TabsContent value="edit">
          <ItemList 
            key={refreshKey}
            onEdit={handleEditItem}
          />
        </TabsContent>

        <TabsContent value="summary">
          <SummaryTable key={refreshKey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


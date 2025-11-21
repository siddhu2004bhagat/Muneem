import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, Building2, MapPin, Hash, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { getCompanySettings, saveCompanySettings, type CompanySettings } from '@/lib/db';

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Omit<CompanySettings, 'id' | 'updated_at'>>({
    businessName: '',
    address: '',
    gstin: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const existing = await getCompanySettings();
      if (existing) {
        setSettings({
          businessName: existing.businessName || '',
          address: existing.address || '',
          gstin: existing.gstin || '',
          phone: existing.phone || '',
          email: existing.email || '',
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!settings.businessName.trim()) {
      toast.error('Business name is required');
      return;
    }

    setSaving(true);
    try {
      await saveCompanySettings(settings);
      toast.success('Company settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save company settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Company Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your business details for invoices and receipts
        </p>
      </div>

      <Card className="p-6 bg-white border shadow-medium">
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName" className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-primary" />
              Business Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="businessName"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              placeholder="Your Business Name"
              className="touch-friendly"
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-primary" />
              Address
            </Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Business Address"
              className="touch-friendly"
            />
          </div>

          <div>
            <Label htmlFor="gstin" className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-primary" />
              GSTIN (Optional)
            </Label>
            <Input
              id="gstin"
              value={settings.gstin}
              onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
              placeholder="15-digit GSTIN (if registered)"
              className="touch-friendly"
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty if not GST registered
            </p>
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-primary" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit phone number"
              className="touch-friendly"
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-primary" />
              Email (Optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="business@example.com"
              className="touch-friendly"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !settings.businessName.trim()}
            className="w-full touch-friendly bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
}



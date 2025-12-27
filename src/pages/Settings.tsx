import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Building2, Upload, LogOut, Loader2 } from 'lucide-react';

export default function Settings() {
  const { businessProfile, updateBusinessProfile, loading } = useApp();
  const { signOut, user } = useAuth();
  const [formData, setFormData] = useState(businessProfile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(businessProfile);
  }, [businessProfile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateBusinessProfile(formData);
    setIsSaving(false);
    toast({
      title: 'Settings Saved',
      description: 'Your business profile has been updated.',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully.',
    });
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your business profile and account
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Account Section */}
        <div className="form-section">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Signed in account</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Business Profile Section */}
        <form onSubmit={handleSubmit} className="form-section">
          <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
          <div className="flex items-center gap-4 pb-6 border-b border-border">
            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} alt="Business logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload Logo
                </div>
              </Label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Business Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Business address"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@business.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN / Tax ID (Optional)</Label>
              <Input
                id="gstin"
                value={formData.gstin || ''}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                placeholder="Enter tax identification number"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

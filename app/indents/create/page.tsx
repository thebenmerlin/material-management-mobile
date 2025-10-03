'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Header } from '@/components/header';
import { MobileNav } from '@/components/mobile-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { materialsApi, indentsApi, sitesApi } from '@/lib/api';
import { debounce } from '@/lib/utils';
import { 
  Plus,
  X,
  Search,
  Package,
  ArrowLeft,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  specifications?: any;
}

interface IndentMaterial {
  id: string;
  materialId: string;
  material: Material;
  quantity: number;
  specifications?: any;
}

interface Site {
  id: string;
  name: string;
}

export default function CreateIndentPage() {
  const router = useRouter();
  const { user, hasRole } = useAuth();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [description, setDescription] = useState('');
  const [indentMaterials, setIndentMaterials] = useState<IndentMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not authorized
  useEffect(() => {
    if (user && !hasRole('Site Engineer')) {
      router.push('/indents');
    }
  }, [user, hasRole, router]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [materialsData, sitesData] = await Promise.all([
          materialsApi.getAllMaterials(),
          sitesApi.getAllSites()
        ]);

        setMaterials(materialsData);
        setSites(sitesData);

        // Set default site for site engineers
        if (hasRole('Site Engineer') && user?.siteId) {
          setSelectedSite(user.siteId);
        }
      } catch (error: any) {
        toast.error('Failed to load materials data');
        console.error('Load data error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, hasRole]);

  // Debounced search
  const debouncedSearch = debounce(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await materialsApi.searchMaterials(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  const addMaterial = (material: Material) => {
    // Check if already added
    if (indentMaterials.find(item => item.materialId === material.id)) {
      toast.error('Material already added');
      return;
    }

    const newItem: IndentMaterial = {
      id: Date.now().toString(),
      materialId: material.id,
      material,
      quantity: 1,
      specifications: {}
    };

    setIndentMaterials(prev => [...prev, newItem]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setIndentMaterials(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeMaterial = (itemId: string) => {
    setIndentMaterials(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmit = async () => {
    if (!selectedSite) {
      toast.error('Please select a site');
      return;
    }

    if (indentMaterials.length === 0) {
      toast.error('Please add at least one material');
      return;
    }

    try {
      setSubmitting(true);

      const indentData = {
        siteId: selectedSite,
        description,
        materials: indentMaterials.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
          specifications: item.specifications
        }))
      };

      await indentsApi.createIndent(indentData);
      toast.success('Indent created successfully!');
      router.push('/indents');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create indent');
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasRole('Site Engineer')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mobile-safe-area p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Create Indent</h1>
        </div>

        {/* Site Selection */}
        {!hasRole('Site Engineer') && (
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site">Select Site</Label>
                <Select value={selectedSite} onValueChange={setSelectedSite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map(site => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Indent Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this indent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Material Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Add Materials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search materials..."
                className="w-full"
              />

              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map(material => (
                    <button
                      key={material.id}
                      className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => addMaterial(material)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{material.name}</p>
                          <p className="text-sm text-gray-600">
                            {material.category} • Unit: {material.unit}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Materials */}
        {indentMaterials.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Selected Materials ({indentMaterials.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {indentMaterials.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border-b last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.material.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {item.material.category} • {item.material.unit}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                          min="1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeMaterial(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="pb-8">
          <Button
            onClick={handleSubmit}
            disabled={submitting || indentMaterials.length === 0 || !selectedSite}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Indent...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Create Indent</span>
              </div>
            )}
          </Button>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

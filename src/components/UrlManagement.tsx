import { useState } from 'react';
import { SavedUrl, UrlFormData } from '@/types/url';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, ExternalLink, CheckCircle, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UrlManagementProps {
  urls: SavedUrl[];
  onAddUrl: (urlData: UrlFormData) => void;
  onUpdateUrl: (id: string, urlData: UrlFormData) => void;
  onDeleteUrl: (id: string) => void;
  onSetActiveUrl: (id: string) => void;
}

export function UrlManagement({ 
  urls, 
  onAddUrl, 
  onUpdateUrl, 
  onDeleteUrl, 
  onSetActiveUrl 
}: UrlManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UrlFormData>({ url: '', title: '' });
  const { toast } = useToast();

  const normalizeUrl = (url: string): string => {
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url.trim() || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both URL and title",
        variant: "destructive"
      });
      return;
    }

    const normalizedFormData = {
      ...formData,
      url: normalizeUrl(formData.url)
    };

    if (editingId) {
      onUpdateUrl(editingId, normalizedFormData);
      setEditingId(null);
    } else {
      onAddUrl(normalizedFormData);
      setIsAdding(false);
    }
    
    setFormData({ url: '', title: '' });
    toast({
      title: "Success",
      description: editingId ? "URL updated successfully" : "URL added successfully",
      duration: 1000
    });
  };

  const handleEdit = (url: SavedUrl) => {
    setFormData({ url: url.url, title: url.title });
    setEditingId(url.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setFormData({ url: '', title: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onDeleteUrl(id);
    toast({
      title: "Success",
      description: "URL deleted successfully",
      duration: 1000
    });
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">URL Management</h1>
        <Button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2"
          disabled={isAdding || editingId !== null}
          data-add-url-trigger
        >
          <Plus className="h-4 w-4" />
          <span>Add URL</span>
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit URL' : 'Add New URL'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="example.com or https://example.com"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'Update' : 'Add'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {urls.length === 0 && !isAdding ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-muted-foreground">No URLs saved yet. Add your first URL!</p>
            </div>
          </div>
        ) : urls.length > 0 ? (
          urls.map((url) => (
            <Card key={url.id} className={`${url.isActive ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <button
                        onClick={() => onSetActiveUrl(url.id)}
                        className="flex items-center space-x-2 hover:text-primary"
                      >
                        {url.isActive ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        <h3 className="font-medium truncate">{url.title}</h3>
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{url.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Added: {new Date(url.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openUrl(url.url)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(url)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(url.id)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>
    </div>
  );
}
import { useState } from 'react';
import { SavedUrl, UrlFormData } from '@/types/url';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { UrlManagement } from '@/components/UrlManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Settings } from 'lucide-react';

export default function QRCodeApp() {
  const [urls, setUrls] = useLocalStorage<SavedUrl[]>('qr-app-urls', []);
  const [activeTab, setActiveTab] = useState('qr-code');

  const activeUrl = urls.find(url => url.isActive) || null;

  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const addUrl = (urlData: UrlFormData) => {
    const newUrl: SavedUrl = {
      id: generateId(),
      url: urlData.url,
      title: urlData.title,
      createdAt: new Date(),
      isActive: urls.length === 0 // First URL becomes active automatically
    };

    setUrls(prev => prev.concat(newUrl));
  };

  const updateUrl = (id: string, urlData: UrlFormData) => {
    setUrls(prev => prev.map(url => 
      url.id === id 
        ? { ...url, url: urlData.url, title: urlData.title }
        : url
    ));
  };

  const deleteUrl = (id: string) => {
    setUrls(prev => {
      const remaining = prev.filter(url => url.id !== id);
      const wasActive = prev.find(url => url.id === id)?.isActive;
      
      // If we deleted the active URL, make the first remaining URL active
      if (wasActive && remaining.length > 0) {
        remaining[0].isActive = true;
      }
      
      return remaining;
    });
  };

  const setActiveUrl = (id: string) => {
    setUrls(prev => prev.map(url => ({
      ...url,
      isActive: url.id === id
    })));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col min-h-screen">
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="qr-code" className="mt-0 h-full">
            <QRCodeGenerator activeUrl={activeUrl} />
          </TabsContent>

          <TabsContent value="management" className="mt-0 h-full">
            <UrlManagement
              urls={urls}
              onAddUrl={addUrl}
              onUpdateUrl={updateUrl}
              onDeleteUrl={deleteUrl}
              onSetActiveUrl={setActiveUrl}
            />
          </TabsContent>
        </div>

        <div className="sticky bottom-0 z-10 bg-background border-t">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="qr-code" className="flex items-center space-x-2">
              <QrCode className="h-4 w-4" />
              <span>QR Code</span>
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Manage URLs</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}
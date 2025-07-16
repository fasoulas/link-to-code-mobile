import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { SavedUrl } from '@/types/url';
import { Share, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  activeUrl: SavedUrl | null;
}

export function QRCodeGenerator({ activeUrl }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (activeUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, activeUrl.url, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
          toast({
            title: "Error",
            description: "Failed to generate QR code",
            variant: "destructive"
          });
        }
      });
    }
  }, [activeUrl, toast]);

  const copyToClipboard = async () => {
    if (activeUrl) {
      try {
        await navigator.clipboard.writeText(activeUrl.url);
        toast({
          title: "Copied!",
          description: "URL copied to clipboard"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy URL",
          variant: "destructive"
        });
      }
    }
  };

  const shareUrl = async () => {
    if (activeUrl && navigator.share) {
      try {
        await navigator.share({
          title: activeUrl.title,
          url: activeUrl.url
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-${activeUrl?.title || 'code'}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  if (!activeUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-semibold mb-2">No Active URL</h2>
          <p className="text-muted-foreground">
            Add a URL in the Management tab to generate a QR code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-qr-background p-4">
      <Card className="p-8 bg-qr-background border-border shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2 text-qr-foreground">{activeUrl.title}</h1>
          <p className="text-sm text-muted-foreground break-all">{activeUrl.url}</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-qr-background rounded-lg border">
            <canvas 
              ref={canvasRef}
              className="block"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={shareUrl}
            className="flex items-center space-x-2"
          >
            <Share className="h-4 w-4" />
            <span>Share</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQRCode}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card } from '@/components/ui/card';
import { SavedUrl } from '@/types/url';
import { Share, Copy, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  urls: SavedUrl[];
  activeUrl: SavedUrl | null;
  onAddUrl: () => void;
  onSetActiveUrl: (id: string) => void;
}

export function QRCodeGenerator({ urls, activeUrl, onAddUrl, onSetActiveUrl }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const currentIndex = activeUrl ? urls.findIndex(url => url.id === activeUrl.id) : -1;
  const hasMultipleUrls = urls.length >= 2;

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasMultipleUrls) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateNext();
    } else if (isRightSwipe) {
      navigatePrevious();
    }
  };

  const navigateNext = () => {
    if (!hasMultipleUrls || currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    onSetActiveUrl(urls[nextIndex].id);
  };

  const navigatePrevious = () => {
    if (!hasMultipleUrls || currentIndex === -1) return;
    const prevIndex = currentIndex === 0 ? urls.length - 1 : currentIndex - 1;
    onSetActiveUrl(urls[prevIndex].id);
  };

  const navigateToIndex = (index: number) => {
    if (index >= 0 && index < urls.length) {
      onSetActiveUrl(urls[index].id);
    }
  };

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

  // Carousel dot indicator component
  const CarouselDots = () => {
    if (!hasMultipleUrls) return null;

    return (
      <div className="flex justify-center space-x-2 mb-6">
        {urls.map((_, index) => (
          <button
            key={index}
            onClick={() => navigateToIndex(index)}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
            aria-label={`Go to QR code ${index + 1}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className="transition-all duration-200"
            >
              <defs>
                <linearGradient id={`dot-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currentIndex === index ? "#000000" : "#d1d5db"} />
                  <stop offset="100%" stopColor={currentIndex === index ? "#1a1a1a" : "#9ca3af"} />
                </linearGradient>
                <filter id={`dot-shadow-${index}`}>
                  <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.3"/>
                </filter>
              </defs>
              <circle
                cx="6"
                cy="6"
                r="4"
                fill={`url(#dot-gradient-${index})`}
                filter={`url(#dot-shadow-${index})`}
                className="transition-all duration-200"
              />
              <circle
                cx="6"
                cy="5"
                r="3"
                fill="rgba(255,255,255,0.3)"
                className="transition-all duration-200"
              />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      {!activeUrl ? (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Show Code</h1>
            <Button 
              onClick={onAddUrl}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Link</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h2 className="text-xl font-semibold mb-2">No Active Link</h2>
              <p className="text-muted-foreground">
                Add a link to generate a QR code
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center min-h-screen bg-qr-background px-4"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Card className="p-8 bg-qr-background border-border shadow-lg relative">
            {/* Navigation arrows - only show if multiple URLs */}
            {hasMultipleUrls && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigatePrevious}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 hover:bg-background"
                  aria-label="Previous QR code"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateNext}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 p-0 rounded-full bg-background/80 hover:bg-background"
                  aria-label="Next QR code"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-qr-foreground">{activeUrl.title}</h2>
              <p className="text-sm text-muted-foreground break-all">{activeUrl.url}</p>
              {hasMultipleUrls && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentIndex + 1} of {urls.length}
                </p>
              )}
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-qr-background rounded-lg border">
                <canvas 
                  ref={canvasRef}
                  className="block"
                />
              </div>
            </div>

            {/* Carousel dots */}
            <CarouselDots />

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
      )}
    </>
  );
}
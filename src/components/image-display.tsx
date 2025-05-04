
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageDisplayProps {
  imageUrl: string | null;
  altText?: string;
  className?: string;
  isLoading?: boolean;
  width?: number;
  height?: number;
  placeholderHint?: string;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  altText = 'Generated Image',
  className,
  isLoading = false,
  width = 512,
  height = 512,
  placeholderHint = 'abstract art'
}) => {
  const [internalImageUrl, setInternalImageUrl] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (imageUrl && imageUrl !== internalImageUrl) {
      // Only trigger animation if the URL changes and is not null
      setShowAnimation(true);
      setInternalImageUrl(imageUrl);
      // Reset animation state after it completes
      const timer = setTimeout(() => setShowAnimation(false), 500); // Match animation duration
      return () => clearTimeout(timer);
    } else if (!imageUrl) {
      // Reset if imageUrl becomes null
       setInternalImageUrl(null);
       setShowAnimation(false);
    }
  }, [imageUrl, internalImageUrl]);


  return (
    <Card className={cn("overflow-hidden border-2 border-border shadow-md", className)}>
      <CardContent className="p-0 relative" style={{ width, height }}>
        {isLoading ? (
          <Skeleton className="w-full h-full absolute inset-0" />
        ) : internalImageUrl ? (
          <Image
            src={internalImageUrl}
            alt={altText}
            width={width}
            height={height}
            className={cn(
                "object-cover w-full h-full transition-opacity duration-500 ease-in-out",
                showAnimation ? 'opacity-0' : 'opacity-100'
            )}
            onLoadingComplete={(img) => {
              // Ensure opacity is set to 1 after loading, overriding animation state if needed
              img.style.opacity = '1';
              setShowAnimation(false); // Ensure animation state is reset
            }}
            unoptimized // Use this if the src is a data URI or external and not optimizable by Next.js
          />
        ) : (
           <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
             <Image
              src={`https://picsum.photos/${width}/${height}`}
              alt="Placeholder image"
              width={width}
              height={height}
              className="object-cover w-full h-full opacity-30"
              data-ai-hint={placeholderHint}
            />
            <span className="absolute">Generated image will appear here</span>
           </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageDisplay;

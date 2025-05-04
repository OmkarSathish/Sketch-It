
'use client';

import React, { useState, useCallback, useTransition } from 'react';
import DrawingCanvas from '@/components/drawing-canvas';
import ImageDisplay from '@/components/image-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Eraser, Brush, Palette, Loader2, WandSparkles } from 'lucide-react';
import { sketchToImage, type SketchToImageInput } from '@/ai/flows/sketch-to-image';
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [brushColor, setBrushColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, startTransition] = useTransition();
  const [currentSketchDataUrl, setCurrentSketchDataUrl] = useState<string>('');
  const [clearCanvasTrigger, setClearCanvasTrigger] = useState(0); // State to trigger canvas clear
  const { toast } = useToast();

  const handleDrawEnd = useCallback((dataUrl: string) => {
    setCurrentSketchDataUrl(dataUrl);
  }, []);

   const handleClearCanvas = () => {
    setClearCanvasTrigger(prev => prev + 1); // Increment to trigger useEffect in DrawingCanvas
    setGeneratedImageUrl(null); // Optionally clear the generated image too
   };


  const handleGenerateImage = async () => {
    if (!currentSketchDataUrl) {
        toast({
          title: "No Sketch Found",
          description: "Please draw something on the canvas first.",
          variant: "destructive",
        });
      return;
    }
     if (!prompt.trim()) {
        toast({
          title: "Prompt Required",
          description: "Please enter a text prompt to guide the image generation.",
          variant: "destructive",
        });
      return;
    }


    startTransition(async () => {
      try {
        const input: SketchToImageInput = {
          sketchDataUri: currentSketchDataUrl,
          prompt: prompt,
        };
        const output = await sketchToImage(input);
        setGeneratedImageUrl(output.generatedImageDataUri);
         toast({
            title: "Image Generated!",
            description: "Your sketch has been transformed.",
          });
      } catch (error) {
        console.error('Error generating image:', error);
        toast({
          title: "Generation Failed",
          description: "Could not generate image. Please try again.",
          variant: "destructive",
        });
        setGeneratedImageUrl(null); // Clear image on error
      }
    });
  };

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-8 flex flex-col items-center">
       <header className="w-full max-w-6xl mb-6 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">SketchAI</h1>
        <p className="text-muted-foreground">Transform your rough sketches into refined images with AI.</p>
      </header>

      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* Left Side: Canvas and Controls */}
        <Card className="flex-1 md:w-1/2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brush className="text-primary" /> Draw Your Sketch</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <DrawingCanvas
              onDrawEnd={handleDrawEnd}
              brushColor={brushColor}
              brushSize={brushSize}
              clearTrigger={clearCanvasTrigger}
              className="border-2 border-dashed border-accent rounded-lg"
            />
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
               <div className="space-y-2">
                 <Label htmlFor="brush-color" className="flex items-center gap-1"><Palette size={16}/> Brush Color</Label>
                 <Input
                    id="brush-color"
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-full h-10 p-1"
                 />
               </div>
               <div className="space-y-2">
                  <Label htmlFor="brush-size" className="flex items-center gap-1"><Brush size={16}/> Brush Size: {brushSize}</Label>
                  <Slider
                    id="brush-size"
                    min={1}
                    max={50}
                    step={1}
                    value={[brushSize]}
                    onValueChange={(value) => setBrushSize(value[0])}
                    className="w-full"
                  />
               </div>
            </div>
             <Button onClick={handleClearCanvas} variant="outline" className="w-full mt-4">
               <Eraser className="mr-2" size={16} />
               Clear Canvas
             </Button>
          </CardContent>
        </Card>

        {/* Right Side: Prompt and Generated Image */}
        <Card className="flex-1 md:w-1/2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><WandSparkles className="text-primary"/> Generate Image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="prompt">Describe the image you want to generate:</Label>
              <Input
                id="prompt"
                type="text"
                placeholder="e.g., A futuristic cityscape at sunset, vibrant colors"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full"
                disabled={isGenerating}
              />
            </div>
             <Button
               onClick={handleGenerateImage}
               disabled={isGenerating || !currentSketchDataUrl || !prompt}
               className="w-full mt-4"
             >
               {isGenerating ? (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               ) : (
                 <WandSparkles className="mr-2" size={16}/>
               )}
               Generate Image
             </Button>

            <ImageDisplay
              imageUrl={generatedImageUrl}
              isLoading={isGenerating}
              altText={`Generated image based on prompt: ${prompt}`}
              className="mt-4"
              placeholderHint="digital painting sketch"
             />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

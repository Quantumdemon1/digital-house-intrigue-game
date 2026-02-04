
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, Sparkles, X, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AvatarImageOptionsProps {
  onImageGenerated: (imageUrl: string) => void;
  onImageUploaded: (imageUrl: string) => void;
  currentAvatarUrl?: string;
  playerName?: string;
  className?: string;
}

export const AvatarImageOptions: React.FC<AvatarImageOptionsProps> = ({
  onImageGenerated,
  onImageUploaded,
  currentAvatarUrl,
  playerName,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImageUploaded(result);
      };
      reader.readAsDataURL(file);
    }
    // Reset input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateAvatar = async () => {
    if (!generationPrompt.trim()) {
      setGenerationError('Please describe your character appearance');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      // Build a detailed prompt for realistic character portrait
      const fullPrompt = `Professional headshot portrait of ${generationPrompt}. 
        Reality TV show contestant, high quality studio lighting, neutral background.
        Confident, friendly expression. Shoulders and face visible.
        Photorealistic style, high resolution. Ultra high resolution.`;

      // Call the AI image generation API
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_LOVABLE_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image',
          messages: [
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        onImageGenerated(imageUrl);
        setIsGenerateDialogOpen(false);
        setGenerationPrompt('');
      } else {
        throw new Error('No image returned from API');
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
      setGenerationError('Failed to generate image. Please try again or upload your own.');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasCustomAvatar = currentAvatarUrl && !currentAvatarUrl.includes('placeholder');

  return (
    <>
      <div className={cn('flex gap-2 mt-4', className)}>
        {/* Upload Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Generate Button */}
        <Button
          type="button"
          variant="gradient"
          size="sm"
          onClick={() => setIsGenerateDialogOpen(true)}
          className="flex-1 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </Button>
      </div>

      {/* Generation Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Your Avatar
            </DialogTitle>
            <DialogDescription>
              Describe what your character looks like and we'll generate a unique portrait for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appearance">Describe your appearance</Label>
              <Input
                id="appearance"
                placeholder="e.g., a 28 year old woman with curly red hair and green eyes"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                className="bg-background/50"
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground">
                Be specific about age, gender, hair, eyes, and any distinctive features.
              </p>
            </div>

            {/* Quick suggestions */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick suggestions:</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  'young man with short dark hair',
                  'woman in her 30s with blonde hair',
                  'athletic man with beard',
                  'confident woman with glasses',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setGenerationPrompt(suggestion)}
                    className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    disabled={isGenerating}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {generationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
                >
                  {generationError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsGenerateDialogOpen(false)}
                disabled={isGenerating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="dramatic"
                onClick={handleGenerateAvatar}
                disabled={isGenerating || !generationPrompt.trim()}
                className="flex-1 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AvatarImageOptions;

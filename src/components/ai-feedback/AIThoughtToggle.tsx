
import React from 'react';
import { useAIThoughtsContext } from './AIThoughtsProvider';
import { Brain, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AIThoughtToggleProps {
  className?: string;
  variant?: 'default' | 'small';
}

const AIThoughtToggle: React.FC<AIThoughtToggleProps> = ({ 
  className,
  variant = 'default'
}) => {
  const { isVisible, toggleVisibility, thoughts } = useAIThoughtsContext();
  const hasThoughts = Object.keys(thoughts).length > 0;
  
  // Don't render if there are no thoughts
  if (!hasThoughts) return null;

  if (variant === 'small') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={className}
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <Brain className="h-4 w-4 text-blue-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isVisible ? 'Hide AI thoughts' : 'Show AI thoughts'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={toggleVisibility}
    >
      {isVisible ? (
        <>
          <Brain className="h-4 w-4 mr-2 text-blue-600" />
          Hide AI thoughts
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4 mr-2" />
          Show AI thoughts
        </>
      )}
    </Button>
  );
};

// Default export
export default AIThoughtToggle;

// Named export
export { AIThoughtToggle };

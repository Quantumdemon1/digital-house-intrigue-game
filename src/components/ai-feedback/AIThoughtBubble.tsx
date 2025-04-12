
import React from 'react';
import { Brain, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIThoughtBubbleProps {
  thought: string;
  isVisible: boolean;
  character?: string;
  className?: string;
}

const AIThoughtBubble: React.FC<AIThoughtBubbleProps> = ({
  thought,
  isVisible,
  character,
  className
}) => {
  if (!isVisible) return null;
  
  return (
    <div 
      className={cn(
        "relative bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 max-w-xs",
        "animate-fade-in shadow-sm",
        className
      )}
    >
      {/* Triangle pointer */}
      <div className="absolute bottom-0 left-6 transform translate-y-full">
        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-200 dark:border-t-blue-800" />
        <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-blue-50 dark:border-t-blue-900/20 relative -top-[8.5px] left-[0.5px]" />
      </div>
      
      <div className="flex items-start gap-2">
        <Brain size={16} className="text-blue-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm italic text-gray-700 dark:text-gray-300">
            {thought}
          </p>
          {character && (
            <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1 flex items-center">
              <MessageSquare size={10} className="mr-1" />
              {character}'s thoughts
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIThoughtBubble;

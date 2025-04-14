
import React from 'react';
import { Brain, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIThoughtBubbleProps {
  thought: string;
  isVisible: boolean;
  character?: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  type?: 'thought' | 'decision' | 'strategy';
}

const AIThoughtBubble: React.FC<AIThoughtBubbleProps> = ({
  thought,
  isVisible,
  character,
  className,
  position = 'bottom',
  type = 'thought'
}) => {
  if (!isVisible) return null;
  
  // Determine the icon based on type
  const getIcon = () => {
    switch (type) {
      case 'decision':
        return <MessageSquare size={16} className="text-orange-600 mt-1 flex-shrink-0" />;
      case 'strategy':
        return <Brain size={16} className="text-purple-600 mt-1 flex-shrink-0" />;
      case 'thought':
      default:
        return <Brain size={16} className="text-blue-600 mt-1 flex-shrink-0" />;
    }
  };
  
  // Determine background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'decision':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'strategy':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'thought':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };
  
  // Determine pointer position
  const getPointerPosition = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-full';
      case 'left':
        return 'left-0 top-1/2 -translate-x-full -translate-y-1/2';
      case 'right':
        return 'right-0 top-1/2 translate-x-full -translate-y-1/2';
      case 'bottom':
      default:
        return 'bottom-0 left-6 translate-y-full';
    }
  };
  
  // Determine pointer triangle style
  const getPointerStyle = () => {
    const color = type === 'decision' 
      ? 'border-orange-200 dark:border-orange-800' 
      : type === 'strategy'
        ? 'border-purple-200 dark:border-purple-800'
        : 'border-blue-200 dark:border-blue-800';
        
    const bgColor = type === 'decision'
      ? 'border-orange-50 dark:border-orange-900/20'
      : type === 'strategy'
        ? 'border-purple-50 dark:border-purple-900/20'
        : 'border-blue-50 dark:border-blue-900/20';
    
    switch (position) {
      case 'top':
        return (
          <>
            <div className={`w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent ${color.replace('border-', 'border-b-')}`} />
            <div className={`w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent ${bgColor.replace('border-', 'border-b-')} relative top-[0.5px] left-[0.5px]`} />
          </>
        );
      case 'left':
        return (
          <>
            <div className={`w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent ${color.replace('border-', 'border-r-')}`} />
            <div className={`w-0 h-0 border-t-6 border-b-6 border-r-6 border-transparent ${bgColor.replace('border-', 'border-r-')} relative left-[0.5px] top-[0.5px]`} />
          </>
        );
      case 'right':
        return (
          <>
            <div className={`w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent ${color.replace('border-', 'border-l-')}`} />
            <div className={`w-0 h-0 border-t-6 border-b-6 border-l-6 border-transparent ${bgColor.replace('border-', 'border-l-')} relative -left-[0.5px] top-[0.5px]`} />
          </>
        );
      case 'bottom':
      default:
        return (
          <>
            <div className={`w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent ${color.replace('border-', 'border-t-')}`} />
            <div className={`w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent ${bgColor.replace('border-', 'border-t-')} relative -top-[8.5px] left-[0.5px]`} />
          </>
        );
    }
  };
  
  return (
    <div 
      className={cn(
        `relative p-3 rounded-lg border shadow-sm max-w-xs animate-fade-in`,
        getBgColor(),
        className
      )}
    >
      {/* Triangle pointer */}
      <div className={`absolute ${getPointerPosition()}`}>
        {getPointerStyle()}
      </div>
      
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm italic text-gray-700 dark:text-gray-300">
            {thought}
          </p>
          {character && (
            <div className="text-xs font-medium mt-1 flex items-center">
              <MessageSquare size={10} className="mr-1" />
              <span className={type === 'decision' 
                ? 'text-orange-700 dark:text-orange-400'
                : type === 'strategy'
                  ? 'text-purple-700 dark:text-purple-400'
                  : 'text-blue-700 dark:text-blue-400'
              }>
                {character}'s {type}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIThoughtBubble;

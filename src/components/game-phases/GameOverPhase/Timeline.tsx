
import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export const Timeline = ({ children, className }: TimelineProps) => {
  return (
    <div className={cn("relative ml-3", className)}>
      {children}
    </div>
  );
};

interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineItem = ({ children, className }: TimelineItemProps) => {
  return (
    <div className={cn("relative pb-8", className)}>
      {children}
    </div>
  );
};

interface TimelineConnectorProps {
  className?: string;
}

export const TimelineConnector = ({ className }: TimelineConnectorProps) => {
  return (
    <div 
      className={cn(
        "absolute h-full w-0.5 bg-border left-3.5 transform -translate-x-1/2 top-6",
        className
      )}
    />
  );
};

interface TimelineHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineHeader = ({ children, className }: TimelineHeaderProps) => {
  return (
    <div className={cn("flex items-center gap-3 mb-2", className)}>
      {children}
    </div>
  );
};

interface TimelineIconProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineIcon = ({ children, className }: TimelineIconProps) => {
  return (
    <div 
      className={cn(
        "relative z-10 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600",
        className
      )}
    >
      {children}
    </div>
  );
};

interface TimelineBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineBody = ({ children, className }: TimelineBodyProps) => {
  return (
    <div className={cn("ml-9", className)}>
      {children}
    </div>
  );
};


import { ReactNode } from 'react';

export interface InteractionOption {
  id: string;
  text: string;
  responseText: string;
  relationshipChange: number;
  icon: ReactNode;
  requiredSocialStat?: number; // Minimum social stat required for successful outcome
}

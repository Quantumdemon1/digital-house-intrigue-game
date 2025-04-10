
// Re-export the toast components from the original source
import { useToast as useToastOriginal, toast as toastOriginal } from "@/hooks/use-toast";

// Export with the same names for consistency
export const useToast = useToastOriginal;
export const toast = toastOriginal;

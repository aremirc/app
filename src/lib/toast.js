import { toast } from "sonner";

export const handleToast = (message, type = "success", description = "", className = "", icon = "") => {
  toast[type](message, {
    className: `dark:border-none dark:bg-background-dark dark:text-${type === 'success' ? 'success-dark' : 'danger-dark'} ${className}`,
    description: description,
    icon: icon,  // Permite agregar un icono
  });
};

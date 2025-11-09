import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";

interface AdviceDialog {
  name?: string;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function AdviceDialog({ name, isDialogOpen, setIsDialogOpen }: AdviceDialog) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[var(--dialog-background)] text-[var(--dialog-foreground)] rounded-md w-[90vw] max-w-md">
            <DialogTitle>
                Advertencia
            </DialogTitle>
            <DialogDescription>
                La ventana <strong>{name}</strong> es unicamente una demostracion de como va a quedar. Esto unicamente durante el proceso de desarrollo
            </DialogDescription>
        </DialogContent>
      </Dialog>
  );
}
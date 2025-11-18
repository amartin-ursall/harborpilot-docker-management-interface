import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useStore } from '@/hooks/useStore';
import { AlertTriangle } from 'lucide-react';
export function ConfirmationDialog() {
  const dialog = useStore((s) => s.dialog);
  const hideDialog = useStore((s) => s.hideDialog);
  const handleConfirm = () => {
    dialog.onConfirm();
    hideDialog();
  };
  return (
    <AlertDialog open={dialog.isOpen} onOpenChange={(open) => !open && hideDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {dialog.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {dialog.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
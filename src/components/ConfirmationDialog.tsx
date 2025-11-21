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
  const setDialogProcessing = useStore((s) => s.setDialogProcessing);
  const handleConfirm = async () => {
    try {
      setDialogProcessing(true);
      await Promise.resolve(dialog.onConfirm());
      hideDialog();
    } catch (error) {
      console.error(error);
      setDialogProcessing(false);
    }
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
          {dialog.summary && (
            <div className="pt-4">
              <div className="bg-muted/50 p-3 rounded-lg border text-muted-foreground">
                {dialog.summary}
              </div>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90"
            disabled={dialog.isProcessing}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

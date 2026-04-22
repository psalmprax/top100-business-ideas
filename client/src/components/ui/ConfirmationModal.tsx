import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationModalProps) {
  const isDanger = variant === "danger";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-white shadow-2xl">
        <DialogHeader className="space-y-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isDanger ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
          }`}>
            {isDanger ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-xl font-bold tracking-tight uppercase">
              {title}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6 flex sm:justify-between gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 font-bold text-xs uppercase tracking-widest"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              // We don't automatically close here to allow for loading states if handled by parent
            }}
            className={`${
              isDanger 
                ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20" 
                : "bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-900/20"
            } text-white font-bold text-xs uppercase tracking-widest h-10 px-6`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Executing...
              </span>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

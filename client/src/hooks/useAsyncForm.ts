import { useState, type FormEvent } from "react";
import { toast } from "sonner";

interface UseAsyncFormOptions<T> {
  onSubmit: (data: T) => Promise<void>;
  validate?: (data: T) => string | null;
  onSuccess?: () => void;
}

export function useAsyncForm<T>({
  onSubmit,
  validate,
  onSuccess,
}: UseAsyncFormOptions<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent, data: T) => {
    e.preventDefault();
    if (validate) {
      const error = validate(data);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      toast.success("Operation completed successfully");
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Operation failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}

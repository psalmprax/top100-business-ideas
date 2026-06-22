/**
 * PremiumPlaceholder — stub placeholder
 * Original component was removed during dead-code cleanup.
 */
export function PremiumPlaceholder({
  title,
  description,
  variant,
}: {
  title: string;
  description?: string;
  variant?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="text-4xl opacity-20">
        {variant === "empty" ? "📋" : "✨"}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
    </div>
  );
}

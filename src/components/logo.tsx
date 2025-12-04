import { Leaf } from 'lucide-react';

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Leaf className="h-5 w-5" />
      </div>
      {showText && (
        <span className="font-bold text-lg text-primary">SDG TRACKER</span>
      )}
    </div>
  );
}

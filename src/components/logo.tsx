import Image from 'next/image';

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/logo.png"
        alt="SDG Tracker Logo"
        width={40}
        height={40}
        className="rounded-lg"
      />
      {showText && (
        <span className="font-bold text-2xl text-primary">SDG TRACKER</span>
      )}
    </div>
  );
}

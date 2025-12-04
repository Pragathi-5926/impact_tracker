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
        src="https://raw.githubusercontent.com/Pragathi-5926/IDL/6d2c826624b4dc6db67a01c3dfd948723113225f/idl.jpeg"
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

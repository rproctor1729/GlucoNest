import Image from 'next/image';

export default function BrandMark({ className = 'h-9 w-9' }: { className?: string }) {
  return <Image src="/icon.svg" width={40} height={40} alt="" aria-hidden="true" className={className} unoptimized />;
}

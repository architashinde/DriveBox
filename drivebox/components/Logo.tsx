import Image from 'next/image';

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <span className="text-2xl"><Image src="/logoo.png" width={40} height={40} alt="DriveBox logo"></Image></span>
      </div>
      <span className="text-2xl font-bold">DriveBox</span>
    </div>
  );
};
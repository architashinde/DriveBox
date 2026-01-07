import { Box, Lock } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

export function Logo({
  className = "",
  variant = "default",
}: LogoProps) {
  const textColor =
    variant === "light" ? "text-white" : "text-blue-900";
  const iconBg =
    variant === "light" ? "bg-white/20" : "bg-blue-900";
  const iconColor =
    variant === "light" ? "text-white" : "text-white";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center relative overflow-hidden`}
        >
          <Box className={`size-5 ${iconColor}`} />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-5 h-5 ${variant === "light" ? "bg-orange-400" : "bg-orange-500"} rounded-full flex items-center justify-center shadow-lg`}
        >
          <Lock className="size-3 text-white" />
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-xl ${textColor}`}>
          Secure<span className="font-semibold">Storage</span>
        </span>
      </div>
    </div>
  );
}
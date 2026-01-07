import { Box, Lock } from "lucide-react";

export default function FaviconPreview() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-64 h-64 bg-blue-900 rounded-2xl flex items-center justify-center">
        <Box className="w-32 h-32 text-white" />
        <div className="absolute bottom-4 right-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTheme } from "./ThemeToggle";

function RotatingBanner({ banner }) {
  const [index, setIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banner.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banner.length]);

  const currentBanner = banner[index];

  return (
    <div
      className={`font-medium rounded-xl p-3 flex items-center justify-center shadow-xl backdrop-blur-sm overflow-hidden
    ${
      theme === "dark" ? "bg-gray-950 text-gray-50" : "bg-gray-50 text-gray-950"
    }`}
    >
      <p className="text-center text-lg transition-opacity duration-500">
        {currentBanner.message}
      </p>
    </div>
  );
}

export default RotatingBanner;

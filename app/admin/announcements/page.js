"use client";

import AnnouncementForm from "@/adminComponents/AnnouncementForm";
import { useTheme } from "@/components/ThemeToggle";

export default function AnnouncementsPage() {
  const { theme } = useTheme();
  return (
    <div
      className={`flex flex-col items-center justify-center font-serif p-6 h-screen
    ${theme === "light" ? "bg-white" : "bg-gray-950"}`}
    >
      <AnnouncementForm />
    </div>
  );
}

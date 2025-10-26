"use client";

import { Bell } from "lucide-react";

export default function NotificationBell({ hasNewTicketProp, onClickProp }) {
  return (
    <div>
      {" "}
      <button onClick={onClickProp}>
        <Bell className="w-7 h-7 text-gray-700" />
      </button>
      {hasNewTicketProp && (
        <span className="absolute top-0 right-0 inline-block w-3 h-3 bg-red-600 rounded-full"></span>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function AdminQuickNotes() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  // Load saved note on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin_quick_note");
    if (saved) setNote(saved);
  }, []);

  // Auto-save when changed
  useEffect(() => {
    localStorage.setItem("admin_quick_note", note);
  }, [note]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <div className="bg-[#FFE3C2] border-2 border-black shadow-[0_4px_0_#000] rounded-2xl p-3 w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">Quick Notes</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-xs px-2 py-1 bg-white border-2 border-black rounded shadow-[0_2px_0_#000]"
            >
              ✕
            </button>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-32 text-sm border-2 border-black rounded p-2 bg-white resize-none focus:outline-none"
            placeholder="Write reminders..."
          />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#FFB25B] border-2 border-black rounded-full shadow-[0_3px_0_#000] px-3 py-2 text-sm font-semibold hover:-translate-y-[1px] transition-all"
        >
          📝 Notes
        </button>
      )}
    </div>
  );
}

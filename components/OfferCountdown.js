import { useEffect, useState } from "react";

export default function OfferCountdown({ expiryDate }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date();
      const endDate = new Date(expiryDate);
      const diff = endDate - currentDate;

      if (diff <= 0) {
        setTimeLeft("Offer Expired ❌");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryDate]);

  return (
    <div className="text-sm text-orange-600 font-semibold mt-2">
      {timeLeft && (
        <>
          ⏳ Offer ends in <span className="text-gray-900">{timeLeft}</span>
        </>
      )}
    </div>
  );
}

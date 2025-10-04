"use client";

import { useUserAuth } from "@/app/auth/_util/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({ children, requiredRole }) {
  const { user, role, loading } = useUserAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || role !== requiredRole) {
      router.push("/auth/login");
    }
  }, [user, role, loading]);

  if (loading) {
    return (
      <p className="text-4xl font-bold mt-30 text-orange-500 font-serif flex justify-center">
        Loading...
      </p>
    );
  }
  return <div>{children}</div>;
}

  "use client";

import Image from "next/image";
import { Suspense } from "react";

function SalamaClient() {
  const { useRouter, useSearchParams } = require("next/navigation");
  const { useEffect } = require("react");
  const { notFound } = require("next/navigation");

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      notFound();
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-slate-800 rounded-xl shadow-md p-6 w-[320px] text-center">
        {/* SALAMA LOGO */}
        <div className="flex justify-center mb-4">
          <Image
            src="/Salama-logo.jpg"
            alt="Salama Insurance Logo"
            width={120}
            height={40}
            unoptimized
          />
        </div>

        <h1 className="text-sm text-slate-300 text-center mt-1">
          Salama Insurance Flow Started
        </h1>
      </div>
    </div>
  );
}

export default function SalamaPage() {
  return (
    <Suspense fallback={null}>
      <SalamaClient />
    </Suspense>
  );
}

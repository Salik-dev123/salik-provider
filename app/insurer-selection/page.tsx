"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

const IS_MOCK = false;

/* ===================== TYPES ===================== */

interface WorkflowResponse {
  current?: {
    stepKey?: string;
    status?: string;
  };
  existingInsurerDetails?: {
    link?: string;
  };
}

export default function InsurerSelectionPage() {
  const { token } = useParams<{ token?: string }>();
  const [loading, setLoading] = useState(true);
  const [workflowStep, setWorkflowStep] = useState<string | null>(null);

  const enableLiva = process.env.NEXT_PUBLIC_ENABLE_LIVA === "true";
  const enableSalama = process.env.NEXT_PUBLIC_ENABLE_SALAMA === "true";

  const livaRedirectUrl =
    process.env.NEXT_PUBLIC_LIVA_REDIRECT_URL ||
    "https://salik-testing.aurainsure.tech/h8lepHc";

  const salamaRedirectUrl =
    process.env.NEXT_PUBLIC_SALAMA_REDIRECT_URL || "";

  /* ===================== MOCK ===================== */

  const mockGetCurrentWorkflow = async (): Promise<WorkflowResponse> => {
    await new Promise((res) => setTimeout(res, 300));
    return {
      current: {
        stepKey: "select_insurer",
        status: "success",
      },
    };
  };

  const mockSelectInsurer = async (insurerKey: string) => {
    await new Promise((res) => setTimeout(res, 300));
    return {
      redirectUrl:
        insurerKey === "liva" ? livaRedirectUrl : salamaRedirectUrl,
    };
  };

  /* ===================== API ===================== */

  const getCurrentWorkflow = async (): Promise<WorkflowResponse> => {
    if (IS_MOCK) return mockGetCurrentWorkflow();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer-insurer/current-workflow`,
      { method: "GET", credentials: "include" },
    );

    if (!res.ok) throw new Error("Workflow fetch failed");
    return res.json();
  };

  const selectInsurer = async (insurerKey: string) => {
    if (IS_MOCK) return mockSelectInsurer(insurerKey);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer-insurer/select`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insurerKey }),
      },
    );

    if (!res.ok) throw new Error("Insurer selection failed");
    return res.json();
  };

  /* ===================== INIT ===================== */

  useEffect(() => {
    const init = async () => {
      try {
        const workflow = await getCurrentWorkflow();
        const step = workflow?.current?.stepKey ?? null;

        setWorkflowStep(step);
        setLoading(false);

        if (step === "redirect_liva") {
          if (!enableLiva) throw new Error("Liva disabled");
          window.location.href = livaRedirectUrl;
          return;
        }

        if (step === "redirect_salama") {
          if (!enableSalama) throw new Error("Salama disabled");
          if (!salamaRedirectUrl)
            throw new Error("Salama redirect URL missing");
          window.location.href = salamaRedirectUrl;
          return;
        }

        if (step !== "select_insurer") {
          notFound();
        }
      } catch (err) {
        console.error(err);
        notFound();
      }
    };

    init();
  }, [
    enableLiva,
    enableSalama,
    livaRedirectUrl,
    salamaRedirectUrl,
  ]);

  /* ===================== HANDLER ===================== */

  const handleInsurerClick = async (insurerKey: string) => {
    try {
      if (workflowStep !== "select_insurer") return;

      await selectInsurer(insurerKey);

      if (insurerKey === "liva") {
        window.location.href = livaRedirectUrl;
        return;
      }

      if (insurerKey === "salama") {
        if (!salamaRedirectUrl)
          throw new Error("Salama redirect URL missing");
        window.location.href = salamaRedirectUrl;
        return;
      }
    } catch (err) {
      console.error("Insurer selection error:", err);
      alert("Something went wrong");
    }
  };

  /* ===================== RENDER ===================== */

  if (loading) return null;
  if (workflowStep !== "select_insurer") return null;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <section className="w-full bg-[#040612] flex justify-center">
        <Image
          src="/car-insurance-hero (1).jpg"
          alt="Insurance Protection"
          width={600}
          height={600}
          priority
          className="w-200 h-auto"
        />
      </section>

      <main className="flex-1 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold mb-4">Welcome!</h1>

          <p className="text-lg text-gray-500 mb-10">
            Choose from any of our insurance partners
          </p>

          <div className="space-y-6">
            <button
              onClick={() => handleInsurerClick("liva")}
              className="w-full border rounded-2xl p-4 flex justify-between items-center hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <Image
                  src="/liva-logo.svg"
                  alt="Liva"
                  width={100}
                  height={40}
                />
                <span className="text-xl">Liva Insurance</span>
              </div>
              <ChevronRight className="w-7 h-7 text-gray-400" />
            </button>

            <button
              onClick={() => handleInsurerClick("salama")}
              className="w-full border rounded-2xl p-6 flex justify-between items-center hover:shadow-lg"
            >
              <div className="flex items-center gap-6">
                <Image
                  src="/Salama-logo.jpg"
                  alt="Salama"
                  width={80}
                  height={40}
                />
                <span className="text-xl">Salama Insurance</span>
              </div>
              <ChevronRight className="w-7 h-7 text-gray-400" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

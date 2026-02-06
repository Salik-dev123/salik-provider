"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

const IS_MOCK = true;

/* ===================== TYPES ===================== */

interface WorkflowResponse {
  current?: {
    stepKey?: string;
    status?: string;
  };
  next?: {
    stepKey?: string;
  };
  existingInsurerDetails?: {
    link?: string;
  };
}

/* ===================== MOCK APIs ===================== */

const mockAuthenticate = async (token: string) => {
  console.log("✅ MOCK AUTH called with token:", token);
  await new Promise((res) => setTimeout(res, 300));
  return { success: true };
};

const mockGetCurrentWorkflow = async (): Promise<WorkflowResponse> => {
  await new Promise((res) => setTimeout(res, 300));
  return {
    current: {
      stepKey: "select_insurer",
      status: "success",
    },
  };
};

/* ===================== REAL API ===================== */

const getCurrentWorkflow = async (): Promise<WorkflowResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer-insurer/current-workflow`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("Workflow fetch failed");
  }

  return res.json();
};

const updateWorkflowToSelectInsurer = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer-insurer/update-workflow`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flowKey: "customer_routing",
        stepKey: "select_insurer",
        status: "success",
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update workflow to select_insurer");
  }
};

export default function StartPage() {
  const router = useRouter();
  const { token } = useParams<{ token?: string }>();

  useEffect(() => {
    if (!token) return;

    const authenticateAndRoute = async () => {
      try {
        let workflow: WorkflowResponse;

        /* ================= AUTH ================= */

        if (IS_MOCK) {
          await mockAuthenticate(token);
          workflow = await mockGetCurrentWorkflow();
        } else {
          const authRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer-insurer/login/${token}`,
            {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            }
          );

          if (!authRes.ok) throw new Error("Auth failed");

          workflow = await getCurrentWorkflow();
        }

        const { current, existingInsurerDetails } = workflow;

        /* ================= ROUTING ================= */

        // 1️⃣ Insurer already selected → redirect immediately
        if (existingInsurerDetails?.link) {
          window.location.href = existingInsurerDetails.link;
          return;
        }

        // 2️⃣ Ensure backend is READY for insurer selection
        if (
          current?.stepKey !== "select_insurer" ||
          current?.status !== "success"
        ) {
          await updateWorkflowToSelectInsurer();
        }

        // 3️⃣ Safe redirect to insurer selection page
        router.replace("/insurer-selection");
      } catch (error) {
        console.error("Start page error:", error);
      }
    };

    authenticateAndRoute();
  }, [token, router]);

  /* ===================== UI (UNCHANGED) ===================== */

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm text-gray-500">
        Verifying your details, please wait...
      </p>
    </div>
  );
}

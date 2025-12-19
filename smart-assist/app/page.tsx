"use client";

import { useState } from "react";

/* =======================
   Types
======================= */
type UXIssue = {
  title: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  suggestion: string;
};

/* =======================
   Helper: Image Analysis (Browser)
======================= */
const extractVisualStats = (file: File): Promise<{
  brightness: number;
  variance: number;
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;

      let sum = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        sum +=
          (imageData[i] +
            imageData[i + 1] +
            imageData[i + 2]) /
          3;
      }

      const avgBrightness = sum / (imageData.length / 4);

      let varianceSum = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        const b =
          (imageData[i] +
            imageData[i + 1] +
            imageData[i + 2]) /
          3;
        varianceSum += Math.pow(b - avgBrightness, 2);
      }

      resolve({
        brightness: avgBrightness,
        variance: varianceSum / (imageData.length / 4),
      });
    };

    img.src = URL.createObjectURL(file);
  });
};

/* =======================
   Component
======================= */
export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [mode, setMode] = useState<"visual" | "ai">("visual");
  const [issues, setIssues] = useState<UXIssue[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  /* =======================
     Analyze Handler
  ======================= */
  const analyze = async () => {
    if (!image) return;

    setLoading(true);
    setIssues([]);
    setSummary("");

    // 1️⃣ Extract real visual stats in browser
    const visualStats = await extractVisualStats(image);

    // 2️⃣ Call backend (JSON, NOT FormData)
    const res = await fetch("/api/analyze-ui", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        techStack: "React",
        visualStats,
      }),
    });

    const data = await res.json();

    setIssues(data.issues || []);
    setSummary(data.summary || "");
    setLoading(false);
  };

  /* =======================
     UI
  ======================= */
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Smart Assist</h1>
        <p className="text-sm text-gray-600 mb-4">
          Upload a UI screenshot and get instant UX feedback.
        </p>

        {/* Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files?.[0] || null)
          }
          className="mb-4"
        />

        {/* Preview */}
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="mb-4 rounded border"
          />
        )}

        {/* Mode */}
        <select
          value={mode}
          onChange={(e) =>
            setMode(e.target.value as "visual" | "ai")
          }
          className="mb-3 w-full border p-2 rounded"
        >
          <option value="visual">
            Visual Heuristic Analysis
          </option>
          <option value="ai">
            AI UX Review (Phi-3)
          </option>
        </select>

        <p className="text-xs text-gray-500 mb-4">
          {mode === "visual"
            ? "Explainable UX insights based on visual properties."
            : "Generative AI feedback using a local LLM."}
        </p>

        {/* Action */}
        <button
          onClick={analyze}
          disabled={loading || !image}
          className={`w-full py-2 rounded ${
            loading || !image
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black text-white"
          }`}
        >
          {loading ? "Analyzing…" : "Analyze UX"}
        </button>

        {/* Summary */}
        {summary && (
          <div className="mt-6">
            <h2 className="font-semibold mb-1">
              Summary
            </h2>
            <p className="text-sm text-gray-700">
              {summary}
            </p>
          </div>
        )}

        {/* Issues */}
        {issues.length > 0 && (
          <div className="mt-4 space-y-3">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="border p-3 rounded bg-gray-50"
              >
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium">
                    {issue.title}
                  </h3>
                  <span className="text-xs">
                    {issue.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {issue.description}
                </p>
                <p className="text-sm mt-1">
                  <strong>Suggestion:</strong>{" "}
                  {issue.suggestion}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

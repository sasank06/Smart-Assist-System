"use client";

import { useState, ChangeEvent } from "react";

/* =======================
   Types
======================= */
type UXIssue = {
  title: string;
  severity: "High" | "Medium" | "Low";
  description: string;
  suggestion: string;
};

type AIResponse = {
  issues: UXIssue[];
  summary: string;
};

/* =======================
   Component
======================= */
export default function Home() {
  /* ---------- State ---------- */
  const [image, setImage] = useState<File | null>(null);
  const [issues, setIssues] = useState<UXIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [techStack, setTechStack] = useState("React");

  /* ---------- Handlers ---------- */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setIssues([]);
      setSummary("");
    }
  };

  const analyzeUX = async () => {
    if (!image) {
      alert("Please upload a UI screenshot first.");
      return;
    }

    setLoading(true);
    setIssues([]);
    setSummary("");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("techStack", techStack);

    try {
      const res = await fetch("/api/analyze-ui", {
        method: "POST",
        body: formData,
      });

      const data: AIResponse = await res.json();

      setIssues(data.issues);
      setSummary(data.summary);
    } catch (err) {
      alert("AI analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Smart Assist</h1>
          <p className="text-sm text-gray-600">
            Get quick, actionable UX feedback from a UI screenshot using AI.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PNG, JPG. Best results with full-screen UI captures.
          </p>
        </div>

        {/* Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mb-3 w-full text-sm"
        />

        {/* Tech stack selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700">
            Optimize suggestions for:
          </label>
          <select
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="mt-1 w-full border rounded-md p-2 text-sm"
          >
            <option>React</option>
            <option>Angular</option>
            <option>Vue</option>
            <option>Flutter</option>
            <option>HTML/CSS</option>
          </select>
        </div>

        {/* Preview */}
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="UI Preview"
            className="mb-4 rounded-lg border"
          />
        )}

        {/* Action */}
        <button
          onClick={analyzeUX}
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "Analyzing interface…" : "Analyze UX"}
        </button>

        {/* Feedback */}
        {issues.length > 0 && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">UX Feedback</h2>

            {issues.map((issue, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium">{issue.title}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      issue.severity === "High"
                        ? "bg-red-100 text-red-700"
                        : issue.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {issue.description}
                </p>

                <p className="text-sm">
                  <strong>Suggestion:</strong> {issue.suggestion}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="mt-6 border rounded-lg p-4 bg-blue-50">
            <h2 className="text-lg font-semibold mb-2">
              UX Expert Insight
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {summary}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

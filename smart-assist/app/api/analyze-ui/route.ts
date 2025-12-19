import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, techStack, visualStats } = body;

    const { brightness, variance } = visualStats;

    // MODE A — Visual Heuristics
    if (mode === "visual") {
      const issues = [];

      if (brightness < 115) {
        issues.push({
          title: "Low contrast UI",
          severity: "High",
          description:
            "The interface appears visually dark, which can reduce readability.",
          suggestion:
            `Increase contrast between background and text in your ${techStack} UI.`
        });
      }

      if (variance > 500) {
        issues.push({
          title: "Visual clutter detected",
          severity: "Medium",
          description:
            "High brightness variance suggests too many competing elements.",
          suggestion:
            `Simplify layout and reduce visual noise in your ${techStack} components.`
        });
      }

      if (issues.length === 0) {
        issues.push({
          title: "Usability baseline met",
          severity: "Low",
          description:
            "No major contrast or density issues detected.",
          suggestion:
            `Minor refinements can further improve UX quality.`
        });
      }

      return NextResponse.json({
        issues,
        summary:
          "This analysis is based on measurable visual properties computed directly from the UI screenshot."
      });
    }

    // MODE B — AI UX REVIEW (OPTIONAL LLM)
    const prompt = `
You are a senior UX designer.

Visual signals:
- Average brightness: ${brightness}
- Brightness variance: ${variance}

Generate UX feedback with severity and actionable suggestions.
Optimize for ${techStack}.
Return STRICT JSON.
`;

    const llm = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi3",
        prompt,
        stream: false
      })
    });

    const llmData = await llm.json();
    console.log("RAW LLM RESPONSE:", llmData.response);
    return NextResponse.json(JSON.parse(llmData.response));

  } catch (err) {
    return NextResponse.json({
      issues: [],
      summary: "Analysis failed."
    });
  }
}

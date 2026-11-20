/**
 * Antigravity Agent Runner for FoodInsightAI & FOOD LAB™
 * Uses the @google/genai Interactions API with 'antigravity-preview-09-2026'
 * to execute and verify the source code inside Google's managed remote Linux sandbox.
 */

import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is not set in environment or .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function runInAntigravity() {
  console.log("🚀 Initializing Antigravity Agent (antigravity-preview-09-2026)...");
  console.log("📦 Provisioning remote sandboxed Linux execution environment...");

  try {
    const interaction = await ai.interactions.create({
      agent: "antigravity-preview-09-2026",
      input: `You are the lead architect for FoodInsightAI & FOOD LAB™.
Inspect the FoodInsightAI project architecture:
1. Verify the Python backend integration endpoints (Food Analysis multipart upload and FOOD LAB™ simulation).
2. Validate the native Android Kotlin architecture (ApiConfig, ApiService, FoodRepository, FoodLabViewModel).
3. Test that the JSON response schemas match and execute a test simulation for an experiment (e.g. Milk + Orange chemical curdling assessment).
Provide a complete execution summary and status report.`,
      environment: "remote",
      agent_config: {
        type: "antigravity",
        model: "gemini-3.8-flash",
      },
    }, { timeout: 300000 });

    console.log("\n✅ Antigravity Agent Execution Completed!");
    console.log(`🌐 Sandbox Environment ID: ${interaction.environment_id}`);
    console.log("\n--- AGENT OUTPUT ---");
    
    // Combine output steps
    let fullOutput = "";
    if (interaction.steps && Array.isArray(interaction.steps)) {
      for (const step of interaction.steps) {
        if (step.type === "model_output") {
          const textPart = step.content?.find((c) => c.type === "text");
          if (textPart && textPart.text) {
            fullOutput += textPart.text;
          }
        }
      }
    }

    console.log(fullOutput || interaction.output_text || "No text output returned.");
  } catch (error) {
    console.error("❌ Failed to run Antigravity agent:", error);
  }
}

runInAntigravity();

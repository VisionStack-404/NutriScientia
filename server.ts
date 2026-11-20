import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function generateFastStructuredJson(
  ai: GoogleGenAI,
  params: {
    contents:
      | string
      | {
          parts: Array<
            | { inlineData: { mimeType: string; data: string } }
            | { text: string }
          >;
        };
    systemInstruction?: string;
    responseSchema: Record<string, unknown>;
    hedgeDelayMs?: number;
    maxOutputTokens?: number;
  }
) {
  const primaryController = new AbortController();
  const fallbackController = new AbortController();
  const totalDeadline = setTimeout(() => {
    primaryController.abort(new Error('Primary analysis timeout'));
    fallbackController.abort(new Error('Fallback analysis timeout'));
  }, 15000);

  const runPrimary = () =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: params.contents,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        abortSignal: primaryController.signal,
        ...(params.maxOutputTokens ? { maxOutputTokens: params.maxOutputTokens } : {}),
        ...(params.systemInstruction ? { systemInstruction: params.systemInstruction } : {}),
        responseMimeType: 'application/json',
        responseSchema: params.responseSchema,
      },
    });

  const runLite = () =>
    ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: params.contents,
      config: {
        abortSignal: fallbackController.signal,
        ...(params.maxOutputTokens ? { maxOutputTokens: params.maxOutputTokens } : {}),
        ...(params.systemInstruction ? { systemInstruction: params.systemInstruction } : {}),
        responseMimeType: 'application/json',
        responseSchema: params.responseSchema,
      },
    });

  let hedgeTimer: ReturnType<typeof setTimeout> | undefined;
  let fallbackPromise: ReturnType<typeof runLite> | null = null;
  const hedgeDelay = params.hedgeDelayMs ?? 2800;

  const ensureLiteStarted = () => {
    if (!fallbackPromise) {
      fallbackPromise = runLite();
    }
    return fallbackPromise;
  };

  try {
    const primaryPromise = runPrimary();
    const hedgedLitePromise = new Promise<Awaited<ReturnType<typeof runLite>>>((resolve, reject) => {
      hedgeTimer = setTimeout(() => {
        ensureLiteStarted().then(resolve, reject);
      }, hedgeDelay);
      primaryPromise.catch(() => {
        if (hedgeTimer) {
          clearTimeout(hedgeTimer);
          hedgeTimer = undefined;
        }
        ensureLiteStarted().then(resolve, reject);
      });
    });

    const winner = await Promise.any([primaryPromise, hedgedLitePromise]);
    if (hedgeTimer) clearTimeout(hedgeTimer);
    clearTimeout(totalDeadline);
    // Cancel the losing request cleanly to save quota/work
    primaryController.abort();
    fallbackController.abort();
    return winner;
  } catch (err) {
    if (hedgeTimer) clearTimeout(hedgeTimer);
    clearTimeout(totalDeadline);
    throw err;
  }
}

async function startServer() {
  const app = express();
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-App-Version');
    res.header('Access-Control-Allow-Private-Network', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, hasGeminiKey: Boolean(getAiClient()) });
  });

  const DEFAULT_SOURCE_EMAIL = 'varunvadlakonda1577@gmail.com';

  function createSmtpTransporter() {
    const pass = process.env.SMTP_PASS || '';
    const host = (process.env.SMTP_HOST || (pass ? 'smtp.gmail.com' : '')).trim();
    const user = (process.env.SMTP_USER || (pass ? DEFAULT_SOURCE_EMAIL : '')).trim();
    const port = Number(process.env.SMTP_PORT || '587');
    const secure =
      process.env.SMTP_SECURE === 'true' ||
      process.env.SMTP_SECURE === '1' ||
      port === 465;
    const allowUnauth = process.env.SMTP_ALLOW_UNAUTH === 'true';

    if (!host) return null;
    if (!allowUnauth && (!user || !pass)) return null;

    return nodemailer.createTransport({
      host,
      port: Number.isFinite(port) && port > 0 ? port : 587,
      secure,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const sentWelcomeEmailKeys = new Set<string>();

  function getSmtpMissingFields(): string[] {
    const pass = (process.env.SMTP_PASS || '').trim();
    const allowUnauth = process.env.SMTP_ALLOW_UNAUTH === 'true';
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const user = (process.env.SMTP_USER || DEFAULT_SOURCE_EMAIL).trim();
    const missing: string[] = [];
    if (!host) missing.push('SMTP_HOST');
    if (!allowUnauth && !user) missing.push('SMTP_USER');
    if (!allowUnauth && !pass) missing.push('SMTP_PASS');
    return missing;
  }

  app.get('/api/auth/smtp-status', (_req, res) => {
    const sourceEmail =
      (process.env.SMTP_USER || '').trim() || DEFAULT_SOURCE_EMAIL;
    const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
    const port = Number(process.env.SMTP_PORT || '587');
    const missingFields = getSmtpMissingFields();
    res.json({
      configured: Boolean(createSmtpTransporter()),
      sourceEmail,
      host,
      port: Number.isFinite(port) && port > 0 ? port : 587,
      missingFields,
    });
  });

  app.post('/api/auth/welcome-email', async (req, res) => {
    try {
      const { email, name, uid, force } = req.body as {
        email?: string;
        name?: string;
        uid?: string;
        force?: boolean;
      };

      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanName = (name || 'Explorer').trim().slice(0, 80) || 'Explorer';

      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ sent: false, error: 'A valid recipient email address is required.' });
      }

      const dedupeKey = uid ? `uid:${uid}` : `email:${cleanEmail}`;
      if (
        !force &&
        (sentWelcomeEmailKeys.has(dedupeKey) || sentWelcomeEmailKeys.has(`email:${cleanEmail}`))
      ) {
        return res.json({ sent: false, alreadySent: true, message: 'Welcome email was already delivered for this account.' });
      }

      const transporter = createSmtpTransporter();
      if (!transporter) {
        const missingFields = getSmtpMissingFields();
        return res.status(503).json({
          sent: false,
          code: 'SMTP_NOT_CONFIGURED',
          missingFields,
          message: `SMTP credentials are not fully configured (${missingFields.join(', ') || 'SMTP_PASS'} missing in server .env).`,
        });
      }

      const senderEmail = (process.env.SMTP_USER || '').trim() || DEFAULT_SOURCE_EMAIL;
      const fromAddress =
        (process.env.SMTP_FROM || '').trim() || `NutriScientia <${senderEmail}>`;

      const appUrl = (process.env.APP_URL || '').trim();
      const safeName = escapeHtml(cleanName);

      const textBody = [
        `Welcome to NutriScientia, ${cleanName}!`,
        '',
        'Thank you for registering with NutriScientia — the Food Insight AI Virtual Lab.',
        '',
        'What you can explore inside NutriScientia:',
        '- AI Meal & Photo Analysis: Instant nutritional breakdown, ingredients, health benefits, and food safety risks.',
        '- FoodLab Virtual Simulator: Combine ingredients to test biochemical interactions, toxicity, and glycemic/nutrient balance.',
        '- Professional PDF Reports: Export shareable meal and lab reports complete with your uploaded dish photo.',
        '- Personalized Allergy & Dietary Guardrails: Custom warnings matched to your profile and health goals.',
        ...(appUrl && appUrl !== 'MY_APP_URL' ? ['', `Launch NutriScientia: ${appUrl}`] : []),
        '',
        'Powered by 6 Monkeys Inc.',
      ].join('\n');

      const htmlBody = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:#064e3b;padding:24px 28px;color:#ffffff;">
          <div style="font-size:22px;font-weight:800;letter-spacing:-0.02em;">NutriScientia</div>
          <div style="font-size:13px;color:#a7f3d0;margin-top:4px;">Food Insight AI Virtual Lab</div>
        </td>
      </tr>
      <tr>
        <td style="padding:26px 28px;font-size:14px;line-height:1.6;color:#334155;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Welcome aboard, ${safeName}!</h1>
          <p style="margin:0 0 16px;">
            Your <strong>NutriScientia</strong> account is active. You now have full access to our AI-powered nutritional intelligence and virtual chemistry testing platform:
          </p>
          <ul style="margin:0 0 18px;padding-left:20px;">
            <li style="margin-bottom:8px;"><strong>AI Meal &amp; Photo Analysis:</strong> Macro/micronutrient profiles, ingredient composition, health benefits, and allergen risk audits.</li>
            <li style="margin-bottom:8px;"><strong>FoodLab Virtual Lab:</strong> Simulate multi-ingredient food pairings for chemical compatibility and metabolic outcomes.</li>
            <li style="margin-bottom:8px;"><strong>Professional PDF Reports:</strong> Download comprehensive PDF intelligence reports featuring your uploaded food photo.</li>
            <li><strong>Smart Profile Alerts:</strong> Personalized notifications tailored to your dietary preferences and allergies.</li>
          </ul>
          ${
            appUrl && appUrl !== 'MY_APP_URL'
              ? `<p style="margin:20px 0;"><a href="${escapeHtml(appUrl)}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 20px;border-radius:10px;">Open NutriScientia</a></p>`
              : ''
          }
          <p style="margin:18px 0 0;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:14px;">
            <strong>NutriScientia</strong> · Food Insight AI Virtual Lab<br/>
            <span style="color:#059669;font-weight:700;">Powered by 6 Monkeys Inc.</span>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject: 'Welcome to NutriScientia — Your Food Insight AI Virtual Lab',
        text: textBody,
        html: htmlBody,
      });

      sentWelcomeEmailKeys.add(dedupeKey);
      sentWelcomeEmailKeys.add(`email:${cleanEmail}`);

      res.json({
        sent: true,
        messageId: info.messageId,
      });
    } catch (err) {
      const error = err as Error;
      console.error('SMTP welcome email error:', error);
      res.status(500).json({
        sent: false,
        error: error.message || 'Failed to send welcome email.',
      });
    }
  });

  const foodAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      foodName: { type: Type.STRING },
      cuisine: { type: Type.STRING },
      category: { type: Type.STRING },
      confidence: { type: Type.INTEGER },
      servingSize: { type: Type.STRING },
      overallAssessment: {
        type: Type.OBJECT,
        properties: {
          matchStatus: { type: Type.STRING },
          scorePercentage: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          nutritionalValueSummary: { type: Type.STRING },
          safetyStatusSummary: { type: Type.STRING },
        },
        required: [
          'matchStatus',
          'scorePercentage',
          'summary',
          'nutritionalValueSummary',
          'safetyStatusSummary',
        ],
      },
      nutrition: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.INTEGER },
          servingWeightGrams: { type: Type.INTEGER },
          macronutrients: {
            type: Type.OBJECT,
            properties: {
              proteinGrams: { type: Type.NUMBER },
              proteinTag: { type: Type.STRING },
              carbsGrams: { type: Type.NUMBER },
              carbsTag: { type: Type.STRING },
              fatGrams: { type: Type.NUMBER },
              fatTag: { type: Type.STRING },
              fiberGrams: { type: Type.NUMBER },
            },
            required: [
              'proteinGrams',
              'proteinTag',
              'carbsGrams',
              'carbsTag',
              'fatGrams',
              'fatTag',
              'fiberGrams',
            ],
          },
          micronutrients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                amount: { type: Type.STRING },
                dailyValuePercentage: { type: Type.INTEGER },
              },
              required: ['name', 'amount', 'dailyValuePercentage'],
            },
          },
        },
        required: [
          'calories',
          'servingWeightGrams',
          'macronutrients',
          'micronutrients',
        ],
      },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            subname: { type: Type.STRING },
            percentage: { type: Type.INTEGER },
            isKeyIngredient: { type: Type.BOOLEAN },
            description: { type: Type.STRING },
          },
          required: ['id', 'name', 'percentage', 'description'],
        },
      },
      safety: {
        type: Type.OBJECT,
        properties: {
          overallRisk: { type: Type.STRING },
          riskSummary: { type: Type.STRING },
          allergens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                allergenName: { type: Type.STRING },
                isPresent: { type: Type.BOOLEAN },
                warningLevel: { type: Type.STRING },
              },
              required: ['allergenName', 'isPresent', 'warningLevel'],
            },
          },
          qualityChecks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                isSafe: { type: Type.BOOLEAN },
              },
              required: ['title', 'isSafe'],
            },
          },
          riskFactors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                factor: { type: Type.STRING },
                severity: { type: Type.STRING },
              },
              required: ['factor', 'severity'],
            },
          },
        },
        required: [
          'overallRisk',
          'riskSummary',
          'allergens',
          'qualityChecks',
          'riskFactors',
        ],
      },
      evidence: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            sourceName: { type: Type.STRING },
            category: { type: Type.STRING },
            snippet: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
            referenceUrl: { type: Type.STRING },
          },
          required: ['id', 'sourceName', 'category', 'snippet', 'referenceUrl'],
        },
      },
      profileMatch: {
        type: Type.OBJECT,
        properties: {
          dietaryFit: { type: Type.STRING },
          calorieFit: { type: Type.STRING },
          notes: { type: Type.STRING },
        },
        required: ['dietaryFit', 'calorieFit'],
      },
      healthBenefits: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      combinations: {
        type: Type.OBJECT,
        properties: {
          safeCombinations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                foodName: { type: Type.STRING },
                status: { type: Type.STRING },
                summary: { type: Type.STRING },
                scientificReason: { type: Type.STRING },
                evidenceSource: { type: Type.STRING },
              },
              required: ['foodName', 'status', 'summary', 'scientificReason', 'evidenceSource'],
            },
          },
          unsafeCombinations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                foodName: { type: Type.STRING },
                status: { type: Type.STRING },
                summary: { type: Type.STRING },
                scientificReason: { type: Type.STRING },
                evidenceSource: { type: Type.STRING },
              },
              required: ['foodName', 'status', 'summary', 'scientificReason', 'evidenceSource'],
            },
          },
        },
        required: ['safeCombinations', 'unsafeCombinations'],
      },
    },
    required: [
      'foodName',
      'cuisine',
      'category',
      'confidence',
      'servingSize',
      'overallAssessment',
      'nutrition',
      'ingredients',
      'safety',
      'evidence',
      'profileMatch',
      'healthBenefits',
      'combinations',
    ],
  };

  app.post('/api/food/analyze', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'NO_API_KEY',
      });
    }

    try {
      const { imageBase64, mimeType, userProfile, hint, foodName } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        foodName?: string;
        userProfile?: {
          dietaryPreference?: string;
          allergies?: string[];
          healthGoals?: string;
          calorieTargetPerMeal?: number;
        };
        hint?: string;
      };

      const textFoodQuery = (foodName || hint || '').trim();
      if (!imageBase64 && !textFoodQuery) {
        return res.status(400).json({ error: 'No image data or food name provided.' });
      }

      const cleanBase64 = imageBase64
        ? imageBase64.replace(/^data:[^;]+;base64,/, '')
        : '';

      const profileSummary = userProfile
        ? `User profile: Diet=${userProfile.dietaryPreference || 'Balanced'}, Allergies=${(userProfile.allergies || []).join(', ') || 'None'}, Goal=${userProfile.healthGoals || 'General wellness'}, Target=${userProfile.calorieTargetPerMeal || 600} kcal/meal.`
        : 'User profile: Balanced diet, 600 kcal/meal target.';

      const promptText = cleanBase64
        ? `Analyze the exact food shown in this image${textFoodQuery ? ` (hint: ${textFoodQuery})` : ''}.
Identify the true visible dish/food name accurately (never guess unrelated dishes). Keep descriptions crisp (1 short sentence each): list 4-6 clear ingredient names summing to 100%, 4 micronutrients, 3 allergens, 2 qualityChecks, 2 riskFactors, 3-4 concise evidence-based healthBenefits, 3 evidence sources (USDA, NIH/PubMed, FAO/WHO) with valid public https:// referenceUrl links, plus combinations: 3 specific safeCombinations ("Safe") to eat with this food and 3 specific unsafeCombinations ("Avoid" or "Unsafe") to avoid with this food, each with scientificReason and evidenceSource.
${profileSummary}`
        : `Analyze "${textFoodQuery}" for a standard single serving.
Keep descriptions crisp (1 short sentence each): list 4-6 clear ingredient names summing to 100%, 4 micronutrients, 3 allergens, 2 qualityChecks, 2 riskFactors, 3-4 concise evidence-based healthBenefits, 3 evidence sources (USDA, NIH/PubMed, FAO/WHO) with valid public https:// referenceUrl links, plus combinations: 3 specific safeCombinations ("Safe") and 3 specific unsafeCombinations ("Avoid" or "Unsafe") with scientificReason and evidenceSource.
${profileSummary}`;

      const parts: Array<
        | { inlineData: { mimeType: string; data: string } }
        | { text: string }
      > = [];

      if (cleanBase64) {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
      parts.push({ text: promptText });

      const response = await generateFastStructuredJson(ai, {
        contents: { parts },
        systemInstruction:
          'You are a fast, precision culinary vision & clinical nutrition analyst. Accurately identify dishes and output concise, evidence-based JSON matching the schema. Keep field values brief and accurate.',
        responseSchema: foodAnalysisSchema,
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      res.json({
        analysisId: `scan_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...parsed,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Gemini food analysis error:', error);
      res.status(500).json({
        error: error.message || 'Food analysis failed.',
      });
    }
  });

  app.post('/api/food/analyze-text', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'NO_API_KEY',
      });
    }

    try {
      const {
        foodName,
        category,
        cuisine,
        cookingMethod,
        knownIngredients,
        userProfile,
      } = req.body as {
        foodName?: string;
        category?: string;
        cuisine?: string;
        cookingMethod?: string;
        knownIngredients?: string[];
        userProfile?: {
          dietaryPreference?: string;
          allergies?: string[];
          healthGoals?: string;
          calorieTargetPerMeal?: number;
        };
      };

      const cleanFoodName = (foodName || '').trim();
      if (!cleanFoodName) {
        return res.status(400).json({ error: 'foodName text input is required.' });
      }

      const profileSummary = userProfile
        ? `User profile: Diet=${userProfile.dietaryPreference || 'Balanced'}, Allergies=${(userProfile.allergies || []).join(', ') || 'None'}, Goal=${userProfile.healthGoals || 'General wellness'}, Target=${userProfile.calorieTargetPerMeal || 600} kcal/meal.`
        : 'User profile: Balanced diet, 600 kcal/meal target.';

      const metadataParts: string[] = [];
      if (category) metadataParts.push(`Category: ${category}`);
      if (cuisine) metadataParts.push(`Cuisine: ${cuisine}`);
      if (cookingMethod) metadataParts.push(`Cooking method: ${cookingMethod}`);
      if (Array.isArray(knownIngredients) && knownIngredients.length > 0) {
        metadataParts.push(`Key ingredients: ${knownIngredients.join(', ')}`);
      }

      const promptText = `Analyze "${cleanFoodName}" for a standard single serving.
${metadataParts.length > 0 ? `Context: ${metadataParts.join(' | ')}.` : ''}
Keep foodName set to "${cleanFoodName}". Keep descriptions crisp (1 short sentence each): list 4-6 clear ingredient names summing to 100%, 4 micronutrients, 3 allergens, 2 qualityChecks, 2 riskFactors, 3-4 concise evidence-based healthBenefits, 3 evidence sources (USDA, NIH/PubMed, FAO/WHO) with valid public https:// referenceUrl links, plus combinations: 3 specific safeCombinations ("Safe") and 3 specific unsafeCombinations ("Avoid" or "Unsafe") with scientificReason and evidenceSource.
${profileSummary}`;

      const response = await generateFastStructuredJson(ai, {
        contents: promptText,
        systemInstruction:
          'You are a fast, precision culinary & clinical nutrition analyst. Output concise, evidence-based JSON matching the schema.',
        responseSchema: foodAnalysisSchema,
      });

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);

      res.json({
        analysisId: `text_${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...parsed,
        foodName: parsed.foodName || cleanFoodName,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Gemini text food analysis error:', error);
      res.status(500).json({
        error: error.message || 'Text food name analysis failed.',
      });
    }
  });

  app.post('/api/intelligence/ask', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini API key is not configured.' });
    }

    try {
      const { foodName, question, analysisContext } = req.body as {
        foodName?: string;
        question?: string;
        analysisContext?: string;
      };

      const response = await generateFastStructuredJson(ai, {
        contents: `Food analyzed: ${foodName || 'Meal'}.
Context: ${analysisContext || 'Standard meal nutritional and safety profile.'}
User question: ${question || ''}
Provide a concise, evidence-grounded answer (2-4 sentences) and list 2 credible source names + 3 short follow-up questions.`,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { type: Type.STRING },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
            relatedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['answer', 'sources', 'relatedQuestions'],
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err) {
      const error = err as Error;
      console.error('Gemini ask error:', error);
      res.status(500).json({ error: error.message || 'Failed to answer question.' });
    }
  });

  const foodLabExperimentSchema = {
    type: Type.OBJECT,
    properties: {
      verdict: { type: Type.STRING },
      verdictTitle: { type: Type.STRING },
      verdictSubtitle: { type: Type.STRING },
      riskWeight: { type: Type.INTEGER },
      safetyRiskWeight: { type: Type.INTEGER },
      healthRiskWeight: { type: Type.INTEGER },
      keyReason: { type: Type.STRING },
      nutritionNote: { type: Type.STRING },
      safetyRisks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            severity: { type: Type.STRING },
          },
          required: ['type', 'title', 'description', 'severity'],
        },
      },
      healthImpacts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            status: { type: Type.STRING },
          },
          required: ['text', 'status'],
        },
      },
      finalConclusion: { type: Type.STRING },
    },
    required: [
      'verdict',
      'verdictTitle',
      'verdictSubtitle',
      'riskWeight',
      'safetyRiskWeight',
      'healthRiskWeight',
      'keyReason',
      'nutritionNote',
      'safetyRisks',
      'healthImpacts',
      'finalConclusion',
    ],
  };

  const foodLabExperimentCache = new Map<string, Record<string, unknown>>();

  app.post('/api/foodlab/experiment', async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server.',
        code: 'NO_API_KEY',
      });
    }

    try {
      const {
        experimentName,
        selectedFoods,
        researchObjective,
        nutritionalFocus,
        nutritionTotals,
      } = req.body as {
        experimentName?: string;
        selectedFoods?: Array<{
          name: string;
          category?: string;
          quantityGrams: number;
          unit?: string;
          isAcidic?: boolean;
          dairyType?: boolean;
        }>;
        researchObjective?: string;
        nutritionalFocus?: string[];
        nutritionTotals?: {
          calories?: number;
          carbsGrams?: number;
          proteinGrams?: number;
          fatGrams?: number;
          sugarGrams?: number;
          fiberGrams?: number;
          calciumMg?: number;
          vitaminCMg?: number;
        };
      };

      if (!Array.isArray(selectedFoods) || selectedFoods.length < 2) {
        return res.status(400).json({ error: 'At least 2 selectedFoods are required for FoodLab experiment.' });
      }

      const cacheKey = JSON.stringify({
        foods: selectedFoods
          .map((f) => `${f.name.trim().toLowerCase()}:${f.quantityGrams}`)
          .sort(),
        obj: researchObjective || 'Complete scientific assessment',
        focus: [...(nutritionalFocus || [])].sort(),
      });

      const cachedVerdict = foodLabExperimentCache.get(cacheKey);
      if (cachedVerdict) {
        return res.json({
          experimentId: `FL-${Math.floor(10000 + Math.random() * 90000)}`,
          createdAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          ...cachedVerdict,
        });
      }

      const ingredientsSummary = selectedFoods
        .map((f) => `${f.name} (${f.quantityGrams}${f.unit || 'g'}, category=${f.category || 'Food'})`)
        .join(' + ');

      const macroLine = nutritionTotals
        ? `Combined totals: ${nutritionTotals.calories ?? 0} kcal, Carbs ${nutritionTotals.carbsGrams ?? 0}g, Protein ${nutritionTotals.proteinGrams ?? 0}g, Fat ${nutritionTotals.fatGrams ?? 0}g, Sugar ${nutritionTotals.sugarGrams ?? 0}g, Fiber ${nutritionTotals.fiberGrams ?? 0}g, Calcium ${nutritionTotals.calciumMg ?? 0}mg, Vitamin C ${nutritionTotals.vitaminCMg ?? 0}mg.`
        : '';

      const promptText = `Evaluate FoodLab mix "${experimentName || ingredientsSummary}": ${ingredientsSummary}.
${macroLine}
Objective: ${researchObjective || 'Complete scientific assessment'}. Focus: ${(nutritionalFocus || []).join(', ') || 'Balanced nutrition'}.
Rules:
- verdict: "UNEATABLE" (incompatible e.g. milk+citrus), "CAUTION" (e.g. tannins+iron, heavy lipid+sugar), "SAFE", or "BENEFICIAL".
- riskWeight, safetyRiskWeight, healthRiskWeight: integers 0-100.
- safetyRisks: 2-4 items (type in ["Chemical Interaction", "Digestive Risk", "Nutrient Loss", "Stability Issue", "Contamination Risk"], severity in ["High", "Moderate", "Low"]).
- healthImpacts: 3 concise items (status in ["critical", "warning", "positive"]).`;

      const response = await generateFastStructuredJson(ai, {
        contents: promptText,
        systemInstruction:
          'You are a precision food chemistry, nutrient bioavailability, and food safety analyst for NutriScientia FoodLab. Output concise, factual biochemical JSON matching the schema.',
        responseSchema: foodLabExperimentSchema,
        hedgeDelayMs: 1200,
        maxOutputTokens: 1200,
      });

      const parsed = JSON.parse((response.text ?? '{}').trim()) as Record<string, unknown>;
      if (foodLabExperimentCache.size >= 200) {
        const oldestKey = foodLabExperimentCache.keys().next().value;
        if (oldestKey) foodLabExperimentCache.delete(oldestKey);
      }
      foodLabExperimentCache.set(cacheKey, parsed);

      res.json({
        experimentId: `FL-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        ...parsed,
      });
    } catch (err) {
      const error = err as Error;
      console.error('Gemini FoodLab experiment error:', error);
      res.status(500).json({ error: error.message || 'FoodLab simulation failed.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          if (filePath.endsWith('sw.js')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          } else if (filePath.endsWith('.webmanifest')) {
            res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodInsightAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

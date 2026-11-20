package com.foodinsightai.app.models

import com.google.gson.annotations.SerializedName

/**
 * DataModels
 * 
 * Response and Request models for FoodInsightAI.
 * All models feature explicit `@SerializedName` annotations and clear placeholders
 * to match your Python backend schema.
 */

// ==========================================
// 1. Food Identification & Analysis Models
// ==========================================

/**
 * [INTEGRATION_PLACEHOLDER: Verify response structure with your Python backend response for /food/analyze]
 */
data class FoodAnalysisResponse(
    @SerializedName("id") val analysisId: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("cuisine") val cuisine: String? = null,
    @SerializedName("category") val category: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("serving_size") val servingSize: String? = "250g",
    
    // Overview & Score
    @SerializedName("overall_assessment") val overallAssessment: OverallAssessment,
    
    // Nutrition breakdown
    @SerializedName("nutrition") val nutrition: NutritionData,
    
    // Detailed ingredients breakdown
    @SerializedName("ingredients") val ingredients: List<IngredientItem>,
    
    // Safety & Allergens
    @SerializedName("safety") val safety: SafetyAssessment,
    
    // Supporting RAG Evidence
    @SerializedName("evidence") val evidence: List<EvidenceSource>,

    // Safe & Unsafe Food Combinations
    @SerializedName("combinations") val combinations: FoodCombinationsData? = null,

    // Profile Match
    @SerializedName("profile_match") val profileMatch: ProfileMatchInfo? = null,

    @SerializedName("created_at") val createdAt: String? = null
)

data class FoodCombinationAdvice(
    @SerializedName("pairing_name") val pairingName: String,
    @SerializedName("reason") val reason: String,
    @SerializedName("evidence_note") val evidenceNote: String,
    @SerializedName("source") val source: String? = null
)

data class FoodCombinationsData(
    @SerializedName("safe_to_eat") val safeToEat: List<FoodCombinationAdvice> = emptyList(),
    @SerializedName("unsafe_to_avoid") val unsafeToAvoid: List<FoodCombinationAdvice> = emptyList()
)

data class FoodIdentificationMatch(
    @SerializedName("name") val name: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("thumbnail_url") val thumbnailUrl: String? = null
)

data class DetectedComponent(
    @SerializedName("name") val name: String,
    @SerializedName("prominence") val prominence: String // e.g. "High", "Medium", "Low"
)

data class FoodIdentificationResponse(
    @SerializedName("detected_food") val detectedFood: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("cuisine") val cuisine: String,
    @SerializedName("category") val category: String,
    @SerializedName("possible_matches") val possibleMatches: List<FoodIdentificationMatch>,
    @SerializedName("detected_components") val detectedComponents: List<DetectedComponent>
)

data class OverallAssessment(
    @SerializedName("match_status") val matchStatus: String, // e.g., "Good Match", "Moderate"
    @SerializedName("score_percentage") val scorePercentage: Int, // e.g., 82
    @SerializedName("summary") val summary: String,
    @SerializedName("nutritional_value_summary") val nutritionalValueSummary: String,
    @SerializedName("safety_status_summary") val safetyStatusSummary: String
)

data class ProfileMatchInfo(
    @SerializedName("dietary_fit") val dietaryFit: String,
    @SerializedName("calorie_fit") val calorieFit: String,
    @SerializedName("notes") val notes: String? = null
)

// ==========================================
// 2. Nutrition Breakdown
// ==========================================

data class NutritionData(
    @SerializedName("calories_kcal") val calories: Int,
    @SerializedName("serving_weight_g") val servingWeightGrams: Int? = 250,
    @SerializedName("macronutrients") val macronutrients: Macronutrients,
    @SerializedName("micronutrients") val micronutrients: List<MicronutrientItem>? = emptyList()
)

data class Macronutrients(
    @SerializedName("protein_g") val proteinGrams: Float,
    @SerializedName("protein_tag") val proteinTag: String? = "High",
    @SerializedName("carbohydrates_g") val carbsGrams: Float,
    @SerializedName("carbs_tag") val carbsTag: String? = "Moderate",
    @SerializedName("fat_g") val fatGrams: Float,
    @SerializedName("fat_tag") val fatTag: String? = "Moderate",
    @SerializedName("fiber_g") val fiberGrams: Float? = 3f
)

data class MicronutrientItem(
    @SerializedName("name") val name: String,
    @SerializedName("amount") val amount: String,
    @SerializedName("daily_value_percentage") val dailyValuePercentage: Int
)

// ==========================================
// 3. Ingredients & Composition
// ==========================================

data class IngredientItem(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String,
    @SerializedName("subname") val subname: String? = null,
    @SerializedName("percentage") val percentage: Int,
    @SerializedName("is_key_ingredient") val isKeyIngredient: Boolean = false,
    @SerializedName("description") val description: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null
)

// ==========================================
// 4. Food Safety, Allergens & Risks
// ==========================================

data class SafetyAssessment(
    @SerializedName("overall_risk") val overallRisk: String, // e.g. "Low Risk", "Medium Risk"
    @SerializedName("risk_summary") val riskSummary: String,
    @SerializedName("allergens") val allergens: List<AllergenStatus>,
    @SerializedName("quality_checks") val qualityChecks: List<QualityCheckItem>,
    @SerializedName("risk_factors") val riskFactors: List<RiskFactorItem>
)

data class AllergenStatus(
    @SerializedName("allergen_name") val allergenName: String,
    @SerializedName("is_present") val isPresent: Boolean,
    @SerializedName("warning_level") val warningLevel: String? = null // e.g. "Contains", "Not detected", "Trace"
)

data class QualityCheckItem(
    @SerializedName("title") val title: String,
    @SerializedName("is_safe") val isSafe: Boolean
)

data class RiskFactorItem(
    @SerializedName("factor") val factor: String,
    @SerializedName("severity") val severity: String // "Low", "Moderate", "High"
)

// ==========================================
// 5. Evidence Explorer (RAG)
// ==========================================

data class EvidenceSource(
    @SerializedName("id") val id: String,
    @SerializedName("source_name") val sourceName: String, // e.g. "USDA Food Composition Database"
    @SerializedName("category") val category: String, // "Nutrition", "Safety", "General"
    @SerializedName("snippet") val snippet: String,
    @SerializedName("confidence_score") val confidenceScore: Float? = null,
    @SerializedName("reference_url") val referenceUrl: String? = null
)

// ==========================================
// 6. FoodLab - Virtual Food Experimentation Models
// ==========================================

data class FoodCatalogueItemModel(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String, // "FRUITS", "DAIRY", "VEGETABLES", etc.
    @SerializedName("default_grams") val defaultGrams: Int,
    @SerializedName("unit") val unit: String = "g",
    @SerializedName("calories_per_100g") val caloriesPer100g: Float,
    @SerializedName("protein_per_100g") val proteinPer100g: Float,
    @SerializedName("carbs_per_100g") val carbsPer100g: Float,
    @SerializedName("fat_per_100g") val fatPer100g: Float,
    @SerializedName("sugar_per_100g") val sugarPer100g: Float,
    @SerializedName("fiber_per_100g") val fiberPer100g: Float,
    @SerializedName("calcium_mg_per_100g") val calciumMgPer100g: Float,
    @SerializedName("vitamin_c_mg_per_100g") val vitaminCMgPer100g: Float,
    @SerializedName("is_acidic") val isAcidic: Boolean = false,
    @SerializedName("image_url") val imageUrl: String
)

data class SelectedFoodRequestItem(
    @SerializedName("food_id") val foodId: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("quantity_grams") val quantityGrams: Int
)

data class FoodLabExperimentRequest(
    @SerializedName("experiment_name") val experimentName: String,
    @SerializedName("selected_foods") val selectedFoods: List<SelectedFoodRequestItem>,
    @SerializedName("research_objective") val researchObjective: String,
    @SerializedName("nutritional_focus") val nutritionalFocus: List<String> = emptyList()
)

data class FoodLabExperimentResponse(
    @SerializedName("experiment_id") val experimentId: String,
    @SerializedName("experiment_name") val experimentName: String,
    @SerializedName("total_weight_grams") val totalWeightGrams: Int,
    @SerializedName("combination_type") val combinationType: String,
    @SerializedName("verdict") val verdict: String, // "UNEATABLE", "SAFE", "CAUTION", "BENEFICIAL"
    @SerializedName("verdict_title") val verdictTitle: String,
    @SerializedName("verdict_subtitle") val verdictSubtitle: String,
    @SerializedName("risk_weight") val riskWeight: Int, // 0 - 100
    @SerializedName("safety_risk_weight") val safetyRiskWeight: Int,
    @SerializedName("health_risk_weight") val healthRiskWeight: Int,
    @SerializedName("key_reason") val keyReason: String,
    @SerializedName("nutrition") val nutrition: ExperimentNutritionTotals,
    @SerializedName("safety_risks") val safetyRisks: List<ExperimentSafetyRisk>,
    @SerializedName("health_impacts") val healthImpacts: List<ExperimentHealthImpact>,
    @SerializedName("evidence_sources") val evidenceSources: List<EvidenceSource>,
    @SerializedName("final_conclusion") val finalConclusion: String,
    @SerializedName("created_at") val createdAt: String
)

data class ExperimentNutritionTotals(
    @SerializedName("calories_kcal") val calories: Int,
    @SerializedName("carbohydrates_g") val carbsGrams: Float,
    @SerializedName("protein_g") val proteinGrams: Float,
    @SerializedName("fat_g") val fatGrams: Float,
    @SerializedName("sugar_g") val sugarGrams: Float,
    @SerializedName("fiber_g") val fiberGrams: Float,
    @SerializedName("calcium_mg") val calciumMg: Float,
    @SerializedName("vitamin_c_mg") val vitaminCMg: Float,
    @SerializedName("nutrition_note") val nutritionNote: String? = null
)

data class ExperimentSafetyRisk(
    @SerializedName("type") val type: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("severity") val severity: String // "High", "Moderate", "Low"
)

data class ExperimentHealthImpact(
    @SerializedName("text") val text: String,
    @SerializedName("status") val status: String // "critical", "warning", "positive"
)

data class ExperimentReportResponse(
    @SerializedName("experiment_id") val experimentId: String,
    @SerializedName("pdf_download_url") val pdfDownloadUrl: String? = null,
    @SerializedName("generated_at") val generatedAt: String
)

// ==========================================
// 7. Ask Intelligence Q&A Models
// ==========================================

data class AskQuestionRequest(
    @SerializedName("food_id") val foodId: String? = null,
    @SerializedName("food_name") val foodName: String? = null,
    @SerializedName("question") val question: String,
    @SerializedName("user_dietary_profile") val userDietaryProfile: String? = null
)

data class AskQuestionResponse(
    @SerializedName("answer") val answer: String,
    @SerializedName("sources") val sources: List<String>? = emptyList(),
    @SerializedName("related_questions") val relatedQuestions: List<String>? = emptyList()
)

// ==========================================
// 8. Profile & History Models
// ==========================================

data class UserProfile(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("dietary_preference") val dietaryPreference: String, // "Vegetarian", "Vegan", etc.
    @SerializedName("allergies") val allergies: List<String>,
    @SerializedName("health_goals") val healthGoals: String,
    @SerializedName("calorie_target_per_meal") val calorieTargetPerMeal: Int
)

data class AnalysisHistoryItem(
    @SerializedName("id") val id: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("calories") val calories: Int,
    @SerializedName("protein_g") val proteinGrams: Float,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("image_url") val imageUrl: String? = null
)

package com.foodinsightai.app.api

import com.foodinsightai.app.models.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

/**
 * ApiService
 * 
 * Retrofit Interface for connecting FoodInsightAI to the Python REST backend.
 * 
 * DESIGN CONSTRAINTS:
 * 1. Uses standard HTTPS REST endpoints.
 * 2. All AI credentials (Groq, HuggingFace, OpenAI, Gemini) are kept exclusively on the Python server.
 * 3. Supports multipart/form-data for camera food photos and gallery image uploads.
 * 4. Integration placeholders are clearly documented with [INTEGRATION_PLACEHOLDER] tags.
 */
interface ApiService {

    /**
     * Complete Food Analysis Pipeline
     * Uploads captured food photo as multipart/form-data.
     * Triggers the full identification, nutritional analysis, allergen checks, and RAG evidence generation.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses e.g. /api/v1/analyze-meal]
     */
    @Multipart
    @POST("food/analyze")
    suspend fun analyzeFoodImage(
        @Part image: MultipartBody.Part,
        @Part("mode") mode: RequestBody? = null, // "photo", "document", "multiple"
        @Part("dietary_profile") dietaryProfile: RequestBody? = null
    ): Response<FoodAnalysisResponse>

    /**
     * Text / Dish Name Food Analysis Pipeline
     */
    @POST("food/analyze-text")
    suspend fun analyzeFoodByName(
        @Body request: Map<String, String>
    ): Response<FoodAnalysisResponse>

    /**
     * Fast Identification Only (Screen 3)
     * Quick visual match with confidence score and detected components.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/identify]
     */
    @Multipart
    @POST("food/identify")
    suspend fun identifyFood(
        @Part image: MultipartBody.Part
    ): Response<FoodIdentificationResponse>

    /**
     * Retrieve Pre-computed Food Analysis by ID (Screens 5-9)
     * Fetches cached or stored analysis for Overview, Ingredients, Nutrition, Safety, Evidence screens.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/food/{id}]
     */
    @GET("food/analysis/{id}")
    suspend fun getFoodAnalysis(
        @Path("id") analysisId: String
    ): Response<FoodAnalysisResponse>

    /**
     * FoodLab - Virtual Food Experimentation (Screen 10)
     * Simulates combining two or more foods to evaluate chemical compatibility,
     * curdling, allergen risks, and nutritional totals.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/foodlab/experiment]
     */
    @POST("foodlab/experiment")
    suspend fun runVirtualExperiment(
        @Body request: FoodLabExperimentRequest
    ): Response<FoodLabExperimentResponse>

    /**
     * FoodLab - Food Catalogue Endpoint
     * Fetches expandable catalogue items for fruits, dairy, grains, etc.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/foodlab/catalogue]
     */
    @GET("foodlab/catalogue")
    suspend fun getFoodCatalogue(
        @Query("category") category: String? = null
    ): Response<List<FoodCatalogueItemModel>>

    /**
     * FoodLab - Experiment PDF Report
     * Generates or fetches downloadable scientific experiment report.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/foodlab/report/{id}]
     */
    @GET("foodlab/report/{id}")
    suspend fun getExperimentReport(
        @Path("id") experimentId: String
    ): Response<ExperimentReportResponse>

    /**
     * Ask Intelligence - Context-Aware Food Q&A (Screen 11)
     * Ask GPT-level or LLM-backed questions with food context and RAG sources.
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/ask]
     */
    @POST("intelligence/ask")
    suspend fun askIntelligence(
        @Body request: AskQuestionRequest
    ): Response<AskQuestionResponse>

    /**
     * User Profile (Screen 12)
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/user/profile]
     */
    @GET("user/profile")
    suspend fun getUserProfile(): Response<UserProfile>

    @PUT("user/profile")
    suspend fun updateUserProfile(
        @Body profile: UserProfile
    ): Response<UserProfile>

    /**
     * User Meal Analysis History (Screen 12)
     * 
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /api/v1/user/history]
     */
    @GET("user/history")
    suspend fun getAnalysisHistory(
        @Query("limit") limit: Int = 20
    ): Response<List<AnalysisHistoryItem>>
}

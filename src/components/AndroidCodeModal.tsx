import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Shield, Server, Download } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ANDROID_FILES: Record<string, { path: string; language: string; content: string }> = {
  'ApiConfig.kt': {
    path: 'app/src/main/java/com/foodinsightai/app/api/ApiConfig.kt',
    language: 'kotlin',
    content: `package com.foodinsightai.app.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

/**
 * ApiConfig
 * 
 * Centralized API configuration for FoodInsightAI Android client.
 * IMPORTANT:
 * - Always enforces HTTPS in production environments.
 * - Private API keys (HuggingFace, Groq, Gemini, OpenAI) MUST REMAIN ON PYTHON BACKEND.
 * - Endpoint paths and parameter names use explicit placeholders until backend documentation is finalized.
 */
object ApiConfig {
    
    /**
     * [AWS_DEPLOYMENT_URL] Full Nutrisicentia Web + API URL loaded by the Android app.
     * Replace with your AWS App Runner / Elastic Beanstalk / ALB HTTPS domain.
     */
    const val AWS_APP_URL: String = "https://your-app.us-east-1.awsapprunner.com"

    /**
     * Base URL for native Retrofit REST API calls (/api/*).
     */
    const val BASE_URL: String = "\$AWS_APP_URL/api/"
    
    // Timeout thresholds in seconds
    const val CONNECT_TIMEOUT_SECONDS: Long = 30L
    const val READ_TIMEOUT_SECONDS: Long = 60L  // Generous timeout for AI vision & RAG pipeline
    const val WRITE_TIMEOUT_SECONDS: Long = 60L // For high-resolution image multipart uploads
    
    // Headers
    const val HEADER_AUTHORIZATION = "Authorization"
    const val HEADER_CONTENT_TYPE = "Content-Type"
    const val HEADER_CLIENT_VERSION = "X-App-Version"
    const val APP_VERSION = "1.0.0"

    /**
     * Creates and configures OkHttpClient with appropriate timeouts,
     * network interceptors, logging, and security headers.
     */
    fun createOkHttpClient(authTokenProvider: (() -> String?)? = null): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .connectTimeout(CONNECT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(READ_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(WRITE_TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val originalRequest = chain.request()
                val requestBuilder = originalRequest.newBuilder()
                    .header(HEADER_CLIENT_VERSION, APP_VERSION)
                
                // Add bearer token if authenticated
                val token = authTokenProvider?.invoke()
                if (!token.isNullOrBlank()) {
                    requestBuilder.header(HEADER_AUTHORIZATION, "Bearer $token")
                }
                
                chain.proceed(requestBuilder.build())
            }
            .addInterceptor(loggingInterceptor)
            .retryOnConnectionFailure(true)
            .build()
    }
}`,
  },
  'ApiService.kt': {
    path: 'app/src/main/java/com/foodinsightai/app/api/ApiService.kt',
    language: 'kotlin',
    content: `package com.foodinsightai.app.api

import com.foodinsightai.app.models.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

/**
 * ApiService
 * 
 * Retrofit Interface for connecting FoodInsightAI to the Python REST backend.
 */
interface ApiService {

    /**
     * Complete Food Analysis Pipeline
     * Uploads captured food photo as multipart/form-data.
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses e.g. /food/analyze]
     */
    @Multipart
    @POST("food/analyze")
    suspend fun analyzeFoodImage(
        @Part image: MultipartBody.Part,
        @Part("mode") mode: RequestBody? = null,
        @Part("dietary_profile") dietaryProfile: RequestBody? = null
    ): Response<FoodAnalysisResponse>

    /**
     * Fast Identification Only (Screen 3)
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /food/identify]
     */
    @Multipart
    @POST("food/identify")
    suspend fun identifyFood(
        @Part image: MultipartBody.Part
    ): Response<FoodIdentificationResponse>

    /**
     * Retrieve Food Analysis by ID (Screens 5-9)
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /food/analysis/{id}]
     */
    @GET("food/analysis/{id}")
    suspend fun getFoodAnalysis(
        @Path("id") analysisId: String
    ): Response<FoodAnalysisResponse>

    /**
     * FoodLab - Virtual Food Experimentation (Screen 10)
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /foodlab/experiment]
     */
    @POST("foodlab/experiment")
    suspend fun runVirtualExperiment(
        @Body request: FoodLabExperimentRequest
    ): Response<FoodLabExperimentResponse>

    @GET("foodlab/catalogue")
    suspend fun getFoodCatalogue(
        @Query("category") category: String? = null
    ): Response<List<FoodCatalogueItemModel>>

    @GET("foodlab/report/{id}")
    suspend fun getExperimentReport(
        @Path("id") experimentId: String
    ): Response<ExperimentReportResponse>

    /**
     * Ask Intelligence Context Q&A (Screen 11)
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /intelligence/ask]
     */
    @POST("intelligence/ask")
    suspend fun askIntelligence(
        @Body request: AskQuestionRequest
    ): Response<AskQuestionResponse>

    /**
     * User Profile & History (Screen 12)
     * [INTEGRATION_PLACEHOLDER: Update endpoint path if your Python backend uses /user/profile]
     */
    @GET("user/profile")
    suspend fun getUserProfile(): Response<UserProfile>

    @PUT("user/profile")
    suspend fun updateUserProfile(
        @Body profile: UserProfile
    ): Response<UserProfile>

    @GET("user/history")
    suspend fun getAnalysisHistory(
        @Query("limit") limit: Int = 20
    ): Response<List<AnalysisHistoryItem>>
}`,
  },
  'FoodInsightModels.kt': {
    path: 'app/src/main/java/com/foodinsightai/app/models/FoodInsightModels.kt',
    language: 'kotlin',
    content: `package com.foodinsightai.app.models

import com.google.gson.annotations.SerializedName

data class FoodAnalysisResponse(
    @SerializedName("id") val analysisId: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("cuisine") val cuisine: String? = null,
    @SerializedName("category") val category: String? = null,
    @SerializedName("image_url") val imageUrl: String? = null,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("serving_size") val servingSize: String? = "250g",
    @SerializedName("overall_assessment") val overallAssessment: OverallAssessment,
    @SerializedName("nutrition") val nutrition: NutritionData,
    @SerializedName("ingredients") val ingredients: List<IngredientItem>,
    @SerializedName("safety") val safety: SafetyAssessment,
    @SerializedName("evidence") val evidence: List<EvidenceSource>,
    @SerializedName("profile_match") val profileMatch: ProfileMatchInfo? = null,
    @SerializedName("created_at") val createdAt: String? = null
)

data class FoodIdentificationResponse(
    @SerializedName("detected_food") val detectedFood: String,
    @SerializedName("confidence") val confidence: Float,
    @SerializedName("cuisine") val cuisine: String,
    @SerializedName("category") val category: String,
    @SerializedName("possible_matches") val possibleMatches: List<FoodIdentificationMatch>,
    @SerializedName("detected_components") val detectedComponents: List<DetectedComponent>
)

data class FoodIdentificationMatch(
    @SerializedName("name") val name: String,
    @SerializedName("confidence") val confidence: Float
)

data class DetectedComponent(
    @SerializedName("name") val name: String,
    @SerializedName("prominence") val prominence: String
)

data class OverallAssessment(
    @SerializedName("match_status") val matchStatus: String,
    @SerializedName("score_percentage") val scorePercentage: Int,
    @SerializedName("summary") val summary: String,
    @SerializedName("nutritional_value_summary") val nutritionalValueSummary: String,
    @SerializedName("safety_status_summary") val safetyStatusSummary: String
)

data class ProfileMatchInfo(
    @SerializedName("dietary_fit") val dietaryFit: String,
    @SerializedName("calorie_fit") val calorieFit: String,
    @SerializedName("notes") val notes: String? = null
)

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

data class IngredientItem(
    @SerializedName("id") val id: String? = null,
    @SerializedName("name") val name: String,
    @SerializedName("subname") val subname: String? = null,
    @SerializedName("percentage") val percentage: Int,
    @SerializedName("is_key_ingredient") val isKeyIngredient: Boolean = false,
    @SerializedName("description") val description: String? = null
)

data class SafetyAssessment(
    @SerializedName("overall_risk") val overallRisk: String,
    @SerializedName("risk_summary") val riskSummary: String,
    @SerializedName("allergens") val allergens: List<AllergenStatus>,
    @SerializedName("quality_checks") val qualityChecks: List<QualityCheckItem>,
    @SerializedName("risk_factors") val riskFactors: List<RiskFactorItem>
)

data class AllergenStatus(
    @SerializedName("allergen_name") val allergenName: String,
    @SerializedName("is_present") val isPresent: Boolean,
    @SerializedName("warning_level") val warningLevel: String? = null
)

data class QualityCheckItem(
    @SerializedName("title") val title: String,
    @SerializedName("is_safe") val isSafe: Boolean
)

data class RiskFactorItem(
    @SerializedName("factor") val factor: String,
    @SerializedName("severity") val severity: String
)

data class EvidenceSource(
    @SerializedName("id") val id: String,
    @SerializedName("source_name") val sourceName: String,
    @SerializedName("category") val category: String,
    @SerializedName("snippet") val snippet: String,
    @SerializedName("reference_url") val referenceUrl: String? = null
)

data class FoodCatalogueItemModel(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("category") val category: String,
    @SerializedName("default_grams") val defaultGrams: Int,
    @SerializedName("calories_per_100g") val caloriesPer100g: Float,
    @SerializedName("protein_per_100g") val proteinPer100g: Float,
    @SerializedName("carbs_per_100g") val carbsPer100g: Float,
    @SerializedName("fat_per_100g") val fatPer100g: Float,
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
    @SerializedName("verdict") val verdict: String,
    @SerializedName("verdict_title") val verdictTitle: String,
    @SerializedName("verdict_subtitle") val verdictSubtitle: String,
    @SerializedName("risk_weight") val riskWeight: Int,
    @SerializedName("safety_risk_weight") val safetyRiskWeight: Int,
    @SerializedName("health_risk_weight") val healthRiskWeight: Int,
    @SerializedName("key_reason") val keyReason: String,
    @SerializedName("final_conclusion") val finalConclusion: String
)

data class AskQuestionRequest(
    @SerializedName("food_id") val foodId: String? = null,
    @SerializedName("food_name") val foodName: String? = null,
    @SerializedName("question") val question: String
)

data class AskQuestionResponse(
    @SerializedName("answer") val answer: String,
    @SerializedName("sources") val sources: List<String>? = emptyList(),
    @SerializedName("related_questions") val relatedQuestions: List<String>? = emptyList()
)

data class UserProfile(
    @SerializedName("id") val id: String,
    @SerializedName("name") val name: String,
    @SerializedName("dietary_preference") val dietaryPreference: String,
    @SerializedName("allergies") val allergies: List<String>,
    @SerializedName("health_goals") val healthGoals: String,
    @SerializedName("calorie_target_per_meal") val calorieTargetPerMeal: Int
)

data class AnalysisHistoryItem(
    @SerializedName("id") val id: String,
    @SerializedName("food_name") val foodName: String,
    @SerializedName("calories") val calories: Int,
    @SerializedName("protein_g") val proteinGrams: Float,
    @SerializedName("timestamp") val timestamp: String
)`,
  },
  'FoodRepository.kt': {
    path: 'app/src/main/java/com/foodinsightai/app/repository/FoodRepository.kt',
    language: 'kotlin',
    content: `package com.foodinsightai.app.repository

import android.content.Context
import android.net.Uri
import com.foodinsightai.app.api.ApiService
import com.foodinsightai.app.api.NetworkResult
import com.foodinsightai.app.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Response
import java.io.File
import java.net.SocketTimeoutException
import java.net.UnknownHostException

class FoodRepository(
    private val apiService: ApiService,
    private val context: Context? = null
) {

    suspend fun analyzeFood(imageFile: File, mode: String = "photo"): NetworkResult<FoodAnalysisResponse> =
        withContext(Dispatchers.IO) {
            try {
                val requestFile = imageFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
                val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestFile)
                val modePart = mode.toRequestBody("text/plain".toMediaTypeOrNull())

                val response = apiService.analyzeFoodImage(imagePart, modePart)
                handleResponse(response)
            } catch (e: Exception) {
                handleException(e)
            }
        }

    suspend fun simulateFoodModification(
        foodId: String,
        originalIngredient: String,
        replacementIngredient: String,
        quantityGrams: Int
    ): NetworkResult<FoodLabSimulationResponse> = withContext(Dispatchers.IO) {
        try {
            val request = FoodLabSimulationRequest(foodId, originalIngredient, replacementIngredient, quantityGrams)
            val response = apiService.simulateFoodModification(request)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    suspend fun askIntelligence(
        foodId: String?,
        foodName: String?,
        question: String
    ): NetworkResult<AskQuestionResponse> = withContext(Dispatchers.IO) {
        try {
            val request = AskQuestionRequest(foodId, foodName, question)
            val response = apiService.askIntelligence(request)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    private fun <T> handleResponse(response: Response<T>): NetworkResult<T> {
        return if (response.isSuccessful && response.body() != null) {
            NetworkResult.Success(response.body()!!)
        } else {
            val message = when (response.code()) {
                400 -> "Bad request. Please verify food image format."
                401 -> "Session expired. Please log in again."
                404 -> "Food analysis resource not found."
                413 -> "Image size exceeds allowed limits."
                500 -> "Internal error on Python backend."
                else -> "Server returned code \${response.code()}"
            }
            NetworkResult.Error(message = message, statusCode = response.code())
        }
    }

    private fun <T> handleException(e: Throwable): NetworkResult<T> {
        val userMsg = when (e) {
            is SocketTimeoutException -> "Analysis connection timed out. AI pipeline is working."
            is UnknownHostException -> "Cannot connect to server. Check your network or base URL."
            else -> e.localizedMessage ?: "Unexpected network error occurred."
        }
        return NetworkResult.Error(message = userMsg, cause = e)
    }
}`,
  },
  'FoodLabViewModel.kt': {
    path: 'app/src/main/java/com/foodinsightai/app/viewmodels/FoodLabViewModel.kt',
    language: 'kotlin',
    content: `package com.foodinsightai.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.foodinsightai.app.api.NetworkResult
import com.foodinsightai.app.models.*
import com.foodinsightai.app.repository.FoodRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class FoodLabViewModel(
    private val repository: FoodRepository
) : ViewModel() {

    private val _experimentState = MutableStateFlow<NetworkResult<FoodLabExperimentResponse>>(NetworkResult.Idle)
    val experimentState: StateFlow<NetworkResult<FoodLabExperimentResponse>> = _experimentState.asStateFlow()

    private val _selectedFoods = MutableStateFlow<List<SelectedFoodRequestItem>>(
        listOf(
            SelectedFoodRequestItem("d_milk", "Milk", 100),
            SelectedFoodRequestItem("f_orange", "Orange", 100)
        )
    )
    val selectedFoods: StateFlow<List<SelectedFoodRequestItem>> = _selectedFoods.asStateFlow()

    private val _productName = MutableStateFlow("Orange Milk Drink")
    val productName: StateFlow<String> = _productName.asStateFlow()

    fun runVirtualExperiment() {
        val request = FoodLabExperimentRequest(
            experimentName = _productName.value,
            selectedFoods = _selectedFoods.value,
            researchObjective = "Complete scientific assessment"
        )
        viewModelScope.launch {
            _experimentState.value = NetworkResult.Loading("Running virtual experiment...")
            val result = repository.runVirtualExperiment(request)
            _experimentState.value = result
        }
    }
}`,
  },
  'build.gradle.kts': {
    path: 'app/build.gradle.kts',
    language: 'gradle',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.foodinsightai.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.foodinsightai.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // Retrofit 2 & OkHttp 3
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
}`,
  },
  'AndroidManifest.xml': {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:name=".FoodInsightApp"
        android:allowBackup="true"
        android:label="FoodInsightAI"
        android:theme="@style/Theme.FoodInsightAI"
        android:usesCleartextTraffic="false"> <!-- Enforces HTTPS -->

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,
  },
};

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeFile, setActiveFile] = useState<string>('ApiConfig.kt');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFileData = ANDROID_FILES[activeFile];

  const handleCopy = () => {
    if (currentFileData) {
      navigator.clipboard.writeText(currentFileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    // Generate a downloadable text file summary or json
    const combinedContent = Object.entries(ANDROID_FILES)
      .map(([fileName, data]) => `// ==========================================\n// File: ${data.path}\n// ==========================================\n\n${data.content}\n\n`)
      .join('\n');
    
    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FoodInsightAI_Android_Architecture.kt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[88vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-white">FoodInsightAI Native Android Architecture</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                  Kotlin & Compose
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Retrofit 2 · OkHttp 3 · Sealed NetworkResult · ViewModels · StateFlow · Zero AI Secrets on Client
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              title="Download combined bundle"
            >
              <Download className="w-3.5 h-3.5" />
              Export Architecture
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Security & Architecture Highlights Banner */}
        <div className="bg-emerald-950/40 border-b border-emerald-900/50 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Security Contract Enforced:</strong> Private AI keys (HuggingFace, Groq, OpenAI) remain securely on your Python backend. Client communicates strictly over HTTPS.
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] shrink-0">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span>Base URL: <code className="text-slate-300 font-mono">ApiConfig.BASE_URL</code></span>
          </div>
        </div>

        {/* Body: Left Sidebar File Tabs + Right Code Viewer */}
        <div className="flex flex-1 min-h-0">
          
          {/* File Tab Sidebar */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto space-y-1">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 px-3 py-1">
              API & Network
            </div>
            {['ApiConfig.kt', 'ApiService.kt', 'FoodInsightModels.kt', 'FoodRepository.kt', 'FoodLabViewModel.kt'].map((fileName) => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                  activeFile === fileName
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{fileName}</span>
                {activeFile === fileName && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            ))}

            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 px-3 pt-3 pb-1">
              Configuration & Build
            </div>
            {['build.gradle.kts', 'AndroidManifest.xml'].map((fileName) => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                  activeFile === fileName
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{fileName}</span>
                {activeFile === fileName && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>
            ))}
          </div>

          {/* Main Code Viewer */}
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
            {/* File Path & Copy Action Bar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-900/90 text-xs">
              <span className="font-mono text-slate-400 truncate">
                {currentFileData.path}
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            {/* Code Pre Container */}
            <div className="flex-1 p-5 overflow-auto bg-slate-950 font-mono text-xs leading-relaxed text-slate-200 selection:bg-emerald-500/30">
              <pre className="whitespace-pre">{currentFileData.content}</pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>All files generated at <code className="text-slate-300">/android/app/src/main/java/...</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

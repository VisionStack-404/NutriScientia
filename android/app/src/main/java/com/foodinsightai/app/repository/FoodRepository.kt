package com.foodinsightai.app.repository

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
import java.io.FileOutputStream
import java.net.SocketTimeoutException
import java.net.UnknownHostException

/**
 * FoodRepository
 * 
 * Repository implementation orchestrating network calls, multipart preparation,
 * exception handling, and error message localization.
 */
class FoodRepository(
    private val apiService: ApiService,
    private val context: Context? = null
) {

    /**
     * Upload food photo for complete AI analysis (Overview, Ingredients, Nutrition, Safety, Evidence)
     */
    suspend fun analyzeFood(
        imageFile: File,
        mode: String = "photo",
        dietaryProfileJson: String? = null
    ): NetworkResult<FoodAnalysisResponse> = withContext(Dispatchers.IO) {
        try {
            val requestFile = imageFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
            val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestFile)
            val modePart = mode.toRequestBody("text/plain".toMediaTypeOrNull())
            val profilePart = dietaryProfileJson?.toRequestBody("text/plain".toMediaTypeOrNull())

            val response = apiService.analyzeFoodImage(imagePart, modePart, profilePart)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    /**
     * Fast identification endpoint for Screen 3
     */
    suspend fun identifyFood(imageFile: File): NetworkResult<FoodIdentificationResponse> = withContext(Dispatchers.IO) {
        try {
            val requestFile = imageFile.asRequestBody("image/jpeg".toMediaTypeOrNull())
            val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestFile)
            val response = apiService.identifyFood(imagePart)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    /**
     * FoodLab Virtual Experiment Simulation (Screen 10)
     */
    suspend fun runVirtualExperiment(
        request: FoodLabExperimentRequest
    ): NetworkResult<FoodLabExperimentResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.runVirtualExperiment(request)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    /**
     * FoodLab Food Catalogue
     */
    suspend fun getFoodCatalogue(category: String? = null): NetworkResult<List<FoodCatalogueItemModel>> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getFoodCatalogue(category)
                handleResponse(response)
            } catch (e: Exception) {
                handleException(e)
            }
        }

    /**
     * FoodLab PDF Report
     */
    suspend fun getExperimentReport(experimentId: String): NetworkResult<ExperimentReportResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.getExperimentReport(experimentId)
                handleResponse(response)
            } catch (e: Exception) {
                handleException(e)
            }
        }

    /**
     * Ask Intelligence Context Q&A (Screen 11)
     */
    suspend fun askIntelligence(
        foodId: String?,
        foodName: String?,
        question: String
    ): NetworkResult<AskQuestionResponse> = withContext(Dispatchers.IO) {
        try {
            val request = AskQuestionRequest(
                foodId = foodId,
                foodName = foodName,
                question = question
            )
            val response = apiService.askIntelligence(request)
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    /**
     * User Profile & History (Screen 12)
     */
    suspend fun getUserProfile(): NetworkResult<UserProfile> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getUserProfile()
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    suspend fun getAnalysisHistory(): NetworkResult<List<AnalysisHistoryItem>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getAnalysisHistory()
            handleResponse(response)
        } catch (e: Exception) {
            handleException(e)
        }
    }

    /**
     * Converts Android Content Uri from Gallery / Camera into a temporary File for multipart upload
     */
    fun createTempFileFromUri(uri: Uri): File? {
        val ctx = context ?: return null
        return try {
            val inputStream = ctx.contentResolver.openInputStream(uri) ?: return null
            val tempFile = File.createTempFile("food_capture_", ".jpg", ctx.cacheDir)
            FileOutputStream(tempFile).use { outputStream ->
                inputStream.copyTo(outputStream)
            }
            tempFile
        } catch (e: Exception) {
            null
        }
    }

    private fun <T> handleResponse(response: Response<T>): NetworkResult<T> {
        return if (response.isSuccessful && response.body() != null) {
            NetworkResult.Success(response.body()!!)
        } else {
            val errorBody = response.errorBody()?.string()
            val message = when (response.code()) {
                400 -> "Bad request. Please verify food image format."
                401 -> "Authentication required. Session expired."
                404 -> "Analysis resource or endpoint not found on backend."
                413 -> "Image file size exceeds server limits."
                422 -> "Food image could not be processed by vision model."
                500 -> "Internal AI server error occurred on Python backend."
                503 -> "AI service is currently overloaded. Please try again shortly."
                else -> errorBody ?: "Request failed with HTTP status ${response.code()}"
            }
            NetworkResult.Error(message = message, statusCode = response.code())
        }
    }

    private fun <T> handleException(e: Throwable): NetworkResult<T> {
        val userMessage = when (e) {
            is SocketTimeoutException -> "Analysis connection timed out. The AI pipeline is processing heavy models; please retry."
            is UnknownHostException -> "Cannot connect to server. Check your network or verify the backend base URL."
            else -> e.localizedMessage ?: "An unexpected network error occurred."
        }
        return NetworkResult.Error(
            message = userMessage,
            cause = e,
            isNetworkTimeout = e is SocketTimeoutException
        )
    }
}

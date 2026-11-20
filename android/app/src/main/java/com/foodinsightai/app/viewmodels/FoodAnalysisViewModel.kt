package com.foodinsightai.app.viewmodels

import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.foodinsightai.app.api.NetworkResult
import com.foodinsightai.app.models.FoodAnalysisResponse
import com.foodinsightai.app.models.FoodIdentificationResponse
import com.foodinsightai.app.repository.FoodRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.io.File

/**
 * PipelineStep represents the transparent multi-step AI pipeline (Screen 4)
 */
data class PipelineStep(
    val title: String,
    val subtitle: String,
    val status: StepStatus = StepStatus.PENDING
)

enum class StepStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED
}

/**
 * FoodAnalysisViewModel
 * 
 * Manages states across Screen 2 (Capture), Screen 3 (Identification),
 * Screen 4 (Pipeline Progress), and Screens 5-9 (Overview, Ingredients, Nutrition, Safety, Evidence).
 */
class FoodAnalysisViewModel(
    private val repository: FoodRepository
) : ViewModel() {

    // Identification State (Screen 3)
    private val _identificationState = MutableStateFlow<NetworkResult<FoodIdentificationResponse>>(NetworkResult.Idle)
    val identificationState: StateFlow<NetworkResult<FoodIdentificationResponse>> = _identificationState.asStateFlow()

    // Full Analysis State (Screens 4, 5, 6, 7, 8, 9)
    private val _analysisState = MutableStateFlow<NetworkResult<FoodAnalysisResponse>>(NetworkResult.Idle)
    val analysisState: StateFlow<NetworkResult<FoodAnalysisResponse>> = _analysisState.asStateFlow()

    // Selected or captured image
    private val _selectedImageFile = MutableStateFlow<File?>(null)
    val selectedImageFile: StateFlow<File?> = _selectedImageFile.asStateFlow()

    // Real-time Pipeline Progress Steps for Screen 4
    private val _pipelineSteps = MutableStateFlow<List<PipelineStep>>(initialPipelineSteps())
    val pipelineSteps: StateFlow<List<PipelineStep>> = _pipelineSteps.asStateFlow()

    /**
     * Called when a photo is taken via Camera or selected from Gallery (Screen 2)
     */
    fun onImageSelected(imageFile: File) {
        _selectedImageFile.value = imageFile
        // Automatically start identification or analysis
        startFoodIdentification(imageFile)
    }

    fun onImageUriSelected(uri: Uri) {
        val file = repository.createTempFileFromUri(uri)
        if (file != null) {
            onImageSelected(file)
        } else {
            _identificationState.value = NetworkResult.Error("Unable to load selected photo from gallery.")
        }
    }

    /**
     * Fast identification (Screen 3)
     */
    fun startFoodIdentification(file: File) {
        viewModelScope.launch {
            _identificationState.value = NetworkResult.Loading("Identifying food image...")
            val result = repository.identifyFood(file)
            _identificationState.value = result
        }
    }

    /**
     * Trigger the full 7-step analysis pipeline (Screen 4 -> Screen 5)
     */
    fun runFullAnalysisPipeline(file: File? = _selectedImageFile.value) {
        if (file == null) {
            _analysisState.value = NetworkResult.Error("No food photo provided for analysis.")
            return
        }

        viewModelScope.launch {
            _analysisState.value = NetworkResult.Loading("Starting deep AI food analysis...")
            resetPipelineSteps()

            // Simulate progress step transitions alongside backend response
            val progressJob = launch {
                for (index in _pipelineSteps.value.indices) {
                    updateStepStatus(index, StepStatus.IN_PROGRESS)
                    delay(500)
                    updateStepStatus(index, StepStatus.COMPLETED)
                }
            }

            // Real backend multipart API call
            val result = repository.analyzeFood(imageFile = file)
            progressJob.join() // Ensure pipeline UI catches up
            _analysisState.value = result
        }
    }

    fun retryAnalysis() {
        val file = _selectedImageFile.value
        if (file != null) {
            runFullAnalysisPipeline(file)
        }
    }

    fun clearState() {
        _identificationState.value = NetworkResult.Idle
        _analysisState.value = NetworkResult.Idle
        _selectedImageFile.value = null
        resetPipelineSteps()
    }

    private fun updateStepStatus(stepIndex: Int, status: StepStatus) {
        val currentList = _pipelineSteps.value.toMutableList()
        if (stepIndex in currentList.indices) {
            currentList[stepIndex] = currentList[stepIndex].copy(status = status)
            _pipelineSteps.value = currentList
        }
    }

    private fun resetPipelineSteps() {
        _pipelineSteps.value = initialPipelineSteps()
    }

    private fun initialPipelineSteps(): List<PipelineStep> = listOf(
        PipelineStep("Understanding food image", "Detecting cuisine and dish"),
        PipelineStep("Resolving ingredients", "Identifying food composition"),
        PipelineStep("Retrieving nutrition data", "From trusted food databases"),
        PipelineStep("Checking safety and allergens", "Analyzing potential risks"),
        PipelineStep("Finding relevant evidence", "From scientific sources"),
        PipelineStep("Personalizing for your profile", "Applying your dietary preferences"),
        PipelineStep("Generating insights", "Preparing your detailed analysis")
    )
}

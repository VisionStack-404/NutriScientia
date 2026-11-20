package com.foodinsightai.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.foodinsightai.app.api.NetworkResult
import com.foodinsightai.app.models.*
import com.foodinsightai.app.repository.FoodRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * FoodLabViewModel
 * 
 * Manages the multi-step virtual food experimentation laboratory workflow:
 * 1. Catalogue selection & multi-food state
 * 2. Gram scaling & product naming
 * 3. Research objective & nutritional focus configuration
 * 4. 5-step animated laboratory simulation pipeline
 * 5. Multi-tab results (Overview, Nutrition, Safety, Health, Evidence)
 * 6. Scientific report PDF generation
 */
class FoodLabViewModel(
    private val repository: FoodRepository
) : ViewModel() {

    // Experiment State
    private val _experimentState = MutableStateFlow<NetworkResult<FoodLabExperimentResponse>>(NetworkResult.Idle)
    val experimentState: StateFlow<NetworkResult<FoodLabExperimentResponse>> = _experimentState.asStateFlow()

    // Catalogue items loaded from backend (or fallback)
    private val _catalogueItems = MutableStateFlow<NetworkResult<List<FoodCatalogueItemModel>>>(NetworkResult.Idle)
    val catalogueItems: StateFlow<NetworkResult<List<FoodCatalogueItemModel>>> = _catalogueItems.asStateFlow()

    // Multi-selected foods
    private val _selectedFoods = MutableStateFlow<List<SelectedFoodRequestItem>>(
        listOf(
            SelectedFoodRequestItem("d_milk", "Milk", 100),
            SelectedFoodRequestItem("f_orange", "Orange", 100)
        )
    )
    val selectedFoods: StateFlow<List<SelectedFoodRequestItem>> = _selectedFoods.asStateFlow()

    private val _productName = MutableStateFlow("Orange Milk Drink")
    val productName: StateFlow<String> = _productName.asStateFlow()

    private val _researchObjective = MutableStateFlow("Complete scientific assessment")
    val researchObjective: StateFlow<String> = _researchObjective.asStateFlow()

    private val _nutritionalFocus = MutableStateFlow<List<String>>(listOf("Analyse complete nutrition"))
    val nutritionalFocus: StateFlow<List<String>> = _nutritionalFocus.asStateFlow()

    // Simulation progress stage (1 to 5)
    private val _simulationStage = MutableStateFlow(0)
    val simulationStage: StateFlow<Int> = _simulationStage.asStateFlow()

    fun updateProductName(name: String) {
        _productName.value = name
    }

    fun updateObjective(objective: String) {
        _researchObjective.value = objective
    }

    fun toggleFocus(focus: String) {
        val current = _nutritionalFocus.value.toMutableList()
        if (current.contains(focus)) {
            current.remove(focus)
        } else {
            current.add(focus)
        }
        _nutritionalFocus.value = current
    }

    fun updateFoodQuantity(foodId: String, deltaGrams: Int) {
        val updated = _selectedFoods.value.map { item ->
            if (item.foodId == foodId) {
                val newQty = (item.quantityGrams + deltaGrams).coerceIn(25, 500)
                item.copy(quantityGrams = newQty)
            } else {
                item
            }
        }
        _selectedFoods.value = updated
    }

    fun toggleFoodSelection(foodId: String, foodName: String, defaultGrams: Int) {
        val current = _selectedFoods.value.toMutableList()
        val existingIndex = current.indexOfFirst { it.foodId == foodId }
        if (existingIndex >= 0) {
            if (current.size > 2) {
                current.removeAt(existingIndex)
            }
        } else {
            current.add(SelectedFoodRequestItem(foodId, foodName, defaultGrams))
        }
        _selectedFoods.value = current
    }

    fun runVirtualExperiment() {
        val request = FoodLabExperimentRequest(
            experimentName = _productName.value,
            selectedFoods = _selectedFoods.value,
            researchObjective = _researchObjective.value,
            nutritionalFocus = _nutritionalFocus.value
        )

        viewModelScope.launch {
            _experimentState.value = NetworkResult.Loading("Starting virtual laboratory simulation...")
            _simulationStage.value = 0

            // Animate 5 laboratory stages
            for (step in 1..5) {
                _simulationStage.value = step
                delay(600)
            }

            // Real backend REST API call
            val result = repository.runVirtualExperiment(request)
            _experimentState.value = result
        }
    }
}

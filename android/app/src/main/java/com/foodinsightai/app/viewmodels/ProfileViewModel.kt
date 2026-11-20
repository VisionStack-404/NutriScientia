package com.foodinsightai.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.foodinsightai.app.api.NetworkResult
import com.foodinsightai.app.models.AnalysisHistoryItem
import com.foodinsightai.app.models.UserProfile
import com.foodinsightai.app.repository.FoodRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * ProfileViewModel
 * 
 * Manages Screen 12 (User Profile & History).
 * Handles user dietary preference synchronization and past analysis logs.
 */
class ProfileViewModel(
    private val repository: FoodRepository
) : ViewModel() {

    private val _profileState = MutableStateFlow<NetworkResult<UserProfile>>(NetworkResult.Idle)
    val profileState: StateFlow<NetworkResult<UserProfile>> = _profileState.asStateFlow()

    private val _historyState = MutableStateFlow<NetworkResult<List<AnalysisHistoryItem>>>(NetworkResult.Idle)
    val historyState: StateFlow<NetworkResult<List<AnalysisHistoryItem>>> = _historyState.asStateFlow()

    init {
        loadUserProfile()
        loadAnalysisHistory()
    }

    fun loadUserProfile() {
        viewModelScope.launch {
            _profileState.value = NetworkResult.Loading("Fetching user profile...")
            val result = repository.getUserProfile()
            _profileState.value = result
        }
    }

    fun loadAnalysisHistory() {
        viewModelScope.launch {
            _historyState.value = NetworkResult.Loading("Fetching meal history...")
            val result = repository.getAnalysisHistory()
            _historyState.value = result
        }
    }
}

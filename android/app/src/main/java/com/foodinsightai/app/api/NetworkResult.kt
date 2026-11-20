package com.foodinsightai.app.api

/**
 * NetworkResult
 * 
 * Sealed class hierarchy for handling asynchronous network states
 * across ViewModels, StateFlow, and UI layers.
 */
sealed class NetworkResult<out T> {
    object Idle : NetworkResult<Nothing>()
    
    data class Loading(
        val progressMessage: String? = null,
        val step: Int = 0,
        val totalSteps: Int = 7
    ) : NetworkResult<Nothing>()
    
    data class Success<out T>(
        val data: T,
        val cached: Boolean = false
    ) : NetworkResult<T>()
    
    data class Error(
        val message: String,
        val statusCode: Int? = null,
        val cause: Throwable? = null,
        val isNetworkTimeout: Boolean = false
    ) : NetworkResult<Nothing>()

    val isSuccessful: Boolean get() = this is Success
    val isLoading: Boolean get() = this is Loading
}

package com.foodinsightai.app.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.foodinsightai.app.api.NetworkResult
import com.foodinsightai.app.models.AskQuestionResponse
import com.foodinsightai.app.repository.FoodRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ChatMessage(
    val sender: String, // "user" or "ai"
    val text: String,
    val sources: List<String> = emptyList(),
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * AskIntelligenceViewModel
 * 
 * Manages Screen 11 (Ask Intelligence - GPT-Level Food Q&A).
 * Maintains question history, suggested questions, and response streaming/loading states.
 */
class AskIntelligenceViewModel(
    private val repository: FoodRepository
) : ViewModel() {

    private val _askState = MutableStateFlow<NetworkResult<AskQuestionResponse>>(NetworkResult.Idle)
    val askState: StateFlow<NetworkResult<AskQuestionResponse>> = _askState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(initialMessages())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    val suggestedQuestions = listOf(
        "Why is the protein high?",
        "Is this suitable for weight loss?",
        "What are the health benefits?",
        "Are there any long-term risks?"
    )

    fun sendQuestion(questionText: String, foodId: String? = "biryani_01", foodName: String? = "Paneer Biryani") {
        if (questionText.isBlank()) return

        val userMsg = ChatMessage(sender = "user", text = questionText)
        _messages.value = _messages.value + userMsg

        viewModelScope.launch {
            _askState.value = NetworkResult.Loading("Analyzing context and generating answer...")
            val result = repository.askIntelligence(
                foodId = foodId,
                foodName = foodName,
                question = questionText
            )
            _askState.value = result

            if (result is NetworkResult.Success) {
                val aiMsg = ChatMessage(
                    sender = "ai",
                    text = result.data.answer,
                    sources = result.data.sources ?: emptyList()
                )
                _messages.value = _messages.value + aiMsg
            }
        }
    }

    private fun initialMessages(): List<ChatMessage> = listOf(
        ChatMessage(
            sender = "ai",
            text = "Hello! I am your Food Intelligence Assistant. You can ask me anything about this meal's nutritional content, ingredients, health implications, or preparation alternatives."
        )
    )
}

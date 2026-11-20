package com.foodinsightai.app.api

import com.google.gson.Gson
import com.google.gson.GsonBuilder
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

/**
 * RetrofitClient
 * 
 * Thread-safe Singleton provider for Retrofit and ApiService instance.
 */
object RetrofitClient {

    private val gson: Gson = GsonBuilder()
        .setLenient()
        .create()

    @Volatile
    private var instance: ApiService? = null

    fun getApiService(authTokenProvider: (() -> String?)? = null): ApiService {
        return instance ?: synchronized(this) {
            instance ?: buildRetrofit(authTokenProvider).create(ApiService::class.java).also {
                instance = it
            }
        }
    }

    private fun buildRetrofit(authTokenProvider: (() -> String?)?): Retrofit {
        return Retrofit.Builder()
            .baseUrl(ApiConfig.BASE_URL)
            .client(ApiConfig.createOkHttpClient(authTokenProvider))
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
    }

    /**
     * Resets the singleton instance when baseUrl or authentication configuration changes dynamically.
     */
    fun resetInstance() {
        synchronized(this) {
            instance = null
        }
    }
}

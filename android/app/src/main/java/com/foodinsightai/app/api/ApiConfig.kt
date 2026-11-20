package com.foodinsightai.app.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

/**
 * ApiConfig
 *
 * Centralized AWS & Backend configuration for the Nutrisicentia Android app.
 * IMPORTANT:
 * - Always enforce HTTPS in production environments (AWS App Runner / CloudFront / ALB with ACM).
 * - Private AI keys (GEMINI_API_KEY, etc.) MUST REMAIN ON YOUR AWS BACKEND — never inside the APK.
 */
object ApiConfig {

    /**
     * [BACKEND_APP_URL] Full Nutrisicentia Web + API URL loaded by the Android app.
     *
     * Currently set for Option B (Desktop Local Server -> Android Studio Emulator):
     *   "http://10.0.2.2:3000" connects the Android Emulator directly to localhost:3000 on your desktop.
     *   (If testing on a real USB phone on Wi-Fi, replace with "http://<YOUR_PC_LAN_IP>:3000".)
     *
     * When you deploy to AWS (App Runner / EC2 + HTTPS) to share the APK with other users,
     * replace this with your AWS HTTPS URL and set android:usesCleartextTraffic="false" in AndroidManifest.xml:
     *   Example: "https://xxxxxxxxxx.us-east-1.awsapprunner.com"
     */
    const val AWS_APP_URL: String = "http://10.0.2.2:3000"

    /**
     * Load the exact Nutrisicentia UI directly from bundled APK assets (android/app/src/main/assets/)
     * via WebViewAssetLoader for instant startup and smooth 60fps performance, while still sending
     * AI & FoodLab requests to AWS_APP_URL. Set to false only if testing live Vite HMR.
     */
    const val USE_BUNDLED_OFFLINE_UI: Boolean = true

    /**
     * Base URL for native Retrofit REST API calls (/api/*).
     * Keep the trailing slash.
     */
    const val BASE_URL: String = "$AWS_APP_URL/api/"
    
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
}

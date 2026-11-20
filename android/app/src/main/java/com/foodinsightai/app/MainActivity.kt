package com.foodinsightai.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.view.View
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import com.foodinsightai.app.api.ApiConfig
import java.io.File

private const val PREFS_NAME = "nutrisicentia_prefs"
private const val KEY_CUSTOM_SERVER_URL = "custom_aws_server_url"
private const val BUNDLED_APP_ORIGIN = "https://appassets.androidplatform.net"
private const val BUNDLED_APP_ENTRY = "$BUNDLED_APP_ORIGIN/index.html"

class NutrisicentiaNativeBridge(private val apiUrlProvider: () -> String) {
    @JavascriptInterface
    fun getApiBaseUrl(): String = apiUrlProvider()

    @JavascriptInterface
    fun isNativeAndroid(): Boolean = true
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NutrisicentiaAndroidApp()
        }
    }
}

private fun resolveMimeType(path: String): String {
    val lower = path.lowercase()
    return when {
        lower.endsWith(".html") -> "text/html"
        lower.endsWith(".js") || lower.endsWith(".mjs") -> "application/javascript"
        lower.endsWith(".css") -> "text/css"
        lower.endsWith(".json") -> "application/json"
        lower.endsWith(".webmanifest") -> "application/manifest+json"
        lower.endsWith(".svg") -> "image/svg+xml"
        lower.endsWith(".png") -> "image/png"
        lower.endsWith(".jpg") || lower.endsWith(".jpeg") -> "image/jpeg"
        lower.endsWith(".webp") -> "image/webp"
        lower.endsWith(".woff2") -> "font/woff2"
        lower.endsWith(".woff") -> "font/woff"
        else -> "application/octet-stream"
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun NutrisicentiaAndroidApp() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE) }

    var activeApiUrl by remember {
        mutableStateOf(
            prefs.getString(KEY_CUSTOM_SERVER_URL, null)?.takeIf { it.isNotBlank() }
                ?: ApiConfig.AWS_APP_URL
        )
    }

    val hasBundledAssets = remember {
        runCatching {
            context.assets.open("index.html").close()
            true
        }.getOrDefault(false)
    }
    val useBundledUi = ApiConfig.USE_BUNDLED_OFFLINE_UI && hasBundledAssets
    val entryUrl = if (useBundledUi) BUNDLED_APP_ENTRY else activeApiUrl

    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var canGoBack by remember { mutableStateOf(false) }
    var loadProgress by remember { mutableIntStateOf(0) }
    var isLoading by remember { mutableStateOf(true) }
    var loadError by remember { mutableStateOf<String?>(null) }
    var showServerUrlDialog by remember { mutableStateOf(false) }

    var filePathCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    var pendingCameraUri by remember { mutableStateOf<Uri?>(null) }
    var pendingWebPermissionRequest by remember { mutableStateOf<PermissionRequest?>(null) }

    val requiredPermissions = remember {
        buildList {
            add(Manifest.permission.CAMERA)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                add(Manifest.permission.READ_MEDIA_IMAGES)
            } else {
                add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }.toTypedArray()
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        val cameraGranted = results[Manifest.permission.CAMERA] == true ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED
        pendingWebPermissionRequest?.let { req ->
            if (cameraGranted) {
                req.grant(req.resources)
            } else {
                req.deny()
            }
            pendingWebPermissionRequest = null
        }
    }

    val fileChooserLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val callback = filePathCallback
        filePathCallback = null
        if (callback == null) return@rememberLauncherForActivityResult

        if (result.resultCode == Activity.RESULT_OK) {
            val data = result.data
            val clipData = data?.clipData
            val selectedUris = when {
                clipData != null && clipData.itemCount > 0 -> {
                    Array(clipData.itemCount) { index -> clipData.getItemAt(index).uri }
                }
                data?.data != null -> arrayOf(data.data!!)
                pendingCameraUri != null -> arrayOf(pendingCameraUri!!)
                else -> null
            }
            callback.onReceiveValue(selectedUris)
        } else {
            callback.onReceiveValue(null)
        }
        pendingCameraUri = null
    }

    LaunchedEffect(Unit) {
        val missing = requiredPermissions.any {
            ContextCompat.checkSelfPermission(context, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing) {
            permissionLauncher.launch(requiredPermissions)
        }
    }

    BackHandler(enabled = canGoBack) {
        webViewRef?.goBack()
    }

    val assetLoader = remember(context) {
        val assetsHandler = WebViewAssetLoader.AssetsPathHandler(context)
        WebViewAssetLoader.Builder()
            .addPathHandler("/") { path ->
                val cleanPath = if (path.isBlank() || path == "/") "index.html" else path
                val response = assetsHandler.handle(cleanPath)
                response?.apply {
                    mimeType = resolveMimeType(cleanPath)
                }
            }
            .build()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    setBackgroundColor(android.graphics.Color.WHITE)
                    setLayerType(View.LAYER_TYPE_HARDWARE, null)

                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        cacheMode = WebSettings.LOAD_DEFAULT
                        mediaPlaybackRequiresUserGesture = false
                        mixedContentMode = if (activeApiUrl.startsWith("http://")) {
                            WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                        } else {
                            WebSettings.MIXED_CONTENT_NEVER_ALLOW
                        }
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        setSupportZoom(false)
                    }

                    val cookieManager = CookieManager.getInstance()
                    cookieManager.setAcceptCookie(true)
                    cookieManager.setAcceptThirdPartyCookies(this, true)

                    addJavascriptInterface(
                        NutrisicentiaNativeBridge { activeApiUrl },
                        "NutrisicentiaNative"
                    )

                    webViewClient = object : WebViewClient() {
                        override fun shouldInterceptRequest(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): WebResourceResponse? {
                            val uri = request?.url ?: return null
                            if (useBundledUi && uri.host == "appassets.androidplatform.net") {
                                return assetLoader.shouldInterceptRequest(uri)
                            }
                            return null
                        }

                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            isLoading = true
                            loadError = null
                            canGoBack = view?.canGoBack() ?: false
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            isLoading = false
                            canGoBack = view?.canGoBack() ?: false
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): Boolean {
                            val targetUri = request?.url ?: return false
                            val targetHost = targetUri.host.orEmpty()
                            val apiHost = runCatching { Uri.parse(activeApiUrl).host.orEmpty() }.getOrDefault("")
                            val isInternalHost =
                                targetHost == "appassets.androidplatform.net" ||
                                    (apiHost.isNotEmpty() && targetHost == apiHost)

                            if (targetHost.isNotEmpty() && !isInternalHost &&
                                (targetUri.scheme == "http" || targetUri.scheme == "https")
                            ) {
                                runCatching {
                                    ctx.startActivity(Intent(Intent.ACTION_VIEW, targetUri))
                                }
                                return true
                            }
                            return false
                        }

                        override fun onReceivedError(
                            view: WebView?,
                            request: WebResourceRequest?,
                            error: WebResourceError?
                        ) {
                            if (request?.isForMainFrame == true) {
                                isLoading = false
                                loadError = error?.description?.toString()
                                    ?: "Unable to reach the Nutrisicentia backend server."
                            }
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            loadProgress = newProgress
                            if (newProgress >= 100) {
                                isLoading = false
                            }
                        }

                        override fun onPermissionRequest(request: PermissionRequest?) {
                            if (request == null) return
                            val needsCamera = request.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
                            val hasCamera = ContextCompat.checkSelfPermission(
                                ctx,
                                Manifest.permission.CAMERA
                            ) == PackageManager.PERMISSION_GRANTED

                            if (!needsCamera || hasCamera) {
                                request.grant(request.resources)
                            } else {
                                pendingWebPermissionRequest = request
                                permissionLauncher.launch(arrayOf(Manifest.permission.CAMERA))
                            }
                        }

                        override fun onShowFileChooser(
                            webView: WebView?,
                            callback: ValueCallback<Array<Uri>>?,
                            fileChooserParams: FileChooserParams?
                        ): Boolean {
                            filePathCallback?.onReceiveValue(null)
                            filePathCallback = callback

                            val galleryIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                                addCategory(Intent.CATEGORY_OPENABLE)
                                type = "image/*"
                            }

                            val initialIntents = mutableListOf<Intent>()
                            val hasCamera = ContextCompat.checkSelfPermission(
                                ctx,
                                Manifest.permission.CAMERA
                            ) == PackageManager.PERMISSION_GRANTED

                            if (hasCamera) {
                                val photoFile = runCatching {
                                    File.createTempFile("nutrisicentia_scan_", ".jpg", ctx.cacheDir)
                                }.getOrNull()
                                if (photoFile != null) {
                                    val photoUri = FileProvider.getUriForFile(
                                        ctx,
                                        "${ctx.packageName}.fileprovider",
                                        photoFile
                                    )
                                    pendingCameraUri = photoUri
                                    val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                                        putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
                                        addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                                    }
                                    initialIntents.add(cameraIntent)
                                }
                            }

                            val chooser = Intent.createChooser(galleryIntent, "Select Meal Photo or Capture").apply {
                                if (initialIntents.isNotEmpty()) {
                                    putExtra(Intent.EXTRA_INITIAL_INTENTS, initialIntents.toTypedArray())
                                }
                            }

                            return try {
                                fileChooserLauncher.launch(chooser)
                                true
                            } catch (_: Exception) {
                                filePathCallback = null
                                pendingCameraUri = null
                                false
                            }
                        }
                    }

                    webViewRef = this
                    tag = entryUrl
                    loadUrl(entryUrl)
                }
            },
            update = { webView ->
                webView.settings.mixedContentMode = if (activeApiUrl.startsWith("http://")) {
                    WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                } else {
                    WebSettings.MIXED_CONTENT_NEVER_ALLOW
                }
                if (webView.tag != entryUrl) {
                    webView.tag = entryUrl
                    webView.loadUrl(entryUrl)
                }
            }
        )

        if (isLoading && loadProgress in 1..99 && !useBundledUi) {
            LinearProgressIndicator(
                progress = { loadProgress / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(3.dp)
                    .align(Alignment.TopCenter),
                color = Color(0xFF10B981),
                trackColor = Color(0xFFE2E8F0)
            )
        }

        if (loadError != null) {
            ConnectionErrorOverlay(
                currentUrl = activeApiUrl,
                errorMessage = loadError!!,
                onRetry = {
                    loadError = null
                    isLoading = true
                    webViewRef?.loadUrl(entryUrl)
                },
                onConfigureUrl = { showServerUrlDialog = true }
            )
        }

        if (showServerUrlDialog) {
            ServerUrlDialog(
                currentUrl = activeApiUrl,
                onDismiss = { showServerUrlDialog = false },
                onSave = { updatedUrl ->
                    val normalized = updatedUrl.trim().trimEnd('/')
                    prefs.edit().putString(KEY_CUSTOM_SERVER_URL, normalized).apply()
                    activeApiUrl = normalized
                    loadError = null
                    isLoading = true
                    showServerUrlDialog = false
                },
                onResetDefault = {
                    prefs.edit().remove(KEY_CUSTOM_SERVER_URL).apply()
                    activeApiUrl = ApiConfig.AWS_APP_URL
                    loadError = null
                    isLoading = true
                    showServerUrlDialog = false
                }
            )
        }
    }
}

@Composable
private fun ConnectionErrorOverlay(
    currentUrl: String,
    errorMessage: String,
    onRetry: () -> Unit,
    onConfigureUrl: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090D16))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF131D2E)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF10B981).copy(alpha = 0.15f),
                    modifier = Modifier.size(56.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.CloudOff,
                            contentDescription = "Offline",
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }
                Text(
                    text = "Cannot Reach Nutrisicentia Backend",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "$errorMessage\n\nTarget Server:\n$currentUrl",
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8),
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(4.dp))
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Retry Connection", fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = onConfigureUrl,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        Icons.Default.Settings,
                        contentDescription = null,
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Change Backend Server URL", color = Color.White)
                }
            }
        }
    }
}

@Composable
private fun ServerUrlDialog(
    currentUrl: String,
    onDismiss: () -> Unit,
    onSave: (String) -> Unit,
    onResetDefault: () -> Unit
) {
    var urlInput by remember { mutableStateOf(currentUrl) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Backend Server URL", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Emulator local: http://10.0.2.2:3000\nUSB phone (same Wi-Fi): http://<YOUR-PC-IP>:3000\nAWS HTTPS: https://your-app.awsapprunner.com",
                    fontSize = 12.sp
                )
                OutlinedTextField(
                    value = urlInput,
                    onValueChange = { urlInput = it },
                    singleLine = true,
                    placeholder = { Text("http://10.0.2.2:3000") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (urlInput.isNotBlank()) onSave(urlInput) },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
            ) {
                Text("Connect")
            }
        },
        dismissButton = {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                TextButton(onClick = onResetDefault) {
                    Text("Reset Default")
                }
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        }
    )
}

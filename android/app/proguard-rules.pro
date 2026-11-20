# Add project specific ProGuard rules here.
# Keep Retrofit & Gson models intact for release APK builds
-keepclassmembers,allowobfuscation class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keepattributes Signature,InnerClasses,EnclosingMethod
-keep class com.foodinsightai.app.models.** { *; }

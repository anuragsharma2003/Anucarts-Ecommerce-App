# Add project-specific ProGuard rules here.
# These rules help to avoid stripping important classes when enabling R8 code shrinking.
# Default rules are in proguard-android.txt.

# ======================
# React Native & Expo
# ======================
-keep class com.facebook.** { *; }
-keep class expo.modules.** { *; }
-dontwarn com.facebook.**

# ======================
# Hermes (if using Hermes Engine)
# ======================
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# ======================
# React Native Vector Icons (if using them)
# ======================
-keep class com.oblador.vectoricons.** { *; }

# ======================
# Keep annotations (used in reflection)
# ======================
-keep @interface * {
    @ReactMethod *;
}

# ======================
# OkHttp (for network requests)
# ======================
-keep class okhttp3.** { *; }
-dontwarn okhttp3.**

# ======================
# Firebase (if using Firebase)
# ======================
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ======================
# Glide (for image loading)
# ======================
-keep class com.bumptech.glide.** { *; }
-dontwarn com.bumptech.glide.**

# ======================
# Razorpay ProGuard Rules
# ======================
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# ======================
# Fix: Keep ProGuard annotations (to avoid missing Keep & KeepClassMembers)
# ======================
-keep @interface proguard.annotation.Keep
-keep @interface proguard.annotation.KeepClassMembers
-keepclassmembers class * {
    @proguard.annotation.Keep *;
    @proguard.annotation.KeepClassMembers *;
}

# ======================
# Google Pay (Fix Missing Classes in Razorpay-GPay)
# ======================
-keep class com.google.android.apps.nbu.paisa.inapp.client.api.** { *; }
-dontwarn com.google.android.apps.nbu.paisa.inapp.client.api.**

# ======================
# Google Play Services & Wallet API (Fix for Google Pay)
# ======================
-keep class com.google.android.gms.wallet.** { *; }
-keep class com.google.android.gms.common.api.** { *; }

# ======================
# Prevent Obfuscation of Inner Razorpay Classes
# ======================
-keep class * extends com.razorpay.** { *; }

# ======================
# Keep everything inside React Native's main bridge
# ======================
-keep class com.facebook.react.bridge.** { *; }

# ======================
# Keep all native modules (React Native uses reflection)
# ======================
-keep class com.facebook.react.modules.** { *; }

# ======================
# Keep Java & AndroidX classes used via reflection
# ======================
-keep class androidx.lifecycle.** { *; }
-keep class androidx.room.** { *; }
-dontwarn androidx.lifecycle.**
-dontwarn androidx.room.**

# ======================
# Prevent obfuscation of App's main components
# ======================
-keep class com.yourpackage.** { *; }  # Replace "yourpackage" with your app's package name

# ======================
# Prevent R8 from breaking React Native's autolinking
# ======================
-keep class com.facebook.react.* { *; }
-keep class com.facebook.soloader.* { *; }

# ======================
# If experiencing issues, disable code shrinking temporarily
# ======================
# -dontshrink
# -dontoptimize
# -dontobfuscate

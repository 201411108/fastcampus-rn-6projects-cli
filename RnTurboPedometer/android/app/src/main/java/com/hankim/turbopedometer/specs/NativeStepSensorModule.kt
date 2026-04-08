package com.hankim.turbopedometer.nativestepsensor

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.hankim.turbopedometer.specs.NativeStepSensorSpec

class NativeStepSensorModule(
  reactContext: ReactApplicationContext,
) : NativeStepSensorSpec(reactContext) {
  companion object {
    const val NAME = NativeStepSensorSpec.NAME
    private const val TIMEOUT_MS = 1500L
  }

  private val sensorManager =
    reactApplicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
  private val mainHandler = Handler(Looper.getMainLooper())

  private var pendingPromise: Promise? = null
  private var pendingListener: SensorEventListener? = null
  private var pendingTimeout: Runnable? = null

  private val stepCounterSensor: Sensor?
    get() = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)

  private val hasActivityPermission: Boolean
    get() =
      Build.VERSION.SDK_INT < Build.VERSION_CODES.Q ||
        ContextCompat.checkSelfPermission(
          reactApplicationContext,
          Manifest.permission.ACTIVITY_RECOGNITION,
        ) == PackageManager.PERMISSION_GRANTED

  @ReactMethod
  override fun isAvailable(promise: Promise) {
    promise.resolve(stepCounterSensor != null && hasActivityPermission)
  }

  @ReactMethod
  override fun getSensorName(promise: Promise) {
    promise.resolve("Android Step Counter sensor (device boot cumulative)")
  }

  @ReactMethod
  override fun getStepCount(promise: Promise) {
    val sensor =
      stepCounterSensor ?: run {
        promise.reject("E_SENSOR_UNAVAILABLE", "Step Counter sensor is not available on this device.")
        return
      }

    if (!hasActivityPermission) {
      promise.reject(
        "E_PERMISSION_DENIED",
        "ACTIVITY_RECOGNITION permission is required before reading the step sensor.",
      )
      return
    }

    if (pendingPromise != null) {
      promise.reject("E_SENSOR_BUSY", "A previous step sensor read is still in progress.")
      return
    }

    val listener =
      object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
          val steps = event.values.firstOrNull()?.toDouble() ?: 0.0
          cleanupPendingRead()
          promise.resolve(steps)
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
      }

    pendingPromise = promise
    pendingListener = listener

    val timeoutRunnable =
      Runnable {
        if (pendingPromise === promise) {
          cleanupPendingRead()
          promise.reject("E_SENSOR_TIMEOUT", "Timed out while waiting for a step sensor sample.")
        }
      }

    pendingTimeout = timeoutRunnable
    mainHandler.postDelayed(timeoutRunnable, TIMEOUT_MS)

    val registered = sensorManager.registerListener(listener, sensor, SensorManager.SENSOR_DELAY_NORMAL)
    if (!registered) {
      cleanupPendingRead()
      promise.reject("E_SENSOR_REGISTER", "Failed to register the step sensor listener.")
    }
  }

  override fun getName(): String = NAME

  override fun invalidate() {
    cleanupPendingRead()
    super.invalidate()
  }

  private fun cleanupPendingRead() {
    pendingListener?.let { sensorManager.unregisterListener(it) }
    pendingTimeout?.let { mainHandler.removeCallbacks(it) }
    pendingPromise = null
    pendingListener = null
    pendingTimeout = null
  }
}

"""AeroSense AI – Hardware-Ready Abstraction Layer & ESP32 Interface
Provides endpoints and payload schemas compatible with future physical ESP32 microcontrollers.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from models import ESP32SensorPacket, EnvironmentState
from simulation import sim_manager

hardware_router = APIRouter(prefix="/api/hardware", tags=["Hardware / ESP32"])


@hardware_router.post("/sensor-packet")
def receive_esp32_packet(packet: ESP32SensorPacket) -> Dict[str, Any]:
    """
    Standard ingress endpoint for ESP32 with DHT22 and 4 PIR sensors.
    Maps digital PIR trigger inputs to zone occupancy and returns servo & PWM fan control commands.
    """
    occupied_zones = []
    if packet.pir_zone_a:
        occupied_zones.append("A")
    if packet.pir_zone_b:
        occupied_zones.append("B")
    if packet.pir_zone_c:
        occupied_zones.append("C")
    if packet.pir_zone_d:
        occupied_zones.append("D")

    # Update system environment
    new_env = EnvironmentState(
        temperature=packet.temperature,
        humidity=packet.humidity,
        occupancy_count=len(occupied_zones),
        occupied_zones=occupied_zones,
        comfort_preference=sim_manager.env.comfort_preference,
        time_of_day=sim_manager.env.time_of_day,
        manual_override=sim_manager.env.manual_override,
    )
    sim_manager.update_environment(new_env)

    # Return immediate actuation commands to the ESP32
    return {
        "status": "acknowledged",
        "device_id": packet.device_id,
        "actuation_commands": {
            "power_relay": sim_manager.fan.is_on,
            "bldc_pwm_duty_percent": sim_manager.fan.speed_percent,
            "servo_pan_min_deg": sim_manager.fan.swing_start_angle,
            "servo_pan_max_deg": sim_manager.fan.swing_end_angle,
            "servo_sweep_active": sim_manager.fan.is_oscillating,
            "target_rpm": sim_manager.fan.rpm_estimate,
        },
        "telemetry_echo": {
            "comfort_score": sim_manager.decision.comfort_score,
            "apparent_temp": sim_manager.decision.apparent_temp,
            "swing_coverage_reduction": f"{sim_manager.decision.swing_coverage_reduction_percent}%",
        }
    }


@hardware_router.get("/spec")
def get_hardware_specification() -> Dict[str, Any]:
    """Returns pinout mapping, Bill of Materials, and ESP32 C++ firmware architecture."""
    return {
        "mcu": "ESP32-WROOM-32D (Dual Core 240MHz, 2.4GHz Wi-Fi)",
        "pinout": {
            "DHT22_DATA": "GPIO 4 (10k pull-up)",
            "PIR_ZONE_A": "GPIO 13",
            "PIR_ZONE_B": "GPIO 14",
            "PIR_ZONE_C": "GPIO 26",
            "PIR_ZONE_D": "GPIO 27",
            "PWM_FAN_DRIVER": "GPIO 18 (LEDC Channel 0, 25kHz PWM)",
            "SERVO_PAN_PWM": "GPIO 19 (50Hz PWM / 500-2500us)",
            "TACHOMETER_PULSE": "GPIO 21 (External Interrupt)",
            "STATUS_NEOPIXEL": "GPIO 22",
        },
        "communication_protocol": "HTTP REST POST /api/hardware/sensor-packet (1Hz rate) or WebSocket ws://host:8000/ws/live",
        "power_rails": {
            "MCU_LOGIC": "3.3V DC (AMS1117-3.3)",
            "SERVO_MOTOR": "5.0V - 6.0V DC (External 3A Step-Down)",
            "BLDC_FAN": "12.0V DC (Main SMPS, 2A)"
        },
        "firmware_sample_ino": """
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <ESP32Servo.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define PIR_A 13
#define PIR_B 14
#define PIR_C 26
#define PIR_D 27
#define SERVO_PIN 19
#define FAN_PWM_PIN 18

DHT dht(DHTPIN, DHTTYPE);
Servo panServo;
const char* serverUrl = "http://192.168.1.100:8000/api/hardware/sensor-packet";

void setup() {
  Serial.begin(115200);
  dht.begin();
  panServo.attach(SERVO_PIN);
  pinMode(PIR_A, INPUT);
  pinMode(PIR_B, INPUT);
  pinMode(PIR_C, INPUT);
  pinMode(PIR_D, INPUT);
  ledcSetup(0, 25000, 8); // 25kHz PWM for BLDC
  ledcAttachPin(FAN_PWM_PIN, 0);
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  
  StaticJsonDocument<256> doc;
  doc["device_id"] = "ESP32_AEROSENSE_01";
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["pir_zone_a"] = digitalRead(PIR_A);
  doc["pir_zone_b"] = digitalRead(PIR_B);
  doc["pir_zone_c"] = digitalRead(PIR_C);
  doc["pir_zone_d"] = digitalRead(PIR_D);
  
  String requestBody;
  serializeJson(doc, requestBody);
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(requestBody);
  
  if (httpCode == 200) {
    String response = http.getString();
    StaticJsonDocument<512> respDoc;
    deserializeJson(respDoc, response);
    int pwm = respDoc["actuation_commands"]["bldc_pwm_duty_percent"];
    ledcWrite(0, map(pwm, 0, 100, 0, 255));
  }
  http.end();
  delay(1000);
}
"""
    }

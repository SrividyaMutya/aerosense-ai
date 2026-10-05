from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class EnvironmentState(BaseModel):
    temperature: float = Field(default=28.0, ge=16.0, le=45.0, description="Ambient temperature in °C")
    humidity: float = Field(default=55.0, ge=10.0, le=95.0, description="Relative humidity percentage")
    occupancy_count: int = Field(default=1, ge=0, le=10, description="Total number of occupants")
    occupied_zones: List[str] = Field(default=["A"], description="List of occupied zones ['A', 'B', 'C', 'D']")
    comfort_preference: str = Field(default="Balanced", description="'Cool', 'Balanced', 'Warm'")
    time_of_day: str = Field(default="Afternoon", description="'Morning', 'Afternoon', 'Evening', 'Night'")
    manual_override: bool = Field(default=False, description="Whether manual control is engaged")


class FanStatus(BaseModel):
    is_on: bool = True
    speed_percent: int = Field(default=55, ge=0, le=100)
    rpm_estimate: int = Field(default=820, ge=0, le=1450)
    current_angle: float = Field(default=60.0, ge=0.0, le=180.0)
    swing_start_angle: float = Field(default=30.0, ge=0.0, le=180.0)
    swing_end_angle: float = Field(default=80.0, ge=0.0, le=180.0)
    swing_span: float = Field(default=50.0, ge=0.0, le=180.0)
    airflow_intensity: str = "COMFORT MODERATE"
    is_oscillating: bool = True
    direction: int = 1  # 1 for clockwise/right, -1 for counter-clockwise/left
    operating_mode: str = "AI Adaptive"  # "AI Adaptive", "Manual Override", "Demo Scenario"


class DecisionResult(BaseModel):
    recommended_speed: int
    recommended_swing_start: float
    recommended_swing_end: float
    recommended_swing_span: float
    comfort_score: int
    heat_index: float
    apparent_temp: float
    energy_mode: str
    airflow_intensity: str
    power_watts: float
    traditional_power_watts: float
    power_saved_watts: float
    power_saved_percent: float
    swing_coverage_reduction_percent: float
    headline: str
    explanation: str
    reasoning_factors: List[str]
    personalized_applied: bool
    target_zones: List[str]


class ComfortPreference(BaseModel):
    id: Optional[int] = None
    preset_name: str = "Default Preference"
    preferred_temp: float = 26.0
    preferred_airflow: str = "Balanced"  # "Gentle", "Balanced", "Crisp"
    created_at: Optional[str] = None


class Scenario(BaseModel):
    id: str
    title: str
    badge: str
    description: str
    temperature: float
    humidity: float
    occupied_zones: List[str]
    comfort_preference: str = "Balanced"
    expected_speed: str
    expected_swing: str
    highlight: str


class ESP32SensorPacket(BaseModel):
    device_id: str = "ESP32_AEROSENSE_01"
    temperature: float
    humidity: float
    pir_zone_a: int = 0
    pir_zone_b: int = 0
    pir_zone_c: int = 0
    pir_zone_d: int = 0
    battery_voltage: Optional[float] = 3.3
    rssi: Optional[int] = -58
    firmware_version: Optional[str] = "v1.2.0-atomquest"


class FanControlCommand(BaseModel):
    mode: Optional[str] = None  # "AI Adaptive" or "Manual Override"
    power: Optional[bool] = None
    speed_percent: Optional[int] = None
    swing_start: Optional[float] = None
    swing_end: Optional[float] = None
    is_oscillating: Optional[bool] = None

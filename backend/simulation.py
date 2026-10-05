"""AeroSense AI – Real-time Simulation Engine & Hardware Abstraction
Manages live environment state, simulated fan physical oscillation, and demo scenarios.
"""

import asyncio
import time
from typing import Dict, Any, Optional, List
from models import EnvironmentState, FanStatus, DecisionResult, ComfortPreference, Scenario
from engine import evaluate_decision
import database


PREDEFINED_SCENARIOS: List[Scenario] = [
    Scenario(
        id="hot_room",
        title="Scenario 1: Hot Summer Peak",
        badge="High Thermal Stress",
        description="Ambient temperature spikes to 34°C with elevated humidity. Two occupants seated in non-adjacent zones A and C.",
        temperature=34.0,
        humidity=70.0,
        occupied_zones=["A", "C"],
        comfort_preference="Cool",
        expected_speed="75% – 88%",
        expected_swing="25° – 125° (Wide Arc)",
        highlight="Demonstrates high airflow ramp-up and multi-zone angular bridging without wasting air on Zone D.",
    ),
    Scenario(
        id="comfortable_room",
        title="Scenario 2: Comfortable Mild Room",
        badge="Optimal Balance",
        description="Pleasant ambient conditions at 26°C and 50% relative humidity. A single occupant is focused in Zone B.",
        temperature=26.0,
        humidity=50.0,
        occupied_zones=["B"],
        comfort_preference="Balanced",
        expected_speed="40% – 50%",
        expected_swing="55° – 95° (Focused 40°)",
        highlight="Demonstrates narrow beam pinpoint targeting with 77% swing coverage waste elimination.",
    ),
    Scenario(
        id="empty_room",
        title="Scenario 3: Empty Room Energy Saver",
        badge="Standby Conservation",
        description="Room ambient temperature is 31°C, but all occupants have vacated the room.",
        temperature=31.0,
        humidity=65.0,
        occupied_zones=[],
        comfort_preference="Balanced",
        expected_speed="0% (Standby Off)",
        expected_swing="Parked at 90°",
        highlight="Demonstrates automatic zero-occupancy standby shutoff, preventing wasteful empty room cooling.",
    ),
    Scenario(
        id="multi_zone",
        title="Scenario 4: Multi-Zone Gathering",
        badge="Full Room Coverage",
        description="Warm room at 29.5°C with 4 occupants distributed across all four Zones A, B, C, and D.",
        temperature=29.5,
        humidity=62.0,
        occupied_zones=["A", "B", "C", "D"],
        comfort_preference="Balanced",
        expected_speed="70% – 82%",
        expected_swing="20° – 160° (Full Span)",
        highlight="Demonstrates smooth full-perimeter continuous oscillation when total room coverage is warranted.",
    ),
    Scenario(
        id="low_temperature",
        title="Scenario 5: Chilly Morning",
        badge="Low Airflow Minimum",
        description="Cool ambient morning temperature at 21°C with 45% humidity. Single occupant present in Zone A.",
        temperature=21.0,
        humidity=45.0,
        occupied_zones=["A"],
        comfort_preference="Warm",
        expected_speed="18% – 25% (Gentle)",
        expected_swing="25° – 65°",
        highlight="Avoids draft discomfort by dropping to gentle air circulation mode with minimal power draw (4.8W).",
    ),
]


class SimulationManager:
    def __init__(self):
        self.env = EnvironmentState(
            temperature=30.0,
            humidity=65.0,
            occupancy_count=2,
            occupied_zones=["A", "C"],
            comfort_preference="Balanced",
            time_of_day="Afternoon",
            manual_override=False,
        )
        self.fan = FanStatus(
            is_on=True,
            speed_percent=72,
            rpm_estimate=1050,
            current_angle=60.0,
            swing_start_angle=25.0,
            swing_end_angle=125.0,
            swing_span=100.0,
            airflow_intensity="HIGH AIRFLOW",
            is_oscillating=True,
            direction=1,
            operating_mode="AI Adaptive",
        )
        self.decision: DecisionResult = evaluate_decision(self.env)
        self.active_preference: Optional[ComfortPreference] = None
        self._sync_fan_with_decision()

        self._last_log_time = time.time()
        self.is_running = False

    def _sync_fan_with_decision(self):
        """Applies latest AI recommendation to fan status if in AI mode."""
        if not self.env.manual_override:
            self.fan.speed_percent = self.decision.recommended_speed
            self.fan.rpm_estimate = int(self.decision.recommended_speed * 14.5)
            self.fan.swing_start_angle = self.decision.recommended_swing_start
            self.fan.swing_end_angle = self.decision.recommended_swing_end
            self.fan.swing_span = self.decision.recommended_swing_span
            self.fan.airflow_intensity = self.decision.airflow_intensity
            self.fan.is_on = self.decision.recommended_speed > 0
            self.fan.is_oscillating = self.decision.recommended_swing_span > 0
            self.fan.operating_mode = "AI Adaptive"

            # Clamp current angle if out of new swing bounds
            if self.fan.swing_span > 0:
                if self.fan.current_angle < self.fan.swing_start_angle:
                    self.fan.current_angle = self.fan.swing_start_angle
                elif self.fan.current_angle > self.fan.swing_end_angle:
                    self.fan.current_angle = self.fan.swing_end_angle
            else:
                self.fan.current_angle = 90.0

    def update_environment(self, new_state: EnvironmentState):
        """Updates environment inputs from UI simulator or future hardware ESP32."""
        self.env = new_state
        self.decision = evaluate_decision(self.env, self.active_preference)
        self._sync_fan_with_decision()

    def set_active_preference(self, pref: Optional[ComfortPreference]):
        self.active_preference = pref
        self.decision = evaluate_decision(self.env, self.active_preference)
        self._sync_fan_with_decision()

    def apply_scenario(self, scenario_id: str) -> bool:
        """Applies one of the hackathon demo presets."""
        scenario = next((s for s in PREDEFINED_SCENARIOS if s.id == scenario_id), None)
        if not scenario:
            return False
        
        self.env = EnvironmentState(
            temperature=scenario.temperature,
            humidity=scenario.humidity,
            occupancy_count=len(scenario.occupied_zones),
            occupied_zones=scenario.occupied_zones,
            comfort_preference=scenario.comfort_preference,
            time_of_day="Afternoon",
            manual_override=False,
        )
        self.decision = evaluate_decision(self.env, self.active_preference)
        self._sync_fan_with_decision()
        return True

    def manual_control(
        self,
        speed: Optional[int] = None,
        swing_start: Optional[float] = None,
        swing_end: Optional[float] = None,
        power: Optional[bool] = None,
        is_oscillating: Optional[bool] = None,
        mode: Optional[str] = None
    ):
        """Handles manual user overrides."""
        if mode == "AI Adaptive":
            self.env.manual_override = False
            self.decision = evaluate_decision(self.env, self.active_preference)
            self._sync_fan_with_decision()
            return

        self.env.manual_override = True
        self.fan.operating_mode = "Manual Override"

        if power is not None:
            self.fan.is_on = power
            if not power:
                self.fan.speed_percent = 0
                self.fan.rpm_estimate = 0
        if speed is not None:
            self.fan.speed_percent = max(0, min(100, speed))
            self.fan.rpm_estimate = int(self.fan.speed_percent * 14.5)
            self.fan.is_on = self.fan.speed_percent > 0
        if swing_start is not None and swing_end is not None:
            s_start = max(0.0, min(180.0, swing_start))
            s_end = max(s_start, min(180.0, swing_end))
            self.fan.swing_start_angle = s_start
            self.fan.swing_end_angle = s_end
            self.fan.swing_span = s_end - s_start
        if is_oscillating is not None:
            self.fan.is_oscillating = is_oscillating

    def tick_physics(self, dt: float = 0.1):
        """
        Executes one physics frame of fan sweep oscillation (called 10 times per second).
        Simulates servo pan sweep velocity.
        """
        if not self.fan.is_on or not self.fan.is_oscillating or self.fan.swing_span <= 0:
            return

        # Physical servo sweep rate: ~25° to 45° per second depending on speed setting
        base_rate = 22.0 + (self.fan.speed_percent * 0.18)  # deg/s
        step = base_rate * dt * self.fan.direction

        new_angle = self.fan.current_angle + step

        if new_angle >= self.fan.swing_end_angle:
            new_angle = self.fan.swing_end_angle
            self.fan.direction = -1
        elif new_angle <= self.fan.swing_start_angle:
            new_angle = self.fan.swing_start_angle
            self.fan.direction = 1

        self.fan.current_angle = round(new_angle, 2)

        # Periodic logging every 30 seconds
        now = time.time()
        if now - self._last_log_time >= 30.0:
            self._last_log_time = now
            try:
                database.log_telemetry_snapshot(
                    temperature=self.env.temperature,
                    humidity=self.env.humidity,
                    fan_speed=self.fan.speed_percent,
                    swing_span=self.fan.swing_span,
                    occupancy_count=self.env.occupancy_count,
                    comfort_score=self.decision.comfort_score,
                    power_watts=self.decision.power_watts,
                )
            except Exception:
                pass


sim_manager = SimulationManager()

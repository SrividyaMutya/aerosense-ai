"""AeroSense AI – Intelligent Adaptive Airflow Decision Engine
Competition: AtomQuest 2026 | Track 1: Fan
Theme: "Air, Reimagined for the Next Decade"

Deterministic, transparent, explainable decision engine that computes:
1. Apparent Temperature & Heat Index (NOAA/Steadman Bioclimatic Formula)
2. Thermal Comfort Score (0-100 scale based on ASHRAE Standard 55)
3. Adaptive Fan Speed (Thermal load & occupancy based)
4. Dynamic Swing Span (Zone clustering & convex angular bounding)
5. Power & Energy Optimization (Affinity Law scaled power vs 60W traditional fan)
6. Explainable AI breakdown with dynamic rationale
"""

import math
from typing import List, Dict, Tuple, Optional
from models import EnvironmentState, DecisionResult, ComfortPreference


# Angular zone sector definitions (degrees 0 to 180)
# A: Front-Left (25° - 65°, center 45°)
# B: Center-Left (55° - 95°, center 75°)
# C: Center-Right (85° - 125°, center 105°)
# D: Front-Right (115° - 155°, center 135°)
ZONE_BOUNDS = {
    "A": (30.0, 60.0),
    "B": (60.0, 90.0),
    "C": (90.0, 120.0),
    "D": (120.0, 150.0),
}

TRADITIONAL_FAN_POWER_WATTS = 60.0  # Typical AC pedestal fan (55W motor + 5W oscillation gearbox)
AEROSENSE_BASE_SYSTEM_WATTS = 2.0  # ESP32 + sensors + standby logic
AEROSENSE_BLDC_MAX_WATTS = 34.0    # High-efficiency low-voltage brushless DC motor
AEROSENSE_SERVO_PEAK_WATTS = 2.5   # Digital pan servo during continuous full-range swing


def calculate_heat_index(temp_c: float, humidity_rh: float) -> Tuple[float, float]:
    """
    Computes apparent temperature and heat index using the Rothfusz regression
    and simplified Steadman formulation adapted to Celsius.
    """
    # Vapor pressure in hPa
    vapor_pressure = (humidity_rh / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    
    # Apparent temperature formula (Australian Bureau of Meteorology / Steadman)
    # AT = Ta + 0.33 * e - 0.70 * ws - 4.00 (assuming indoor nominal air velocity 0.2 m/s before fan intervention)
    apparent_temp = temp_c + (0.33 * vapor_pressure) - 0.70 * 0.2 - 4.0
    
    # NOAA Heat Index regression for high ambient temps
    temp_f = (temp_c * 9.0 / 5.0) + 32.0
    if temp_f >= 78.0:
        c1 = -42.379
        c2 = 2.04901523
        c3 = 10.14333127
        c4 = -0.22475541
        c5 = -0.00683783
        c6 = -0.05481717
        c7 = 0.00122874
        c8 = 0.00085282
        c9 = -0.00000199
        hi_f = (c1 + (c2 * temp_f) + (c3 * humidity_rh) +
                (c4 * temp_f * humidity_rh) + (c5 * (temp_f ** 2)) +
                (c6 * (humidity_rh ** 2)) + (c7 * (temp_f ** 2) * humidity_rh) +
                (c8 * temp_f * (humidity_rh ** 2)) +
                (c9 * (temp_f ** 2) * (humidity_rh ** 2)))
        heat_index_c = (hi_f - 32.0) * 5.0 / 9.0
    else:
        heat_index_c = apparent_temp

    return round(apparent_temp, 1), round(heat_index_c, 1)


def calculate_comfort_score(apparent_temp: float, humidity: float, fan_speed_percent: int) -> int:
    """
    Computes human thermal comfort score (0 - 100) based on ASHRAE-55.
    Optimal indoor comfort baseline: 23.5°C apparent temp, 45-55% RH.
    Airflow provides convective evaporative cooling relief: ~0.035°C perceived drop per % fan speed.
    """
    cooling_offset = (fan_speed_percent * 0.032)
    effective_temp = apparent_temp - cooling_offset
    
    temp_deviation = abs(effective_temp - 23.5)
    humidity_deviation = abs(humidity - 50.0)
    
    penalty = (temp_deviation * 6.2) + (humidity_deviation * 0.35)
    score = 100.0 - penalty
    score_clamped = max(10, min(100, int(round(score))))
    return score_clamped


def calculate_dynamic_swing(occupied_zones: List[str]) -> Tuple[float, float, float, float]:
    """
    Calculates the minimal continuous angular sweep sector containing all occupants.
    Returns: (start_angle, end_angle, swing_span, coverage_reduction_percent)
    Traditional baseline is fixed 180° oscillation (0° to 180°).
    """
    valid_zones = [z.upper() for z in occupied_zones if z.upper() in ZONE_BOUNDS]
    
    if not valid_zones:
        # Zero occupancy: Park fan at center (90°) with zero active oscillation
        return 90.0, 90.0, 0.0, 100.0
    
    min_angle = min(ZONE_BOUNDS[z][0] for z in valid_zones)
    max_angle = max(ZONE_BOUNDS[z][1] for z in valid_zones)
    
    # Add gentle 5° boundary buffer for air dispersion, clamped to [0°, 180°]
    start_angle = max(0.0, min_angle - 5.0)
    end_angle = min(180.0, max_angle + 5.0)
    span = end_angle - start_angle
    
    # Fixed traditional fan oscillates 180°
    # Coverage reduction = percentage of wasted sweep eliminated
    reduction_percent = round(((180.0 - span) / 180.0) * 100.0, 1)
    
    return round(start_angle, 1), round(end_angle, 1), round(span, 1), reduction_percent


def evaluate_decision(
    env: EnvironmentState,
    saved_pref: Optional[ComfortPreference] = None
) -> DecisionResult:
    """
    Core deterministic AI decision logic:
    Combines environmental triggers, spatial occupancy, user preference, and energy modeling.
    """
    apparent_temp, heat_index = calculate_heat_index(env.temperature, env.humidity)
    valid_zones = [z.upper() for z in env.occupied_zones if z.upper() in ZONE_BOUNDS]
    occupants = len(valid_zones) if env.occupancy_count > 0 else 0
    
    # Check if a saved comfort preference applies
    personalized_applied = False
    pref_bias_speed = 0
    if saved_pref:
        temp_delta = abs(env.temperature - saved_pref.preferred_temp)
        if temp_delta <= 2.5:
            personalized_applied = True
            if saved_pref.preferred_airflow == "Crisp":
                pref_bias_speed = 10
            elif saved_pref.preferred_airflow == "Gentle":
                pref_bias_speed = -10
    
    # User comfort mode bias
    comfort_mode_bias = 0
    if env.comfort_preference == "Cool":
        comfort_mode_bias = 8
    elif env.comfort_preference == "Warm":
        comfort_mode_bias = -10

    # Time of day acoustic & thermal profile
    time_bias = 0
    if env.time_of_day == "Night":
        time_bias = -6  # Quieter acoustics for sleep
    elif env.time_of_day == "Afternoon":
        time_bias = 4   # Compensate for diurnal solar peak

    # 1. FAN SPEED CALCULATION
    if occupants == 0:
        # Zero occupancy: standby mode
        # If room is severely hot (>35°C), run ultra-low eco flush at 15%, else 0% (off)
        if env.temperature >= 35.0:
            recommended_speed = 15
            airflow_label = "ECO FLUSH"
            energy_mode = "ECO STANDBY"
        else:
            recommended_speed = 0
            airflow_label = "STANDBY OFF"
            energy_mode = "STANDBY"
    else:
        # Base speed driven by thermal demand index
        thermal_demand = apparent_temp - 24.0
        
        if thermal_demand <= 0:
            base_speed = 20
        elif thermal_demand <= 3.0:
            base_speed = 35 + int(thermal_demand * 5)
        elif thermal_demand <= 7.0:
            base_speed = 52 + int((thermal_demand - 3.0) * 6)
        elif thermal_demand <= 11.0:
            base_speed = 76 + int((thermal_demand - 7.0) * 4)
        else:
            base_speed = 92 + int((thermal_demand - 11.0) * 2)

        # Multi-occupant thermal load adjustment (+4% per occupant past the first)
        occupant_load_bias = (occupants - 1) * 4
        
        computed_speed = base_speed + comfort_mode_bias + pref_bias_speed + time_bias + occupant_load_bias
        recommended_speed = max(18, min(100, int(computed_speed)))
        
        if recommended_speed < 30:
            airflow_label = "GENTLE BREEZE"
            energy_mode = "ECO ADAPTIVE"
        elif recommended_speed < 55:
            airflow_label = "COMFORT MODERATE"
            energy_mode = "COMFORT BALANCED"
        elif recommended_speed < 80:
            airflow_label = "HIGH AIRFLOW"
            energy_mode = "EFFICIENT HIGH"
        else:
            airflow_label = "TURBO JET"
            energy_mode = "MAX COOLING"

    # 2. SWING SPAN CALCULATION
    if occupants == 0:
        start_angle, end_angle, swing_span, swing_reduction = 90.0, 90.0, 0.0, 100.0
    else:
        start_angle, end_angle, swing_span, swing_reduction = calculate_dynamic_swing(valid_zones)

    # 3. COMFORT SCORE
    comfort_score = calculate_comfort_score(apparent_temp, env.humidity, recommended_speed)

    # 4. POWER & ENERGY SIMULATION
    # Fan power scales with speed^2.4 according to aerodynamic fan affinity law
    if recommended_speed > 0:
        fan_power = AEROSENSE_BASE_SYSTEM_WATTS + AEROSENSE_BLDC_MAX_WATTS * ((recommended_speed / 100.0) ** 2.4)
        # Servo power is proportional to active swing span
        servo_power = AEROSENSE_SERVO_PEAK_WATTS * (swing_span / 180.0)
        power_watts = round(fan_power + servo_power, 1)
    else:
        power_watts = round(AEROSENSE_BASE_SYSTEM_WATTS, 1)
    
    trad_power = TRADITIONAL_FAN_POWER_WATTS
    power_saved_watts = round(max(0.0, trad_power - power_watts), 1)
    power_saved_percent = round((power_saved_watts / trad_power) * 100.0, 1)

    # 5. DYNAMIC EXPLAINABLE AI REASONING
    reasoning_factors: List[str] = []
    
    # Factor 1: Ambient Thermal State
    if apparent_temp >= 32.0:
        reasoning_factors.append(
            f"High thermal load: Ambient {env.temperature:.1f}°C & {env.humidity:.0f}% RH yield an apparent heat index of {apparent_temp:.1f}°C."
        )
    elif apparent_temp >= 26.0:
        reasoning_factors.append(
            f"Moderate ambient warmth: Apparent temp is {apparent_temp:.1f}°C (comfortable baseline is 23.5°C)."
        )
    else:
        reasoning_factors.append(
            f"Cool ambient condition: Apparent temp is {apparent_temp:.1f}°C; excessive airflow avoided."
        )

    # Factor 2: Spatial Occupancy & Swing Clamping
    if occupants == 0:
        reasoning_factors.append(
            "Zero occupancy detected across all zones: Motor reduced to standby; swing parked to eliminate waste."
        )
    elif occupants == 1:
        reasoning_factors.append(
            f"Single occupant located in Zone {valid_zones[0]}: Swing restricted to focused {start_angle:.0f}° - {end_angle:.0f}° arc ({swing_span:.0f}° span), cutting wasted swing by {swing_reduction}%."
        )
    else:
        zones_str = ", ".join(valid_zones)
        reasoning_factors.append(
            f"{occupants} occupants detected in Zones [{zones_str}]: Dynamic bounding box calculated at {start_angle:.0f}° - {end_angle:.0f}° ({swing_span:.0f}° span), saving {swing_reduction}% unused sweep."
        )

    # Factor 3: User Comfort Preference & Personalization
    if personalized_applied and saved_pref:
        reasoning_factors.append(
            f"Personalized comfort profile applied: Matched user preset '{saved_pref.preset_name}' (Target {saved_pref.preferred_temp:.1f}°C, {saved_pref.preferred_airflow} airflow)."
        )
    elif env.comfort_preference != "Balanced":
        reasoning_factors.append(
            f"Comfort preference set to '{env.comfort_preference}': Applied speed bias of {comfort_mode_bias:+d}%."
        )

    # Factor 4: Energy Impact
    reasoning_factors.append(
        f"Energy optimization: Drawing {power_watts:.1f}W vs {trad_power:.0f}W for standard fixed fan ({power_saved_percent}% instantaneous power reduction)."
    )

    # Headline & Summary
    if occupants == 0:
        headline = "Room Unoccupied - Standby Conservation"
        explanation = "No occupants detected in any zone. AeroSense has parked the fan oscillation and placed the motor in eco standby, eliminating unnecessary power draw."
    elif apparent_temp >= 31.0 and occupants >= 2:
        headline = "High Thermal Demand & Multi-Zone Airflow"
        explanation = f"Elevated apparent temperature ({apparent_temp:.1f}°C) and multiple occupants in Zones [{', '.join(valid_zones)}] triggered high fan speed ({recommended_speed}%) with targeted {swing_span:.0f}° swing coverage."
    elif occupants == 1:
        headline = f"Targeted Single-Zone Comfort (Zone {valid_zones[0]})"
        explanation = f"One occupant detected in Zone {valid_zones[0]}. AeroSense narrowed swing oscillation to {start_angle:.0f}° - {end_angle:.0f}° while modulating airflow to achieve {comfort_score}/100 comfort score."
    else:
        headline = "Adaptive Multi-Zone Comfort Active"
        explanation = f"Comfortable airflow delivery active across Zones [{', '.join(valid_zones)}]. Dynamic swing span of {swing_span:.0f}° prevents wasting air on empty spaces."

    return DecisionResult(
        recommended_speed=recommended_speed,
        recommended_swing_start=start_angle,
        recommended_swing_end=end_angle,
        recommended_swing_span=swing_span,
        comfort_score=comfort_score,
        heat_index=heat_index,
        apparent_temp=apparent_temp,
        energy_mode=energy_mode,
        airflow_intensity=airflow_label,
        power_watts=power_watts,
        traditional_power_watts=trad_power,
        power_saved_watts=power_saved_watts,
        power_saved_percent=power_saved_percent,
        swing_coverage_reduction_percent=swing_reduction,
        headline=headline,
        explanation=explanation,
        reasoning_factors=reasoning_factors,
        personalized_applied=personalized_applied,
        target_zones=valid_zones,
    )

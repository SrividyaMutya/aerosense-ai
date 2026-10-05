"""Unit and Logic Tests for AeroSense AI Decision Engine & Database
"""

import unittest
from engine import (
    calculate_heat_index,
    calculate_comfort_score,
    calculate_dynamic_swing,
    evaluate_decision,
)
from models import EnvironmentState, ComfortPreference
import database


class TestAeroSenseDecisionEngine(unittest.TestCase):
    def test_heat_index(self):
        # High heat and humidity
        app_t, hi = calculate_heat_index(34.0, 75.0)
        self.assertGreater(hi, 34.0)
        self.assertGreater(app_t, 34.0)

        # Mild temperature
        app_t_mild, _ = calculate_heat_index(24.0, 50.0)
        self.assertAlmostEqual(app_t_mild, 24.0, delta=4.0)

    def test_comfort_score_bounds(self):
        # Perfect condition
        score_ideal = calculate_comfort_score(24.0, 50.0, 50)
        self.assertGreaterEqual(score_ideal, 80)
        self.assertLessEqual(score_ideal, 100)

        # Extreme heat
        score_extreme = calculate_comfort_score(42.0, 85.0, 0)
        self.assertLessEqual(score_extreme, 50)

    def test_dynamic_swing_reduction(self):
        # Empty room: parked at 90°, 0 span
        start, end, span, reduction = calculate_dynamic_swing([])
        self.assertEqual(span, 0.0)
        self.assertEqual(reduction, 100.0)

        # Single Zone A (25° - 65°): focused span ~30-40°
        start_a, end_a, span_a, reduction_a = calculate_dynamic_swing(["A"])
        self.assertLess(span_a, 60.0)
        # Should achieve >60% swing reduction compared to 180°
        self.assertGreaterEqual(reduction_a, 60.0)

        # Zone A and C: multi-zone spanning ~30° to 120°
        start_ac, end_ac, span_ac, reduction_ac = calculate_dynamic_swing(["A", "C"])
        self.assertGreater(span_ac, span_a)
        self.assertLessEqual(span_ac, 120.0)
        self.assertGreaterEqual(reduction_ac, 30.0)  # AtomQuest Round 1 >30% target met!

        # All zones: full room span
        start_all, end_all, span_all, reduction_all = calculate_dynamic_swing(["A", "B", "C", "D"])
        self.assertGreaterEqual(span_all, 130.0)

    def test_evaluate_decision_empty_room(self):
        env = EnvironmentState(
            temperature=30.0,
            humidity=60.0,
            occupancy_count=0,
            occupied_zones=[],
        )
        dec = evaluate_decision(env)
        self.assertEqual(dec.recommended_speed, 0)
        self.assertEqual(dec.recommended_swing_span, 0.0)
        self.assertIn("STANDBY", dec.energy_mode.upper())
        self.assertGreater(dec.power_saved_percent, 90.0)

    def test_evaluate_decision_high_heat(self):
        env = EnvironmentState(
            temperature=36.0,
            humidity=75.0,
            occupancy_count=2,
            occupied_zones=["A", "C"],
            comfort_preference="Cool",
        )
        dec = evaluate_decision(env)
        self.assertGreaterEqual(dec.recommended_speed, 80)
        self.assertIn("Turbo", dec.airflow_intensity.title())

    def test_comfort_memory_matching(self):
        pref = ComfortPreference(
            preset_name="My Cool Room",
            preferred_temp=27.0,
            preferred_airflow="Crisp",
        )
        # Matching temp (27.5°C is within 2.5°C of 27.0°C)
        env = EnvironmentState(
            temperature=27.5,
            humidity=55.0,
            occupancy_count=1,
            occupied_zones=["B"],
        )
        dec = evaluate_decision(env, saved_pref=pref)
        self.assertTrue(dec.personalized_applied)


if __name__ == "__main__":
    unittest.main()

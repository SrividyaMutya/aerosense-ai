"""AeroSense AI – SQLite Persistence & Analytics Logging
Provides storage for user Comfort Memory preferences and historical telemetry logs.
"""

import sqlite3
import os
import time
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models import ComfortPreference

DB_PATH = os.path.join(os.path.dirname(__file__), "aerosense.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes tables and seeds default preferences and 24h telemetry history if empty."""
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS comfort_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        preset_name TEXT NOT NULL,
        preferred_temp REAL NOT NULL,
        preferred_airflow TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        fan_speed INTEGER NOT NULL,
        swing_span REAL NOT NULL,
        occupancy_count INTEGER NOT NULL,
        comfort_score INTEGER NOT NULL,
        power_watts REAL NOT NULL,
        trad_power_watts REAL NOT NULL DEFAULT 60.0
    );
    """)

    conn.commit()

    # Seed default comfort preferences if none exist
    cursor.execute("SELECT COUNT(*) FROM comfort_preferences")
    if cursor.fetchone()[0] == 0:
        presets = [
            ("Personal Default", 26.5, "Balanced"),
            ("Night Sleep Comfort", 25.0, "Gentle"),
            ("Workout Cooling", 23.0, "Crisp"),
        ]
        now = datetime.now().isoformat()
        for name, temp, airflow in presets:
            cursor.execute(
                "INSERT INTO comfort_preferences (preset_name, preferred_temp, preferred_airflow, created_at) VALUES (?, ?, ?, ?)",
                (name, temp, airflow, now),
            )
        conn.commit()

    # Seed 24h realistic historical telemetry data if table is empty
    cursor.execute("SELECT COUNT(*) FROM telemetry_history")
    if cursor.fetchone()[0] == 0:
        seed_historical_telemetry(cursor)
        conn.commit()

    conn.close()


def seed_historical_telemetry(cursor):
    """Generates 48 data points representing the past 24 hours (every 30 mins) with realistic diurnal cycle."""
    now = datetime.now()
    records = []

    for i in range(48, -1, -1):
        point_time = now - timedelta(minutes=i * 30)
        hour = point_time.hour + point_time.minute / 60.0
        
        # Diurnal temperature cycle: coolest around 5am (22°C), hottest around 2pm (34°C)
        temp_cycle = 28.0 + 5.5 * math_sin_cycle(hour, peak_hour=14.0)
        temperature = round(temp_cycle + random.uniform(-0.4, 0.4), 1)

        # Humidity inverse cycle: highest in morning (72%), lowest in afternoon (45%)
        hum_cycle = 58.0 - 13.0 * math_sin_cycle(hour, peak_hour=14.0)
        humidity = round(hum_cycle + random.uniform(-1.5, 1.5), 1)

        # Occupancy pattern: 1-2 people morning & evening, empty midday or 1 person
        if 8 <= hour <= 12:
            occupancy = 1
            span = 40.0
        elif 12 < hour <= 17:
            occupancy = random.choice([0, 1])
            span = 40.0 if occupancy else 0.0
        elif 17 < hour <= 22:
            occupancy = random.choice([2, 3])
            span = 95.0
        else:
            occupancy = 1
            span = 35.0

        if occupancy == 0:
            speed = 0
            comfort = 70
            power = 2.0
        else:
            speed = int(min(100, max(25, 45 + (temperature - 26.0) * 5 + random.randint(-3, 3))))
            comfort = min(98, max(68, int(85 - abs(temperature - 25.0) * 2.5 + random.randint(-2, 2))))
            power = round(2.0 + 34.0 * ((speed / 100.0) ** 2.4) + 2.5 * (span / 180.0), 1)

        records.append((
            point_time.strftime("%Y-%m-%d %H:%M:%S"),
            temperature,
            humidity,
            speed,
            span,
            occupancy,
            comfort,
            power,
            60.0
        ))

    cursor.executemany("""
    INSERT INTO telemetry_history 
    (timestamp, temperature, humidity, fan_speed, swing_span, occupancy_count, comfort_score, power_watts, trad_power_watts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, records)


def math_sin_cycle(hour: float, peak_hour: float = 14.0) -> float:
    import math
    phase = (hour - (peak_hour - 6.0)) / 24.0 * (2.0 * math.pi)
    return math.sin(phase)


def get_all_preferences() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM comfort_preferences ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def save_preference(name: str, temp: float, airflow: str) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now().isoformat()
    cursor.execute(
        "INSERT INTO comfort_preferences (preset_name, preferred_temp, preferred_airflow, created_at) VALUES (?, ?, ?, ?)",
        (name, temp, airflow, now),
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {
        "id": new_id,
        "preset_name": name,
        "preferred_temp": temp,
        "preferred_airflow": airflow,
        "created_at": now,
    }


def delete_preference(pref_id: int) -> bool:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM comfort_preferences WHERE id = ?", (pref_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted


def log_telemetry_snapshot(
    temperature: float,
    humidity: float,
    fan_speed: int,
    swing_span: float,
    occupancy_count: int,
    comfort_score: int,
    power_watts: float,
):
    conn = get_db()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
    INSERT INTO telemetry_history 
    (timestamp, temperature, humidity, fan_speed, swing_span, occupancy_count, comfort_score, power_watts, trad_power_watts)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 60.0)
    """, (now_str, temperature, humidity, fan_speed, swing_span, occupancy_count, comfort_score, power_watts))
    conn.commit()
    conn.close()


def get_analytics(timespan: str = "24h") -> List[Dict[str, Any]]:
    """Returns telemetry history filtered by timespan ('1h', '6h', '24h')."""
    conn = get_db()
    cursor = conn.cursor()
    
    limit = 48
    if timespan == "1h":
        limit = 12
    elif timespan == "6h":
        limit = 24
    else:
        limit = 48

    cursor.execute(f"SELECT * FROM telemetry_history ORDER BY id DESC LIMIT {limit}")
    rows = cursor.fetchall()
    conn.close()

    # Return in chronological order
    data = [dict(row) for row in reversed(rows)]
    return data

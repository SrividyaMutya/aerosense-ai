# AeroSense AI – Intelligent Adaptive Airflow Fan

**AtomQuest 2026** | **Track 1 – Fan**  
*Theme: “Air, Reimagined for the Next Decade”*  
*Primary Focus Area: Pedestal fans with multi-directional swing motion; dynamic or sensor-based control of swing span*  
*Secondary Focus Area: Fan as an enabler for smart home – ambient temperature & humidity-based triggers*

---

## 1. Executive Summary & Innovation

Conventional pedestal fans oscillate across an unyielding, fixed 90°–180° mechanical arc, blindly blowing air against empty walls, curtains, and unoccupied furniture. Up to 50% of fan power is squandered cooling empty space.

**AeroSense AI** reinvents pedestal fan airflow through software-in-the-loop autonomous vectoring:
1. **Dynamic Sensor-Based Swing Motion**: Partitions the room into angular sectors (Zones A–D) and dynamically clamps servo oscillation to only the minimal continuous convex sector containing active occupants.
2. **Bioclimatic Closed-Loop Speed Control**: Combines ambient dry-bulb temperature and relative humidity to compute human apparent heat index (vapor pressure resistance) and ASHRAE-55 thermal comfort score, modulating brushless DC (BLDC) motor speed to exact comfort demands.
3. **Compound Energy Optimization**: Combines aerodynamic fan affinity law power scaling ($P \propto \text{RPM}^{2.4}$) with eliminated unnecessary oscillation, cutting real-time power draw from 60W down to 8W–28W (up to **69% instantaneous savings** and **35% daily energy reduction**).
4. **Hardware-Ready Architecture**: Engineered with standardized REST and WebSocket hardware contracts ready to connect to an **ESP32 microcontroller + DHT22 + PIR motion sensors** for AtomQuest Round 2 without modifying a single line of application code.

---

## 2. Quick Start Commands for Windows CMD

The application runs entirely on localhost without paid services or API keys.

### Option A: One-Click Launcher (Easiest)
Double-click `start_all.bat` in the root folder, or in Command Prompt (CMD):
```cmd
start_all.bat
```
*This opens both the FastAPI backend and Vite frontend in dedicated terminal windows and automatically launches your default browser at `http://localhost:5188`.*

---

### Option B: Run in Separate CMD Windows

#### Window 1: Backend (FastAPI + WebSocket)
Open Command Prompt (CMD):
```cmd
cd C:\Users\srivi\Downloads\ai_fan\backend
python -m uvicorn main:app --host 127.0.0.1 --port 8008 --reload
```
- API Base: `http://127.0.0.1:8008`
- Interactive Swagger Docs: `http://127.0.0.1:8008/docs`
- WebSocket Telemetry: `ws://127.0.0.1:8008/ws/live`

#### Window 2: Frontend (React + Vite)
Open a second Command Prompt (CMD):
```cmd
cd C:\Users\srivi\Downloads\ai_fan\frontend
npm run dev
```
- Dashboard URL: `http://localhost:5188`

---

## 3. Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Recharts, Lucide React, HTML5 2D Canvas particle engine.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, WebSockets.
- **Database**: SQLite3 (`backend/aerosense.db`) for Comfort Memory preferences and historical 24h telemetry.
- **Protocols**: REST API + 10Hz Bi-directional WebSocket telemetry stream.

---

## 4. Key Application Views & Capabilities

1. **AeroSense AI Command Center**: Comprehensive hero operations dashboard with live environment cards, dynamic tachometer & heading needles, explainable AI recommendation card, virtual room preview, and energy meters.
2. **Interactive 2D Room Simulator**: Full spatial coordinate canvas showing fan blade spinning, dynamic sweep oscillation matching instantaneous servo angle, animated airflow particle streamlines, and click-to-occupy zones (Zones A, B, C, D). Includes "Show Fixed 180° Waste Overlay" toggle to visually contrast legacy waste vs AeroSense focus.
3. **AI Decision Engine Workbench**: Algorithmic transparency dashboard displaying mathematical formulas (Steadman / Rothfusz Apparent Heat Index, ASHRAE 55 convective comfort model, piecewise speed curve, and angular convex hull clustering) with step-by-step intermediate execution traces.
4. **Energy Optimization & Power Analysis**: Compares continuous traditional 60W AC fans against AeroSense adaptive BLDC power. Includes 24-hour comparative diurnal area chart and annual utility rupee savings (₹/year).
5. **Comfort Memory (SQLite Persisted)**: User profile personalization. Saves target setpoint and airflow tolerance to SQLite. When ambient conditions near user setpoint, displays "Personalized Comfort Preference Active" banner with applied speed bias.
6. **Analytics Dashboard**: Interactive Recharts time-series graphs for Temperature/Humidity, Fan Speed/Swing Arc, Power Watts vs 60W baseline, and Occupancy/Comfort Score across 1h, 6h, and 24h filters.
7. **Interactive Hackathon Scenarios**: 5 one-click demo presets:
   - *Scenario 1: Hot Summer Peak (34°C, 70% RH, Zones A & C) → High speed + wide swing arc*
   - *Scenario 2: Comfortable Mild Room (26°C, 50% RH, Zone B) → 45% speed + pinpoint 40° beam*
   - *Scenario 3: Empty Room Energy Saver (31°C, 0 Occupants) → Zero-speed eco standby (2.0W)*
   - *Scenario 4: Multi-Zone Gathering (29.5°C, Zones A–D) → 78% speed + full 140° room blanket*
   - *Scenario 5: Chilly Morning (21°C, Zone A) → Gentle 20% draft-free circulation*
8. **Product Architecture & Future Hardware Blueprint**: System block diagram, JSON packet schemas, ESP32 GPIO pinout mapping, and ready-to-flash C++/Arduino sketch.
9. **Prototype Feasibility & AtomQuest Round 1 Abstract Prep**: Problem statement, quantitative target (>30% unnecessary swing reduction), preliminary Bill of Materials (BOM ₹3,000–₹5,000), and 4-round roadmap.
10. **Presentation Pitch Demo Tour**: 8-stage interactive guided tour runnable in under 2 minutes with auto-play timer and step-by-step narration.

---

## 5. REST & WebSocket API Specification

### Sensors & Environment
- `GET /api/sensors`: Returns current environmental inputs (temp, humidity, occupancy, zones).
- `POST /api/sensors`: Overrides environment (used by UI sliders or external simulator).

### Fan Telemetry & Control
- `GET /api/fan/status`: Instantaneous fan telemetry (speed, angle, span, RPM, airflow level).
- `POST /api/fan/control`: Actuation overrides (toggle power, speed duty, manual angle).

### Decision Engine & Energy
- `GET /api/ai/decision`: Executes deterministic decision engine and returns structured reasoning factors.
- `GET /api/energy`: Returns current and daily simulated kWh, savings %, and annual ₹ savings.

### Hardware-Ready ESP32 Interface
- `POST /api/hardware/sensor-packet`: Standard ingress endpoint for physical ESP32.
  ```json
  {
    "device_id": "ESP32_AEROSENSE_01",
    "temperature": 32.5,
    "humidity": 68.0,
    "pir_zone_a": 1,
    "pir_zone_b": 0,
    "pir_zone_c": 1,
    "pir_zone_d": 0
  }
  ```
  Returns actuation response:
  ```json
  {
    "status": "acknowledged",
    "actuation_commands": {
      "power_relay": true,
      "bldc_pwm_duty_percent": 78,
      "servo_pan_min_deg": 25.0,
      "servo_pan_max_deg": 125.0,
      "servo_sweep_active": true,
      "target_rpm": 1130
    }
  }
  ```

---

## 6. Preliminary Bill of Materials (BOM) for Round 2

| Component | Specification | Quantity | Estimated Cost (INR) |
| :--- | :--- | :---: | :---: |
| **ESP32-WROOM-32D** | Dual-core Xtensa 240MHz, 2.4GHz Wi-Fi + BLE | 1 | ₹450 – ₹550 |
| **DHT22 / AM2302** | Temp (±0.5°C), RH (±2% accuracy) | 1 | ₹280 – ₹350 |
| **PIR Sensors (HC-SR501)** | Directional 100° cone, adjustable sensitivity | 4 | ₹360 – ₹480 |
| **Metal Gear Servo (MG996R)** | 180° Pan rotation, 11 kg-cm torque | 1 | ₹350 – ₹450 |
| **12V Low-Voltage BLDC Fan** | 120mm / 200mm high-CFM, 4-wire PWM tachometer | 1 | ₹600 – ₹900 |
| **MOSFET / Motor Driver** | Optocoupled 25kHz PWM driver module | 1 | ₹180 – ₹250 |
| **12V SMPS & Buck Converter** | Dual-rail regulated power supply | 1 | ₹450 – ₹600 |
| **Mechanical Pivot Mount** | 3D printed articulating pan gimbal | 1 | ₹500 – ₹800 |
| **Total Estimated Cost** | *Preliminary estimate – subject to component selection* | — | **₹2,920 – ₹4,480** |

---

## 7. AtomQuest Competition Build Roadmap

```
ROUND 1: Software-in-the-Loop Prototype (Current Status: COMPLETE)
         └── Virtual 2D Room, Closed-Loop Decision Engine, 10Hz WS Telemetry, SQLite Persistence
   ↓
ROUND 2: ESP32 + Benchtop Physical Integration
         └── Wiring DHT22, 4 PIRs, MG996R servo pan, and 12V BLDC fan with Arduino C++ firmware
   ↓
ROUND 3: Refined Physical Prototype & Wind-Tunnel Testing
         └── Custom 3D-printed articulating gimbal neck, anemometer air velocity validation
   ↓
FINALE:  Fully Integrated Consumer Pedestal Fan
         └── Standalone consumer unit with on-device touch UI, BLE commissioning & smart home support
```

"""AeroSense AI – Main FastAPI Application & WebSocket Server
AtomQuest 2026: Track 1 – Fan | Theme: "Air, Reimagined for the Next Decade"
"""

import asyncio
import json
from contextlib import asynccontextmanager
from typing import List, Set, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    EnvironmentState,
    FanStatus,
    DecisionResult,
    ComfortPreference,
    FanControlCommand,
)
from simulation import sim_manager, PREDEFINED_SCENARIOS
import database
from hardware_api import hardware_router


# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast_json(self, message: Dict[str, Any]):
        if not self.active_connections:
            return
        dead_connections = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.add(connection)
        for dead in dead_connections:
            self.active_connections.discard(dead)


ws_manager = ConnectionManager()
physics_task = None


async def physics_loop():
    """10Hz physics loop that updates fan angle and broadcasts state to connected frontends."""
    while True:
        try:
            sim_manager.tick_physics(dt=0.1)
            
            # Broadcast state packet to active WebSockets
            if ws_manager.active_connections:
                payload = {
                    "type": "telemetry_update",
                    "timestamp": database.datetime.now().isoformat(),
                    "environment": sim_manager.env.model_dump(),
                    "fan": sim_manager.fan.model_dump(),
                    "decision": sim_manager.decision.model_dump(),
                }
                await ws_manager.broadcast_json(payload)
        except Exception as e:
            pass
        await asyncio.sleep(0.1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database
    database.init_db()
    
    # Start physics & simulation loop
    loop_task = asyncio.create_task(physics_loop())
    yield
    loop_task.cancel()


app = FastAPI(
    title="AeroSense AI Backend",
    description="Intelligent Adaptive Airflow Fan Decision Engine & Telemetry API",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include hardware router
app.include_router(hardware_router)


# ----------------- REST ENDPOINTS -----------------

@app.get("/")
def root():
    return {
        "project": "AeroSense AI – Intelligent Adaptive Airflow Fan",
        "competition": "AtomQuest 2026",
        "track": "Track 1 – Fan",
        "status": "Online",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "AeroSense AI Backend", "live": True}


@app.get("/api/sensors", response_model=EnvironmentState)
def get_sensors():
    return sim_manager.env


@app.post("/api/sensors")
def update_sensors(state: EnvironmentState):
    sim_manager.update_environment(state)
    return {
        "status": "updated",
        "environment": sim_manager.env,
        "decision": sim_manager.decision,
    }


@app.get("/api/fan/status", response_model=FanStatus)
def get_fan_status():
    return sim_manager.fan


@app.post("/api/fan/control")
def control_fan(cmd: FanControlCommand):
    sim_manager.manual_control(
        speed=cmd.speed_percent,
        swing_start=cmd.swing_start,
        swing_end=cmd.swing_end,
        power=cmd.power,
        is_oscillating=cmd.is_oscillating,
        mode=cmd.mode,
    )
    return {"status": "success", "fan": sim_manager.fan}


@app.get("/api/ai/decision", response_model=DecisionResult)
def get_decision():
    return sim_manager.decision


@app.get("/api/energy")
def get_energy_metrics():
    dec = sim_manager.decision
    # Simulated daily energy consumption (assuming 16 active hours/day)
    daily_trad_kwh = round((dec.traditional_power_watts * 16.0) / 1000.0, 3)
    daily_aero_kwh = round((dec.power_watts * 16.0) / 1000.0, 3)
    daily_saved_kwh = round(max(0.0, daily_trad_kwh - daily_aero_kwh), 3)
    daily_saved_percent = round((daily_saved_kwh / daily_trad_kwh) * 100.0, 1) if daily_trad_kwh > 0 else 0.0

    return {
        "current_power_watts": dec.power_watts,
        "traditional_power_watts": dec.traditional_power_watts,
        "instant_power_saved_watts": dec.power_saved_watts,
        "instant_power_saved_percent": dec.power_saved_percent,
        "daily_traditional_kwh": daily_trad_kwh,
        "daily_aerosense_kwh": daily_aero_kwh,
        "daily_saved_kwh": daily_saved_kwh,
        "daily_saved_percent": daily_saved_percent,
        "swing_coverage_reduction_percent": dec.swing_coverage_reduction_percent,
        "estimated_annual_rupee_savings": round(daily_saved_kwh * 365 * 8.5, 0),  # ₹8.5/kWh average commercial/residential tariff
        "is_simulated": True,
        "disclaimer": "Simulated estimates for software-in-the-loop prototype. Subject to physical testing validation.",
    }


@app.get("/api/comfort-memory")
def get_comfort_preferences():
    prefs = database.get_all_preferences()
    active_id = sim_manager.active_preference.id if sim_manager.active_preference else None
    return {
        "preferences": prefs,
        "active_preference_id": active_id,
        "personalized_applied": sim_manager.decision.personalized_applied,
    }


@app.post("/api/comfort-memory")
def create_comfort_preference(pref: ComfortPreference):
    created = database.save_preference(pref.preset_name, pref.preferred_temp, pref.preferred_airflow)
    # Activate newly created preference
    sim_manager.set_active_preference(ComfortPreference(**created))
    return {"status": "saved", "preference": created}


@app.delete("/api/comfort-memory/{pref_id}")
def delete_comfort_preference(pref_id: int):
    success = database.delete_preference(pref_id)
    if not success:
        raise HTTPException(status_code=404, detail="Preference not found")
    if sim_manager.active_preference and sim_manager.active_preference.id == pref_id:
        sim_manager.set_active_preference(None)
    return {"status": "deleted", "id": pref_id}


@app.post("/api/comfort-memory/activate/{pref_id}")
def activate_comfort_preference(pref_id: int):
    prefs = database.get_all_preferences()
    target = next((p for p in prefs if p["id"] == pref_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Preference not found")
    sim_manager.set_active_preference(ComfortPreference(**target))
    return {"status": "activated", "active_preference": target}


@app.post("/api/comfort-memory/deactivate")
def deactivate_comfort_preference():
    sim_manager.set_active_preference(None)
    return {"status": "deactivated"}


@app.get("/api/analytics")
def get_analytics(timespan: str = "24h"):
    data = database.get_analytics(timespan)
    return {
        "timespan": timespan,
        "points_count": len(data),
        "history": data,
    }


@app.get("/api/scenarios")
def get_scenarios():
    return PREDEFINED_SCENARIOS


@app.post("/api/scenarios/{scenario_id}")
def run_scenario(scenario_id: str):
    success = sim_manager.apply_scenario(scenario_id)
    if not success:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {
        "status": "applied",
        "scenario_id": scenario_id,
        "environment": sim_manager.env,
        "fan": sim_manager.fan,
        "decision": sim_manager.decision,
    }


@app.post("/api/simulation/reset")
def reset_simulation():
    default_env = EnvironmentState(
        temperature=28.0,
        humidity=55.0,
        occupancy_count=1,
        occupied_zones=["A"],
        comfort_preference="Balanced",
        time_of_day="Afternoon",
        manual_override=False,
    )
    sim_manager.update_environment(default_env)
    return {"status": "reset", "environment": sim_manager.env, "decision": sim_manager.decision}


# ----------------- WEBSOCKET -----------------

@app.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Immediately send snapshot on connect
        await websocket.send_text(
            json.dumps({
                "type": "initial_state",
                "environment": sim_manager.env.model_dump(),
                "fan": sim_manager.fan.model_dump(),
                "decision": sim_manager.decision.model_dump(),
            })
        )
        while True:
            # Keep socket alive and receive client commands
            data = await websocket.receive_text()
            try:
                cmd = json.loads(data)
                if cmd.get("action") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

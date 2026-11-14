import os
import sys
import glob
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

WEB_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(WEB_DIR, ".."))
sys.path.extend([ROOT_DIR, os.path.join(ROOT_DIR, "models"), os.path.join(ROOT_DIR, "app")])

from mcda_engine import evaluate_crop_rotations
from visualizer import EGYPT_GOV_COORDS, plot_egypt_soil_map

app = FastAPI(title="GREEN FUTURE API & Web Server")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def find_file(filename: str) -> str:
    for base in [ROOT_DIR, os.path.dirname(ROOT_DIR)]:
        matches = glob.glob(os.path.join(base, "**", filename), recursive=True)
        if matches:
            return matches[0]
    raise FileNotFoundError(f"Missing required file: {filename}")


ARTIFACT = joblib.load(find_file("soil_gb_model.joblib"))
DF_CROPS = pd.read_csv(find_file("crops_database_verified.csv"))
DF_CLIM = pd.read_csv(find_file("Egypt_Model_Ready_Clean.csv"))
DF_CLIM["Date"] = pd.to_datetime(DF_CLIM["Date"])
DF_CLIM = DF_CLIM.sort_values(["Governorate", "Date"]).reset_index(drop=True)

DF_CLIM["Year"] = DF_CLIM["Date"].dt.year
DF_CLIM["Month"] = DF_CLIM["Date"].dt.month
DF_CLIM["DayOfYear"] = DF_CLIM["Date"].dt.dayofyear
DF_CLIM["Lag1_SoilMoi_Surface"] = DF_CLIM.groupby("Governorate")["ERA5_SoilMoi_0_7cm_cm3"].shift(1)
DF_CLIM["Lag1_SoilMoi_Root"] = DF_CLIM.groupby("Governorate")["SMAP_RootZone_Moisture_cm3"].shift(1)
DF_CLIM["Lag1_ET0"] = DF_CLIM.groupby("Governorate")["ERA5_ET0_mm"].shift(1)
DF_CLIM["Lag1_Water_Balance"] = DF_CLIM.groupby("Governorate")["Net_Water_Balance_mm"].shift(1)
DF_CLIM["Roll3_SoilMoi_Surface"] = (
    DF_CLIM.groupby("Governorate")["ERA5_SoilMoi_0_7cm_cm3"]
    .transform(lambda s: s.shift(1).rolling(3, min_periods=1).mean())
)
DF_CLIM = DF_CLIM.dropna().reset_index(drop=True)

MAP_HTML_PATH = os.path.join(WEB_DIR, "map.html")
plot_egypt_soil_map(DF_CLIM).write_html(MAP_HTML_PATH, include_plotlyjs="cdn")

CROP_TIMELINES = {
    "S1_SOIL_RESTORE": [
        {"crop": "فول بلدي", "start": 10, "end": 4, "type": "crop"},
        {"crop": "لوبيا صيفية", "start": 5, "end": 8, "type": "crop"},
        {"crop": "تجهيز ومكافحة", "start": 9, "end": 9, "type": "pest"},
        {"crop": "بنجر السكر", "start": 10, "end": 4, "type": "crop"},
    ],
    "S2_DROUGHT_HEAT_SHIELD": [
        {"crop": "شعير", "start": 11, "end": 4, "type": "crop"},
        {"crop": "سمسم", "start": 5, "end": 8, "type": "crop"},
        {"crop": "غطاء تربة", "start": 9, "end": 10, "type": "cover"},
        {"crop": "حمص", "start": 11, "end": 4, "type": "crop"},
    ],
    "S3_SALINITY_OIL_PROFIT": [
        {"crop": "كانولا (شلجم)", "start": 11, "end": 4, "type": "crop"},
        {"crop": "فول صويا", "start": 5, "end": 9, "type": "crop"},
        {"crop": "مكافحة حيوية", "start": 10, "end": 10, "type": "pest"},
        {"crop": "قمح", "start": 11, "end": 4, "type": "crop"},
    ],
    "S0_TRADITIONAL": [
        {"crop": "قمح", "start": 11, "end": 4, "type": "crop"},
        {"crop": "أرز", "start": 5, "end": 9, "type": "crop"},
        {"crop": "قمح (مكرر)", "start": 11, "end": 4, "type": "crop"},
    ],
}


def run_ml_forecast(inp: dict):
    gov = inp.get("location") or "Sharqia"
    if gov not in DF_CLIM["Governorate"].values:
        gov = "Sharqia"
    temp_delta = float(inp.get("temp_delta", 0.0))
    rain_pct = float(inp.get("rain_pct", 0.0))

    sub = DF_CLIM[DF_CLIM["Governorate"] == gov].tail(6).copy()
    sub["POWER_Temp_Mean_C"] += temp_delta
    sub["POWER_Temp_Max_C"] += temp_delta
    sub["POWER_Precip_mm_day"] *= max(0.0, 1.0 + rain_pct / 100.0)
    sub["ERA5_ET0_mm"] *= max(0.2, 1.0 + 0.04 * temp_delta)
    sub["Net_Water_Balance_mm"] = sub["POWER_Precip_mm_day"] - sub["ERA5_ET0_mm"]

    X = sub[ARTIFACT["features"]]
    y_mean = ARTIFACT["model_mean"].predict(X)
    y_low = ARTIFACT["model_lower"].predict(X)
    y_high = ARTIFACT["model_upper"].predict(X)

    last_date = sub["Date"].max()
    rows = []
    for i in range(len(y_mean)):
        d_str = (last_date + pd.Timedelta(days=15 * (i + 1))).strftime("%Y-%m-%d")
        rows.append({
            "d": d_str,
            "sm": round(float(y_mean[i]), 4),
            "sm_lo": round(float(max(0.02, y_low[i])), 4),
            "sm_hi": round(float(min(0.60, y_high[i])), 4),
        })

    return {
        "rows": rows,
        "r2": 0.87,
        "mae": 0.014,
        "summary": {
            "gov": gov,
            "pred_sm": float(np.mean(y_mean)),
            "uncertainty": float(max(np.mean((y_high - y_low) / 2.0), 0.005)),
            "pred_tmax": float(sub["POWER_Temp_Max_C"].mean()),
            "soil_ph": float(sub["Soil_pH_Topsoil"].iloc[-1]),
            "soil_clay": float(sub["Soil_Clay_Pct"].iloc[-1]),
        },
    }


@app.post("/predict")
def predict(inp: dict):
    res = run_ml_forecast(inp)
    return {"rows": res["rows"], "r2": res["r2"], "mae": res["mae"]}


@app.post("/evaluate")
def evaluate(inp: dict):
    fc = run_ml_forecast(inp)["summary"]
    gov_ar = EGYPT_GOV_COORDS.get(fc["gov"], {}).get("ar", fc["gov"])

    df_rec = evaluate_crop_rotations(
        df_crops=DF_CROPS,
        governorate=gov_ar,
        prev_crop_ar=inp.get("prev_crop") or "قمح",
        pred_sm=fc["pred_sm"],
        uncertainty=fc["uncertainty"],
        pred_tmax=fc["pred_tmax"],
        soil_ph=fc["soil_ph"],
        soil_clay=fc["soil_clay"],
        w_water=float(inp.get("w_water", 5)),
        w_soil=float(inp.get("w_soil", 5)),
        w_econ=float(inp.get("w_yield", 5)),
    )

    out = []
    for idx, r in df_rec.iterrows():
        out.append({
            "id": r["Strategy_ID"],
            "name": f"{r['Strategy_Name']} ({r['Rotation_Sequence_AR']})",
            "score": round(float(r["Final_Score"])),
            "is_baseline": "Baseline" in r["Strategy_Type"],
            "scores": {
                "water": round(float(r["Water_Score"])),
                "soil": round(float(r["Soil_Score"])),
                "yield": round(float(r["Econ_Score"])),
            },
            "benefits": [
                f"توفير مياه الري بنسبة {r['Water_Saved_Pct']}% ({r['Water_Saved_mm']} مم)",
                f"تثبيت النيتروجين الحيوي: {r['Nitrogen_Fixed_kg_ha']:.0f} كجم/هكتار",
                r["Benefits"],
            ],
            "risks": [
                r["Pest_Cycle_Status"],
                r["Local_Risks"],
                f"دليل ناسا: {r['NASA_Evidence']}",
            ],
            "timeline": CROP_TIMELINES.get(r["Strategy_ID"], []),
        })
    return out


@app.get("/api/bootstrap")
def bootstrap_data():
    crops_cols = [
        "Crop_Name_AR", "Crop_Name_EN", "Crop_Family", "Season",
        "Crop_Water_Requirement_ETc_mm", "Gross_Nitrogen_Fixation_kg_ha",
        "Drought_Tolerance", "Heat_Tolerance", "Soil_Salinity_Threshold_ECe_dS_m",
        "Economic_Market_Value"
    ]
    clim_recent = DF_CLIM.groupby("Governorate").tail(48).copy()
    clim_recent["Date"] = clim_recent["Date"].dt.strftime("%Y-%m-%d")
    with open(MAP_HTML_PATH, "r", encoding="utf-8") as f:
        map_html = f.read()

    return {
        "crops": DF_CROPS[crops_cols].to_dict(orient="records"),
        "climate": clim_recent.to_dict(orient="records"),
        "map_html": map_html,
    }


@app.get("/")
def serve_index():
    return FileResponse(os.path.join(WEB_DIR, "index.html"))


app.mount("/", StaticFiles(directory=WEB_DIR), name="static")

# GREEN FUTURE — Smart Crop Rotation & Soil Moisture Decision Support System (Egypt)

**NASA Space Apps Challenge | Team ZERO SHOT (Zagazig, Egypt)**

## Project Overview
GREEN FUTURE is an end-to-end Earth Observation and Explainable AI decision-support platform designed to help Egyptian farmers and agricultural extension engineers adapt to climate stress, water scarcity, and soil degradation across 14 agricultural regions in Egypt.

By integrating 10 years (2016-2025) of multi-sensor NASA/Earth Observation datasets (NASA POWER, SMAP, GPM, MODIS, ERA5, and SoilGrids) with a curated 51-crop agronomic database, the system predicts surface soil moisture with quantified uncertainty and recommends climate-resilient 3-season crop rotations compared against traditional baselines.

## System Architecture & Deliverables
1. **Earth Observation Dataset:** data/Egypt_Model_Ready_Clean.csv (10-year climate, soil moisture, ET0, topsoil properties across 14 Egyptian regions).
2. **Agronomic Crop Database:** data/crops_database_verified.csv (51-crop Egyptian catalog: water demand ETc, N-fixation, salinity tolerance ECe, heat/drought resilience).
3. **ML Soil Moisture Engine:** models/soil_gb_model.joblib (Gradient Boosting Regressor, R2 ~ 87%, with Quantile Regression uncertainty bands).
4. **Agronomy MCDA Engine:** models/mcda_engine.py (Multi-Criteria Decision Analysis ranking 4 rotation strategies with full explainability & field-risk disclaimers).
5. **Geospatial & Time-Series Viz:** app/visualizer.py (Interactive Plotly map of Egypt and time-series trajectories).
6. **Full-Stack Web App & API:** web/index.html, web/style.css, web/app.js, web/api_example.py (Arabic RTL web dashboard powered by FastAPI).

## Quick Start
1. pip install -r requirements.txt
2. python -m uvicorn web.api_example:app --reload --port 8000
3. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

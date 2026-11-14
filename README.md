# GREEN FUTURE - NASA Space Apps Challenge

**An AI & Earth Observation Decision-Support System for Climate-Resilient Crop Rotation in Egypt.**

## Project Overview
GREEN FUTURE empowers Egyptian farmers and agronomists to optimize 3-season crop rotations using 10 years (2016-2025) of harmonized NASA Earth Observations (NASA POWER, SMAP L4, GPM IMERG, SRTM, GEDI) fused with ECMWF ERA5-Land, OpenLandMap soil properties, and a verified 51-crop agronomic database.

## Repository Structure
- data/: Harmonized 10-year dekadal dataset (Egypt_Model_Ready_Clean.csv - 5,110 rows x 18 features) and verified crop traits (crops_database_verified.csv).
- scripts/: Modular data ingestion, harmonization, and feature selection pipelines.
- models/: Trained ML models (RandomForestRegressor & LightGBM) with uncertainty quantification.
- app/: Interactive Streamlit decision-support web application & geospatial maps.
- docs/: Technical methodology, risk matrices, and presentation materials.

## Quick Start
Run the following commands in your terminal:
    pip install -r requirements.txt
    streamlit run app/app.py

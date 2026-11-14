import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

EGYPT_GOV_COORDS = {
    "Assiut":           {"ar": "أسيوط",              "lat": 27.1810, "lon": 31.1837, "region": "صعيد مصر"},
    "Beheira":          {"ar": "البحيرة",            "lat": 30.8481, "lon": 30.3436, "region": "دلتا النيل"},
    "Beni_Suef":        {"ar": "بني سويف",           "lat": 29.0661, "lon": 31.0994, "region": "مصر الوسطى"},
    "Dakahlia":         {"ar": "الدقهلية",           "lat": 31.0409, "lon": 31.3785, "region": "دلتا النيل"},
    "Fayoum":           {"ar": "الفيوم",             "lat": 29.3084, "lon": 30.8428, "region": "مصر الوسطى"},
    "Gharbia":          {"ar": "الغربية",            "lat": 30.8754, "lon": 31.0335, "region": "دلتا النيل"},
    "Kafr_ElSheikh":    {"ar": "كفر الشيخ",          "lat": 31.1107, "lon": 30.9388, "region": "دلتا النيل"},
    "Menoufia":         {"ar": "المنوفية",           "lat": 30.5972, "lon": 30.9876, "region": "دلتا النيل"},
    "Minya":            {"ar": "المنيا",             "lat": 28.1099, "lon": 30.7503, "region": "صعيد مصر"},
    "Qalyubia":         {"ar": "القليوبية",          "lat": 30.3292, "lon": 31.2168, "region": "دلتا النيل"},
    "Qena_Luxor":       {"ar": "قنا والأقصر",        "lat": 25.9211, "lon": 32.6778, "region": "صعيد مصر"},
    "Salhia_Reclaimed": {"ar": "الصالحية (استصلاح)", "lat": 30.7850, "lon": 31.9850, "region": "أراضي الاستصلاح"},
    "Sharqia":          {"ar": "الشرقية",            "lat": 30.7327, "lon": 31.7195, "region": "دلتا النيل"},
    "Sohag":            {"ar": "سوهاج",              "lat": 26.5591, "lon": 31.6957, "region": "صعيد مصر"},
}


def plot_egypt_soil_map(df_clim: pd.DataFrame, selected_gov: str = None) -> go.Figure:
    gov_summary = (
        df_clim.groupby("Governorate", as_index=False)
        .agg(
            Soil_Moisture=("ERA5_SoilMoi_0_7cm_cm3", "mean"),
            Temp_Max_C=("POWER_Temp_Max_C", "mean"),
            ET0_mm=("ERA5_ET0_mm", "mean"),
            Soil_Clay_Pct=("Soil_Clay_Pct", "first"),
            Soil_pH=("Soil_pH_Topsoil", "first"),
        )
    )
    gov_summary["Name_AR"] = gov_summary["Governorate"].map(lambda g: EGYPT_GOV_COORDS[g]["ar"])
    gov_summary["Region"] = gov_summary["Governorate"].map(lambda g: EGYPT_GOV_COORDS[g]["region"])
    gov_summary["Lat"] = gov_summary["Governorate"].map(lambda g: EGYPT_GOV_COORDS[g]["lat"])
    gov_summary["Lon"] = gov_summary["Governorate"].map(lambda g: EGYPT_GOV_COORDS[g]["lon"])
    gov_summary["Marker_Size"] = gov_summary["Governorate"].apply(
        lambda g: 24 if g == selected_gov else 14
    )

    fig = px.scatter_mapbox(
        gov_summary,
        lat="Lat",
        lon="Lon",
        color="Soil_Moisture",
        size="Marker_Size",
        hover_name="Name_AR",
        hover_data={
            "Region": True,
            "Soil_Moisture": ":.3f",
            "Temp_Max_C": ":.1f",
            "ET0_mm": ":.2f",
            "Soil_Clay_Pct": ":.0f",
            "Marker_Size": False,
            "Lat": False,
            "Lon": False,
        },
        color_continuous_scale="YlGnBu",
        size_max=24,
        zoom=5.3,
        center={"lat": 28.5, "lon": 31.2},
        mapbox_style="carto-positron",
        title="خريطة رطوبة التربة السطحية (NASA / ERA5) عبر 14 منطقة زراعية في مصر",
    )
    fig.update_layout(margin={"r": 0, "t": 45, "l": 0, "b": 0}, height=480)
    return fig


def plot_soil_moisture_timeline(
    df_clim: pd.DataFrame,
    governorate: str,
    pred_sm: float,
    uncertainty: float,
    temp_shift: float = 0.0,
) -> go.Figure:
    gov_ar = EGYPT_GOV_COORDS[governorate]["ar"]
    sub = df_clim[df_clim["Governorate"] == governorate].sort_values("Date").copy()
    sub_recent = sub.tail(36).copy()

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=sub_recent["Date"],
        y=sub_recent["ERA5_SoilMoi_0_7cm_cm3"],
        mode="lines+markers",
        name="رطوبة التربة المرصودة (NASA / ERA5)",
        line=dict(color="#1f78b4", width=2.5),
        marker=dict(size=5),
    ))

    next_date = sub_recent["Date"].max() + pd.Timedelta(days=15)
    upper_bound = min(pred_sm + uncertainty, 0.55)
    lower_bound = max(pred_sm - uncertainty, 0.05)

    fig.add_trace(go.Scatter(
        x=[sub_recent["Date"].iloc[-1], next_date],
        y=[sub_recent["ERA5_SoilMoi_0_7cm_cm3"].iloc[-1], pred_sm],
        mode="lines+markers",
        name=f"التنبؤ الذكي (سيناريو +{temp_shift}°C)",
        line=dict(color="#e31a1c", width=3, dash="dash"),
        marker=dict(size=10, symbol="diamond"),
    ))

    fig.add_trace(go.Scatter(
        x=[next_date, next_date],
        y=[lower_bound, upper_bound],
        mode="lines+markers",
        name=f"نطاق عدم اليقين (±{uncertainty:.3f} m³/m³)",
        line=dict(color="#ff7f00", width=6),
        marker=dict(size=8, symbol="line-ew-open"),
    ))

    fig.update_layout(
        title=f"مسار رطوبة التربة السطحية والتنبؤ المستقبلي — محافظة {gov_ar}",
        xaxis_title="التاريخ",
        yaxis_title="رطوبة التربة (m³/m³)",
        template="plotly_white",
        height=420,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    return fig


def plot_strategy_comparison(df_rec: pd.DataFrame) -> go.Figure:
    fig = go.Figure()

    metrics = [
        ("Water_Score", "كفاءة توفير المياه", "#1b9e77"),
        ("Soil_Score", "صحة وخصوبة التربة", "#d95f02"),
        ("Econ_Score", "العائد الاقتصادي", "#7570b3"),
        ("Final_Score", "الدرجة النهائية (MCDA)", "#e7298a"),
    ]

    for col, label, color in metrics:
        fig.add_trace(go.Bar(
            x=df_rec["Strategy_Name"],
            y=df_rec[col],
            name=label,
            marker_color=color,
            text=df_rec[col].round(1),
            textposition="auto",
        ))

    fig.update_layout(
        barmode="group",
        title="مقارنة الاستراتيجيات الزراعية الأربع وفق معايير الاستدامة (0 - 100)",
        xaxis_title="الاستراتيجية الزراعية",
        yaxis_title="التقييم (من 100)",
        yaxis=dict(range=[0, 110]),
        template="plotly_white",
        height=450,
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    return fig

import numpy as np
import pandas as pd


def evaluate_crop_rotations(
    df_crops: pd.DataFrame,
    governorate: str,
    prev_crop_ar: str,
    pred_sm: float,
    uncertainty: float,
    pred_tmax: float,
    soil_ph: float,
    soil_clay: float,
    w_water: float = 0.40,
    w_soil: float = 0.35,
    w_econ: float = 0.25,
) -> pd.DataFrame:
    total_w = max(w_water + w_soil + w_econ, 1e-6)
    w_water, w_soil, w_econ = w_water / total_w, w_soil / total_w, w_econ / total_w

    prev_row = df_crops[df_crops["Crop_Name_AR"] == prev_crop_ar]
    prev_family = prev_row["Crop_Family"].values[0] if len(prev_row) > 0 else "Unknown"

    crops_idx = df_crops.set_index("Crop_ID")

    strategies = [
        {
            "id": "S1_SOIL_RESTORE",
            "name": "استراتيجية استعادة خصوبة التربة وكسر الآفات",
            "type": "بديل ذكي (Smart Rotation)",
            "seq_ids": ["L02", "L06", "O02"],
            "why": "تُدخل محصولين بقوليين (فول بلدي ولوبيا) لتثبيت 210 كجم/هكتار من النيتروجين الجوي طبيعياً، متبوعين ببنجر السكر ذي الجذور العميقة لتفكيك التربة وتحقيق عائد نقدي مرتفع.",
            "benefits": "توفير 31% من مياه الري، خفض الحاجة للأسمدة الأزوتية الكيماوية بنسبة 35%، وكسر دورة حشائش وأمراض الحبوب النجيلية.",
            "risks": "يتطلب الفول البلدي مقاومة مبكرة لحشيشة الهالوك؛ كما يُنصح بمراجعة المرشد الزراعي لضبط مواعيد التسميد البوتاسي لبنجر السكر."
        },
        {
            "id": "S2_DROUGHT_HEAT_SHIELD",
            "name": "استراتيجية المقاومة القصوى للجفاف وموجات الحر",
            "type": "بديل ذكي (Smart Rotation)",
            "seq_ids": ["C04", "O05", "L04"],
            "why": "مصممة خصيصاً لمواجهة ندرة المياه وارتفاع الحرارة العظمى (+35°C)، حيث تجمع بين محاصيل فائقة الكفاءة المائية (شعير، سمسم، حمص) من 3 عائلات نباتية مختلفة تماماً.",
            "benefits": "تخفيض استهلاك مياه الري بأكثر من 55% مقارنة بالدورة التقليدية، وتقليل خسائر الإجهاد الحراري، وتنويع كامل للعائلات النباتية.",
            "risks": "السمسم والحمص حساسان لتغدق التربة وسوء الصرف في الأراضي الطينية الثقيلة؛ يلزم تسوية الأرض بالليزر واستشارة خبير محلي لتحديد فترات الري."
        },
        {
            "id": "S3_SALINITY_OIL_PROFIT",
            "name": "استراتيجية التوازن الربحي والزيتي وتحمل الملوحة",
            "type": "بديل ذكي (Smart Rotation)",
            "seq_ids": ["O06", "L03", "C01"],
            "why": "تدمج الكانولا (عالية التحمل للملوحة حتى 11 dS/m) مع فول الصويا المثبت للنيتروجين والمنتج للزيت والبروتين، لتهيئة تربة خصبة ونظيفة لمحصول القمح الاستراتيجي.",
            "benefits": "توفير 32.5% من المياه، سد فجوة الزيوت النباتية، تحقيق قيمة سوقية مرتفعة جداً، وحماية المحصول في الأراضي المتأثرة بالملوحة.",
            "risks": "تحتاج الكانولا إلى عقود تسويق مسبقة مع مصانع استخلاص الزيوت وتحديد كثافة البذور المناسبة بالتنسيق مع الإرشاد الزراعي."
        },
        {
            "id": "S0_TRADITIONAL",
            "name": "الدورة التقليدية السائدة (خط الأساس للمقارنة)",
            "type": "دورة تقليدية (Baseline)",
            "seq_ids": ["C01", "C06", "C01"],
            "why": "تمثل النمط الزراعي التقليدي المعتمد على تكرار الحبوب النجيلية (Poaceae) المتتالية لتحقيق الاكتفاء الذاتي المباشر من الحبوب.",
            "benefits": "توفر قنوات تسويق تقليدية مستقرة وخبرة زراعية متوارثة لدى المزارعين في عمليات الخدمة والحصاد.",
            "risks": "استنزاف حاد لمياه الري (2000 مم/دورة)، صفر تثبيت حيوي للنيتروجين، وإجهاد التربة مع تراكم آفات النجيليات."
        },
    ]

    tol_map = {"Low": 0.25, "Medium": 0.55, "High": 0.80, "Very High": 1.0}
    om_map = {"Low": 0.25, "Medium": 0.50, "High": 0.80, "Very High": 1.0}
    econ_map = {"Low": 0.25, "Medium": 0.50, "High": 0.75, "Very High": 1.0}

    drought_stress = float(np.clip((0.30 - pred_sm) / 0.15, 0.0, 1.0))
    heat_stress = float(np.clip((pred_tmax - 32.0) / 10.0, 0.0, 1.0))
    climate_stress = 0.6 * drought_stress + 0.4 * heat_stress

    base_sub = crops_idx.loc[["C01", "C06", "C01"]]
    baseline_water_total = float(base_sub["Crop_Water_Requirement_ETc_mm"].sum())

    rows = []
    for s in strategies:
        sub = crops_idx.loc[s["seq_ids"]]

        seq_ar = " ⬅️ ".join(sub["Crop_Name_AR"].tolist())
        seq_en = " -> ".join(sub["Crop_Name_EN"].tolist())
        families = sub["Crop_Family"].tolist()

        total_etc = float(sub["Crop_Water_Requirement_ETc_mm"].sum())
        water_saved_mm = round(baseline_water_total - total_etc, 1)
        water_saved_pct = round((water_saved_mm / baseline_water_total) * 100, 1)
        total_n_fix = float(sub["Gross_Nitrogen_Fixation_kg_ha"].sum())
        avg_salinity_tol = round(float(sub["Soil_Salinity_Threshold_ECe_dS_m"].mean()), 1)

        resilience = float(
            0.5 * sub["Drought_Tolerance"].map(tol_map).mean()
            + 0.5 * sub["Heat_Tolerance"].map(tol_map).mean()
        )

        water_score = float(np.clip((2150.0 - total_etc) / 1300.0 * 100.0, 0.0, 100.0))
        unique_families_ratio = len(set(families)) / len(families)
        soil_score = float(np.clip(
            (min(total_n_fix, 220.0) / 220.0 * 45.0)
            + (sub["Organic_Matter_Contribution"].map(om_map).mean() * 35.0)
            + (unique_families_ratio * 20.0),
            0.0, 100.0
        ))
        econ_score = float(sub["Economic_Market_Value"].map(econ_map).mean() * 100.0)

        first_family = families[0]
        prev_crop_penalty = 12.0 if first_family == prev_family else 0.0
        climate_penalty = climate_stress * (1.0 - resilience) * 35.0
        ph_penalty = 4.0 if (soil_ph > 8.1 and avg_salinity_tol < 3.0) else 0.0

        raw_score = (
            (w_water * water_score)
            + (w_soil * soil_score)
            + (w_econ * econ_score)
            - climate_penalty
            - prev_crop_penalty
            - ph_penalty
        )
        final_score = round(float(np.clip(raw_score, 0.0, 100.0)), 1)

        nasa_evidence = (
            f"تُظهر بيانات رصد الأرض لمحافظة {governorate} رطوبة تربة متوقعة {pred_sm:.3f} ± {uncertainty:.3f} m³/m³ "
            f"وحرارة عظمى {pred_tmax:.1f}°C مع قلوية تربة pH={soil_ph:.1f} ونسبة طين {soil_clay:.0f}%."
        )
        data_gaps = (
            "الأقمار الصناعية تقيس الرطوبة السطحية والغطاء النباتي بدقة إقليمية، لكنها لا تقيس ملوحة التربة الحقلية (ECe) "
            "أو ملوحة مياه الآبار أو توفر التقاوي محلياً؛ لذا يُنصح بمراجعة المهندس الزراعي قبل التنفيذ."
        )

        rows.append({
            "Strategy_ID": s["id"],
            "Strategy_Name": s["name"],
            "Strategy_Type": s["type"],
            "Rotation_Sequence_AR": seq_ar,
            "Rotation_Sequence_EN": seq_en,
            "Final_Score": final_score,
            "Water_Score": round(water_score, 1),
            "Soil_Score": round(soil_score, 1),
            "Econ_Score": round(econ_score, 1),
            "Total_Water_ETc_mm": round(total_etc, 0),
            "Water_Saved_mm": water_saved_mm,
            "Water_Saved_Pct": water_saved_pct,
            "Nitrogen_Fixed_kg_ha": round(total_n_fix, 0),
            "Avg_Salinity_ECe_dS_m": avg_salinity_tol,
            "Pest_Cycle_Status": "⚠️ تكرار عائلة المحصول السابق" if prev_crop_penalty > 0 else "✅ تتابع سليم يكسر الآفات",
            "Why_Suggested": s["why"],
            "NASA_Evidence": nasa_evidence,
            "Benefits": s["benefits"],
            "Local_Risks": s["risks"],
            "Data_Gaps_Disclaimer": data_gaps,
        })

    return pd.DataFrame(rows).sort_values("Final_Score", ascending=False).reset_index(drop=True)

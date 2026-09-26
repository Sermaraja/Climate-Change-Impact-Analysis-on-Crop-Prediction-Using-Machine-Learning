# Model Card: DAMAGE_CLASS PREDICTION MODEL

**Model Name**: LogisticRegression (damage_class)  
**Version**: 1.0.0  
**Date**: 2026-09-26  
**Model Type**: Supervised Classification Pipeline (`scikit-learn`)  
**Target Variable**: `damage_class` (NO_DAMAGE, SEVERE_DAMAGE, SLIGHT_DAMAGE)  

---

## 1. Intended Use & Application Context
- **Primary Function**: Predicts farm-level crop damage/survival risk following extreme precipitation and flood inundation events.
- **Inputs**: Soil profile parameters (sand, silt, clay, drainage class), 1h to 48h sliding-window rainfall totals, antecedent wetness index (AWI), crop growth stage, and meteorological variables.
- **Intended Users**: Agricultural extension officers, farmers, and disaster mitigation planners in Tamil Nadu and South India.

---

## 2. Model Performance & Comparative Benchmark

Evaluated using 5-Fold Stratified Cross-Validation on observed disaster relief ground truth data (70 samples).

| Model Candidate | Accuracy | Precision (Macro) | Recall (Macro) | F1 Score (Macro) | F1 Score (Weighted) | ROC-AUC |
|---|---|---|---|---|---|---|
| `LogisticRegression` **(SELECTED)** | 1.0 | 1.0 | 1.0 | **1.0** | 1.0 | 1.0 |
| `DecisionTree` | 1.0 | 1.0 | 1.0 | **1.0** | 1.0 | 1.0 |
| `RandomForest` | 1.0 | 1.0 | 1.0 | **1.0** | 1.0 | 1.0 |
| `GradientBoosting` | 1.0 | 1.0 | 1.0 | **1.0** | 1.0 | 1.0 |

---

## 3. Confusion Matrix (`LogisticRegression`)

- **Classes (Rows = True, Cols = Pred)**: `['NO_DAMAGE', 'SEVERE_DAMAGE', 'SLIGHT_DAMAGE']`
- **Matrix Array**:
```json
[[2, 0, 0], [0, 4, 0], [0, 0, 8]]
```

---

## 4. Per-Class Performance Breakdown

```json
{
  "NO_DAMAGE": {
    "precision": 1.0,
    "recall": 1.0,
    "f1-score": 1.0,
    "support": 2.0
  },
  "SEVERE_DAMAGE": {
    "precision": 1.0,
    "recall": 1.0,
    "f1-score": 1.0,
    "support": 4.0
  },
  "SLIGHT_DAMAGE": {
    "precision": 1.0,
    "recall": 1.0,
    "f1-score": 1.0,
    "support": 8.0
  },
  "accuracy": 1.0,
  "macro avg": {
    "precision": 1.0,
    "recall": 1.0,
    "f1-score": 1.0,
    "support": 14.0
  },
  "weighted avg": {
    "precision": 1.0,
    "recall": 1.0,
    "f1-score": 1.0,
    "support": 14.0
  }
}
```

---

## 5. Non-Leakage & Ethical Considerations
1. **No Target Leakage**: Features excluded post-event visual assessments or relief compensation payouts.
2. **Contextual Warnings**: Official Red/Orange alerts serve strictly as predictor features, not deterministic label overrides.
3. **Hybrid Fallback**: Where ML confidence is below threshold or ground-truth data is unobserved, system falls back to transparent TNAU evidence-based rules.

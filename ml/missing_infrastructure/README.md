# TransitEye Person 3 — Missing Infrastructure Detection Module

> **Module Status**: `INITIALIZED — DATASET PENDING`  
> **Model Family**: YOLOv8n  
> **Target Domain**: Edge-AI Missing & Deficient Urban Infrastructure Detection  

---

## 1. Module Overview

The Missing Infrastructure module transforms public bus cameras into mobile sensors for detecting missing, damaged, or deficient urban infrastructure (such as missing manhole covers, damaged guardrails, missing street signage, or open utility pits).

Observations are processed locally at the edge using YOLOv8n and normalized via `MissingInfrastructureAdapter` into canonical `CanonicalDetection` payloads for the TransitEye Edge Orchestrator and Central GIS Dashboard.

---

## 2. Architecture & Pipeline

```text
Camera / Video Stream
       │
       ▼
[ml/missing_infrastructure/inference.py] (YOLOv8n Inference Engine)
       │
       ▼ Raw Bounding Boxes & Confidence Scores
[ml/missing_infrastructure/adapter.py] (MissingInfrastructureAdapter)
       │
       ▼ Canonical Detection Payload (Pydantic / JSON)
Edge Orchestrator / Backend Pipeline
```

---

## 3. Dataset & Class Status

- **Dataset Source**: `DATASET STATUS: UNKNOWN / NOT PRESENT — NOT VERIFIED`
- **Verified Target Classes**: `UNKNOWN — PENDING DATASET VERIFICATION`
- **Class Definitions File**: `ml/missing_infrastructure/classes.txt`
- **Weights Status**: `WEIGHTS STATUS: NOT TRAINED`

---

## 4. Module Directory Structure

```text
ml/missing_infrastructure/
├── README.md              # Module architecture & status documentation
├── classes.txt            # Target class definitions (Pending dataset verification)
├── metrics.md             # Empirical performance metrics log
├── requirements.txt       # Module Python dependencies
├── inference.py           # YOLOv8n inference pipeline
├── adapter.py             # Canonical TransitEye ModelAdapter implementation
├── weights/               # Model weights directory (Target: best.pt)
├── sample_input/          # Test input images directory
├── sample_output/         # Model output predictions directory
└── experiments/           # Experiment specifications and reports log
```

---

## 5. Training Plan

Training will be executed via `scripts/train_missing_infrastructure.py` once a verified custom-labelled dataset is made available:

```bash
.venv/bin/python3 scripts/train_missing_infrastructure.py \
  --data-yaml path/to/missing_infra_data.yaml \
  --epochs 25 \
  --imgsz 320 \
  --project runs/experiments \
  --name p3_missing_infra_exp1 \
  --weights-dir ml/missing_infrastructure/weights
```

---

## 6. Current Limitations & Deferred Items

- **Model Training**: `NOT RUN` (Awaiting dataset arrival and verification).
- **Integration Status**: `MODULE SETUP COMPLETE — INTEGRATION PENDING`.
- **Hardware Target**: Initial smoke test on CPU; full training planned for GPU.

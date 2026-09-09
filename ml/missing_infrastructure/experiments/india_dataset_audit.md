# TransitEye Person 3 — India-Specific Infrastructure Dataset Audit & Strategy

> **STATUS**: `INDIAN DOMAIN DATA VERIFIED — DEFECT DATA STILL REQUIRED`  
> **Document Location**: `ml/missing_infrastructure/experiments/india_dataset_audit.md`  

---

## 1. Executive Summary

This report documents the strategic audit of **India-specific road datasets** for TransitEye's **Roadside Infrastructure Defect Detection** (`ml/missing_infrastructure/`) module.

TransitEye's deployment scenario is **Indian public bus → bus-mounted camera → Indian urban/rural roads → Indian roadside infrastructure**. The final model must be validated on Indian road imagery.

Our investigation identified **DriveIndia** (TiHAN - IIT Hyderabad) as a major Indian domain dataset containing **66,986 real Indian road images**. However, DriveIndia labels standard operational infrastructure assets (`Traffic sign`, `Traffic light`, `Route board`, `Barrier`), but does **NOT** contain explicit condition/defect labels (`damaged_sign`, `broken_pole`).

---

## 2. DriveIndia Dataset Audit

- **Publisher / Host**: TiHAN - IIT Hyderabad (Rishav Kumar, D. Santhosh Reddy, P. Rajalakshmi) (`VERIFIED` via arXiv:2507.19912).
- **Official Source Portal**: `https://tihan.iith.ac.in/TiAND.html` (`VERIFIED`).
- **Exact Image Count**: **66,986 high-resolution images** (53,586 train, 6,700 validation, 6,700 test) (`PUBLICLY STATED`).
- **Driving Coverage**: 120+ hours of driving covering 3,400+ km across urban, rural, and highway routes in India (`PUBLICLY STATED`).
- **Camera Setup**: Front vehicle-mounted dashcam on Indian roads (`VERIFIED`).
- **Annotation Format**: YOLO PyTorch 2D bounding boxes (`<class_id> <x_center> <y_center> <width> <height>`) (`PUBLICLY STATED`).
- **Object Categories (24 classes)**:
  - *Vehicles (12)*: `Pedestrian`, `Bicycle`, `Car`, `Motorcycle`, `Bus`, `Commercial vehicle`, `Truck`, `Auto-rickshaw`, `Ambulance`, `Police vehicle`, `Tractor`, `Pushcart`, `Construction vehicle`.
  - *Road Infrastructure (9)*: `Route board`, `Traffic sign`, `Traffic light`, `Temporary traffic barrier`, `Traffic cone`, `Rumble strips`, `Unmarked speed bump`, `Marked speed bump`, `Zebra crossing`.
  - *Environmental & Surface (2)*: `Animal`, `Pothole`.
- **Infrastructure Defect Labels**: **NONE** (`VERIFIED`). DriveIndia detects standard operational assets, not defect/damage states.
- **License**: CC BY-NC-ND 4.0 (`PUBLICLY STATED`).
- **Dataset Audit Verdict**: `INDIAN DOMAIN DATASET — NOT A DEFECT DATASET` (`VERIFIED`).

---

## 3. Indian Infrastructure Defect Dataset Candidate Matrix

| Dataset | Indian Imagery | ≥5K Real Images | 2D BBoxes | Infrastructure Objects | Defect Labels | Public Access | License | Audit Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **DriveIndia** (TiHAN - IIT-H) | **PASS** | **PASS** (66,986) | **PASS** | **PASS** | **FAIL** | **PASS** | CC BY-NC-ND 4.0 | `INDIAN DOMAIN DATASET — NOT A DEFECT DATASET` |
| **IDD** (IIIT-H / Intel) | **PASS** | **PASS** (10,000+) | **PASS** | **PASS** | **FAIL** | **PASS** | Academic Open | `INDIAN DOMAIN DATASET — NOT A DEFECT DATASET` |
| **RDD2022 India** (Sekilab) | **PASS** | **FAIL** (4,730) | **PASS** | **FAIL** (Pavement) | **PASS** (Pavement) | **PASS** | CC BY-SA 4.0 | `REJECTED — ROAD SURFACE DEFECTS ONLY (P3 ROAD DEFECTS)` |
| **WHU-Infra3D** (Wuhan Univ) | **FAIL** (China) | **PASS** (5,449) | **PASS** | **PASS** | **PASS** | Request Form | Research License | `SUPPLEMENTARY PRETRAINING CANDIDATE ONLY` |

---

## 4. Multi-Dataset Architecture Strategy

Because no single Indian dataset contains both ≥5,000 Indian images AND explicit roadside infrastructure defect annotations, TransitEye adopts a **Multi-Dataset Strategy**:

1. **Dataset A (Indian Domain Foundation)**: **DriveIndia** (66,986 images). Teaches the model Indian road background scenes, illumination, weather, traffic density, and standard Indian roadside asset detection (`traffic_sign`, `traffic_light`, `route_board`, `barrier`).
2. **Dataset B (Infrastructure Defect Pretraining)**: **WHU-Infra3D** (5,449 images, 175,021 boxes). Teaches the model fine-grained infrastructure defect/damage attributes (`damaged`, `broken`, `non_working`, `tilted`).
3. **Dataset C (Held-Out Indian Validation Benchmark)**: Curated held-out test set of **real Indian road imagery** containing annotated defect instances. Final evaluation metrics must be calculated strictly on Indian road data.

---

## 5. Model Architecture & Task Formulation

- **Formulation**: **Option A — Two-Stage System**
  - **Stage 1 (Asset Detector)**: YOLOv8n trained on DriveIndia + WHU-Infra3D to detect Indian roadside infrastructure assets (`traffic_sign`, `street_light`, `signal_light`, `route_board`).
  - **Stage 2 (Condition Classifier)**: Secondary classifier evaluating cropped bounding boxes for condition states (`intact`, `damaged`, `broken`, `tilted`, `faulty`).
- **Policy**: Model training remains strictly paused (`NOT RUN`) until dataset strategy approval.

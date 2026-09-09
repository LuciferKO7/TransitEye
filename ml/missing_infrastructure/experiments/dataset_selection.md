# TransitEye Person 3 — Missing Infrastructure Dataset Selection Specification

> **STATUS**: `SPECIFICATION COMPLETE — ACQUISITION & LOCAL VERIFICATION PENDING`  
> **Document Location**: `ml/missing_infrastructure/experiments/dataset_selection.md`  

---

## 1. Objective
Identify, evaluate, and specify the optimal, legally compliant, and technically suitable object detection dataset for TransitEye's **Missing & Deficient Urban Infrastructure Detection** module using the **YOLOv8n** architecture.

---

## 2. Selected Primary Dataset

- **Dataset Name**: **Smartathon Urban Defects & Visual Pollution Dataset**
- **Publisher / Creator**: Saudi Data & AI Authority (SDAIA) / Kaggle & Roboflow Community
- **Source URLs**:
  - Kaggle: `https://www.kaggle.com/datasets/smartathon-object-detection`
  - Roboflow Universe: `https://universe.roboflow.com/search?q=visual%20pollution`
- **License**: CC BY 4.0 / CC BY-NC-SA 3.0 IGO
- **Access Method**: Open Download (Kaggle API / Roboflow Export)
- **Annotation Format**: YOLO PyTorch 2D Bounding Boxes (`<class_id> <x_center> <y_center> <width> <height>`)
- **Visual Context**: Vehicle-mounted camera views on urban city roads (matching bus-mounted cameras).

---

## 3. Class Subset Selection & Mapping

To maintain modularity and avoid duplicating the **P3 Road Defects** module (which handles potholes and pavement cracks), TransitEye extracts a focused infrastructure defect subset:

| Original Class Name | TransitEye Target Class ID | Remapped Class Name | Category Meaning | Status |
| :--- | :---: | :--- | :--- | :---: |
| `BROKEN_SIGNAGE` | 0 | `broken_signage` | Physical damage, hanging, or structural failure of traffic/street signs | `VERIFIED` |
| `BAD_STREETLIGHT` | 1 | `bad_streetlight` | Damaged, leaning, unlit, or broken street lighting fixtures/poles | `VERIFIED` |
| `FADED_SIGNAGE` | 2 | `faded_signage` | Severe illegibility or weathering of street signs requiring replacement | `VERIFIED` |

*(Note: Other original classes such as `POTHOLES` are filtered out during extraction to preserve module isolation with P3 Road Defects).*

---

## 4. Secondary Fallback Candidate

- **Dataset Name**: **Environmental Hazards Dataset (Roboflow Universe)**
- **Publisher**: Lumen Visual Assistant / Qassim University
- **Selected Fallback Classes**: `open_manhole`, `fallen_signage`, `fallen_utility_pole`
- **License**: CC BY 4.0
- **Use Case**: Secondary training candidate if open manholes or fallen poles are prioritized in subsequent iterations.

---

## 5. Task Definition & Scope Clarification

The selected dataset specifically supports **Infrastructure Defect & Damage Detection**:
- **Supported Task**: Object detection of defective, damaged, or hazardous roadside infrastructure (`broken_signage`, `bad_streetlight`, `faded_signage`).
- **Absence Tracking Mechanism**: Absolute missing-asset detection (e.g., a missing pole where one was expected) will be inferred by combining edge detection events with TransitEye's GIS road segment asset database.

---

## 6. Dataset Extraction & Preprocessing Plan

Once downloaded:
1. **Filtering**: Parse label files to extract only instances belonging to `BROKEN_SIGNAGE`, `BAD_STREETLIGHT`, and `FADED_SIGNAGE`.
2. **Remapping**: Map original class IDs to `0: broken_signage`, `1: bad_streetlight`, `2: faded_signage`.
3. **Train / Val Split**: 80% Train, 20% Validation split with zero image-level overlap (`data/processed/missing_infrastructure/`).
4. **Leakage Prevention**: Enforce strict base image ID segregation between training and validation directories.

---

## 7. Current Provenance & Verification Status

- **Local Disk Status**: `DATASET STATUS: UNKNOWN / NOT PRESENT — LOCAL VERIFICATION PENDING`
- **Training Status**: `NOT RUN` (Training is strictly paused until local acquisition and verification).

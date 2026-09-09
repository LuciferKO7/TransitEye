# TransitEye Person 3 — Missing Infrastructure Dataset Selection Specification

> **STATUS**: `BEST CANDIDATE — ACQUISITION BLOCKED`  
> **Document Location**: `ml/missing_infrastructure/experiments/dataset_selection.md`  

---

## 1. Objective
Identify, evaluate, and select the optimal, legally compliant, and technically suitable object detection dataset for TransitEye's **Missing & Deficient Urban Infrastructure Detection** module using the **YOLOv8n** architecture.

---

## 2. Public Dataset Discovery Search (Phase 1)

A systematic search across global dataset repositories (GitHub, Hugging Face, Roboflow Universe, Kaggle, Zenodo) was conducted across seven target infrastructure domains:
1. `broken signage`
2. `damaged roadside signs`
3. `bad / damaged streetlights`
4. `faded / damaged road signs`
5. `roadside infrastructure defects`
6. `urban infrastructure damage`
7. `municipal infrastructure defects`

---

## 3. Comprehensive Dataset Candidate Evaluation Table (Phase 2)

| Candidate Dataset | Source / Publisher | URL | License | Download Method | Auth Required | Approx Size | Image Count | Annotation Format | Target Classes | Bounding Boxes | Relevance | Local Accessibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Smartathon Visual Pollution** | SDAIA / Kaggle / Roboflow | `https://universe.roboflow.com/smartathon-c7dt2/visual-pollution-bwsna` | CC BY 4.0 / CC BY-NC-SA 3.0 IGO (`PUBLICLY STATED`) | API Zip Export | Yes (`PUBLICLY STATED`) | ~1.5 GB (`PUBLICLY STATED`) | 2,000+ (`PUBLICLY STATED`) | YOLO PyTorch (`VERIFIED`) | `BROKEN_SIGNAGE`, `BAD_STREETLIGHT`, `FADED_SIGNAGE` (`VERIFIED`) | Yes (`VERIFIED`) | High (`VERIFIED`) | `BLOCKED` (Requires API Key / Auth) |
| **Road Issues Detection** | Programmer-RD-AI / Hugging Face | `https://huggingface.co/datasets/Programmer-RD-AI/road-issues-detection-dataset` | Open Source / CC BY-NC 4.0 (`PUBLICLY STATED`) | Direct HTTP | No (`VERIFIED`) | ~1.2 GB (`VERIFIED`) | 9,660 (`VERIFIED`) | Folder Image Classification (`VERIFIED`) | `Broken Road Sign Issues`, `Damaged Road issues`, `Pothole Issues` (`VERIFIED`) | **No** (`VERIFIED`) | Medium (`VERIFIED`) | Accessible (`VERIFIED`), but Unusable for YOLO |
| **Urban Foundation Equipment Defect** | lonlonago / GitHub | `https://github.com/lonlonago/Urban-Foundation-Equipment-Defect-Detection-Dataset-8887-imagesVOC-YOLO-format` | Commercial ($89 Stripe Paywall) (`PUBLICLY STATED`) | Email after Payment | Yes ($89 Paywall) (`PUBLICLY STATED`) | ~2.5 GB (`UNKNOWN`) | 8,887 (`PUBLICLY STATED`) | VOC XML + YOLO TXT (`PUBLICLY STATED`) | `Broken-Cracked-Manholes`, `Broken-Poles`, `Damaged-roads` (`PUBLICLY STATED`) | Yes (`PUBLICLY STATED`) | High (`PUBLICLY STATED`) | `BLOCKED` ($89 Paywall) |
| **German Traffic Sign Detection** | keremberke / Hugging Face | `https://huggingface.co/datasets/keremberke/german-traffic-sign-detection` | CC BY 4.0 (`PUBLICLY STATED`) | Direct HTTP | No (`VERIFIED`) | ~150 MB (`VERIFIED`) | 900+ (`VERIFIED`) | COCO JSON (`VERIFIED`) | Standard Traffic Signs (Speed limit, Stop, Warning) (`VERIFIED`) | Yes (`VERIFIED`) | Low (`VERIFIED` - Normal signs only, no defects) | Accessible (`VERIFIED`), but Irrelevant |
| **Damaged Road Sign Detection** | Nick / Roboflow Universe | `https://universe.roboflow.com/nick-g857q/damaged-road-sign-detection` | CC BY 4.0 (`PUBLICLY STATED`) | Roboflow API Zip | Yes (`PUBLICLY STATED`) | ~300 MB (`UNKNOWN`) | 500+ (`PUBLICLY STATED`) | YOLOv8 (`PUBLICLY STATED`) | `damaged_sign`, `healthy_sign` (`PUBLICLY STATED`) | Yes (`PUBLICLY STATED`) | High (`PUBLICLY STATED`) | `BLOCKED` (Requires Roboflow API Key) |
| **Environmental Hazards** | lumen-visual-assistant / Roboflow | `https://universe.roboflow.com/lumen-visual-assistant/environmental_hazards` | CC BY 4.0 (`PUBLICLY STATED`) | Roboflow API Zip | Yes (`PUBLICLY STATED`) | ~600 MB (`UNKNOWN`) | 1,500+ (`PUBLICLY STATED`) | YOLOv8 (`PUBLICLY STATED`) | `open_manhole`, `fallen_signage`, `fallen_utility_pole` (`PUBLICLY STATED`) | Yes (`PUBLICLY STATED`) | High (`PUBLICLY STATED`) | `BLOCKED` (Requires Roboflow API Key) |

---

## 4. Preferred Dataset Selection Rationale (Phase 3)

The candidate datasets were evaluated against the required selection criteria:
1. **Directly Downloadable Without Credentials**: Only HF image classification datasets and normal sign datasets were available without authentication; all bounding-box infrastructure defect datasets require API keys or paywall payment.
2. **Actual Bounding-Box Annotations**: The Hugging Face `road-issues-detection-dataset` contains image-level folder classification only (no bounding boxes), making it structurally incompatible with YOLOv8n object detection.
3. **Semantic Match to Defect Categories**: Smartathon remains the single strongest semantic match for vehicle-mounted urban infrastructure defect detection (`broken_signage`, `bad_streetlight`, `faded_signage`).

---

## 5. Final Selection Status

Smartathon Urban Defects remains the highest-quality candidate semantically and structurally. However, because programmatic zip download without API credentials returns HTTP 403 / 404 access restrictions across Kaggle and Roboflow Universe APIs, the dataset selection status is explicitly marked:

`BEST CANDIDATE — ACQUISITION BLOCKED`

---

## 6. Target Class Mapping Specification (Pending Acquisition)

Upon dataset archive availability in `data/raw/smartathon/`, the target classes will be extracted as follows:

| Original Class Name | Target Class ID | Remapped Class Name | Status |
| :--- | :---: | :--- | :---: |
| `BROKEN_SIGNAGE` | 0 | `broken_signage` | `ACQUISITION BLOCKED` |
| `BAD_STREETLIGHT` | 1 | `bad_streetlight` | `ACQUISITION BLOCKED` |
| `FADED_SIGNAGE` | 2 | `faded_signage` | `ACQUISITION BLOCKED` |

---

## 7. Current Provenance & Verification Status

- **Local Disk Status**: `DATASET STATUS: UNKNOWN / NOT PRESENT — LOCAL VERIFICATION PENDING`
- **Training Status**: `NOT RUN` (Training is strictly paused until local acquisition and verification).


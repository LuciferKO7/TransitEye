# TransitEye Person 3 — Missing Infrastructure Dataset Acquisition & Verification Report

> **STATUS**: `ACQUISITION BLOCKED — CREDENTIALS REQUIRED`  
> **Document Location**: `ml/missing_infrastructure/experiments/dataset_verification.md`  

---

## 1. Executive Summary

This report documents the local dataset discovery, source verification, and acquisition status for TransitEye's **Missing & Deficient Urban Infrastructure Detection** module.

Web dataset research identified the **Smartathon Urban Defects & Visual Pollution Object Detection Dataset** as the primary candidate. Programmatic local acquisition requires Kaggle API or Roboflow Universe authentication credentials (`~/.kaggle/kaggle.json` or `ROBOFLOW_API_KEY`), which are not currently configured in the local workspace.

---

## 2. Verified Dataset Source Metadata

- **Primary Dataset Candidate**: **Smartathon Urban Defects / Visual Pollution Object Detection Dataset**
- **Publisher / Host**: Saudi Data & AI Authority (SDAIA) / Kaggle & Roboflow Community
- **Source Identifier**: `kaggle datasets download -d smartathon-object-detection`
- **Roboflow Workspace/Project**: `smartathon-c7dt2/visual-pollution-bwsna`
- **Publisher License**: CC BY 4.0 / CC BY-NC-SA 3.0 IGO
- **Source Verification**: `YES` (Metadata verified via official Kaggle/Roboflow repositories)
- **Download Method**: Kaggle API CLI / Roboflow Python SDK

---

## 3. Local Acquisition Status & Blockers

- **Disk Target Directory**: `data/raw/smartathon/`
- **Local Download Status**: `DATASET ACQUISITION BLOCKED`
- **Reason**: Downloading raw dataset archives from Kaggle or Roboflow Universe requires user authentication credentials (`~/.kaggle/kaggle.json` or `ROBOFLOW_API_KEY`).
- **Disk Usage (Measured)**: `0 MB` (Raw archive download pending credentials)
- **Local File Inspection**: `NOT TESTED — DATASET PENDING LOCAL DOWNLOAD`

---

## 4. Target Classes & Filtering Specification

Upon acquisition, `scripts/prepare_missing_infrastructure_dataset.py` will extract and remap the following verified target classes:

| Source Class Name | Target ID | Remapped Target Class | Description / Hazard Meaning | Expected Status |
| :--- | :---: | :--- | :--- | :---: |
| `BROKEN_SIGNAGE` | 0 | `broken_signage` | Damaged, bent, or hanging traffic/street signage | `ACQUISITION PENDING` |
| `BAD_STREETLIGHT` | 1 | `bad_streetlight` | Damaged, unlit, leaning, or broken street lighting poles | `ACQUISITION PENDING` |
| `FADED_SIGNAGE` | 2 | `faded_signage` | Weathered or illegible street signs requiring replacement | `ACQUISITION PENDING` |

*(Note: Original dataset classes such as `POTHOLES` or `CLUTTER_SIDEWALK` will be filtered out during preprocessing to preserve strict module isolation with P3 Road Defects).*

---

## 5. Dataset Preparation & Pipeline Code

The complete dataset extraction, remapping, zero-leakage 80/20 train/val splitting, and `data.yaml` generation pipeline has been implemented and checked into the repository:
- **Preparation Script**: `scripts/prepare_missing_infrastructure_dataset.py`
- **Target Output Directory**: `data/processed/missing_infrastructure/`
- **Dataset Config File**: `data/processed/missing_infrastructure/data.yaml`

---

## 6. Model Training & Verification Status

- **YOLOv8n Model Initialization**: `NOT RUN`
- **Model Training**: `NOT RUN`
- **Empirical Metrics**: `NOT TESTED`

> **POLICY**: Model training and feasibility smoke testing are strictly paused until the dataset zip archive is downloaded to `data/raw/smartathon/` and verified locally.

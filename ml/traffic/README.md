# Person 4 — Traffic Module (Stages 1, 2 & 3)

This module implements the verified traffic perception pipeline for the TransitEye platform:

| Stage | Description | Status |
|-------|-------------|--------|
| 1 | YOLOv8n COCO Vehicle Detection Baseline | ✅ COMPLETE |
| 2 | ByteTrack Multi-Object Tracking Baseline | ✅ COMPLETE |
| 3 | Unique Vehicle Counting + Class Breakdown | ✅ COMPLETE |

## Approved Scope
The module detects, tracks, and counts ONLY the 4 approved traffic vehicle classes:
- `car`
- `bus`
- `truck`
- `motorcycle`

All non-vehicle COCO classes (e.g. `person`, `bicycle`) and unapproved classes are strictly filtered out.

## Stage 3 Verified Results (Real-World Sample)

**Input:** `ml/traffic/sample_input/real_traffic_sample.mp4` (640×360 @ 30 FPS, 1800 total frames)
**Run:** 150 frames, confidence threshold 0.25, ByteTrack tracker

| Metric | Value |
|--------|-------|
| Unique tracked vehicles | **72** |
| Cars | 63 |
| Trucks | 7 |
| Buses | 2 |
| Motorcycles | 0 |
| consistency check 1: unique IDs == unique count | ✅ PASS (72 == 72) |
| consistency check 2: sum of class counts == unique count | ✅ PASS (72 == 72) |
| Frames with approved detections | 150 / 150 |
| Observed FPS (CPU) | 30.27 |
| Elapsed time | 4.95 s |
| Hardware | Intel Core i7-14650HX |
| Runtime | PyTorch 2.14.0+cpu |

> **Counting method:** Identity-based via unique `track_id`s from ByteTrack.
> Each vehicle counted exactly once regardless of how many frames it appears in.
> Final class assigned via majority vote across all observed frames for that `track_id`.

## Completed Features
- YOLOv8n COCO vehicle detection baseline (`ml/traffic/inference.py`)
- Approved vehicle class filtering (`car`, `bus`, `truck`, `motorcycle`)
- ByteTrack multi-object tracking baseline (`ml/traffic/tracking.py`)
- Unique vehicle counting (identity-based via `track_id`)
- Per-class vehicle count breakdown (majority-vote class assignment)
- Consistency checks: track ID count vs. class breakdown sum

## Explicitly Deferred Features (Out of Scope for Stage 3)
- Vehicle density calculation
- Traffic-flow metrics & direction
- Line-crossing / zone-based counting
- Model adapter integration (`edge-orchestrator`)
- Edge Orchestrator core integration
- Backend / database integration
- Dashboard / frontend integration
- VRU (Vulnerable Road Users)

## Directory Structure
```
ml/traffic/
├── classes.txt               # List of 4 approved traffic classes
├── requirements.txt          # Module Python dependencies (including lap)
├── inference.py              # Stage 1: YOLOv8n detection script
├── tracking.py               # Stages 2 & 3: ByteTrack tracking + counting script
├── sample_input/             # Legitimate real-world traffic sample assets
│   ├── real_traffic_sample.jpg
│   └── real_traffic_sample.mp4
├── sample_output/            # Output annotated results
│   ├── detection_result.jpg
│   ├── tracking_result.mp4
│   ├── tracking_result.json
│   ├── counting_result.mp4
│   └── counting_result.json
└── weights/                  # Pretrained model weights (ignored by git)
    └── yolov8n.pt
```

## Running Stage 3: Vehicle Counting & Class Breakdown

```bash
python ml/traffic/tracking.py \
  --input ml/traffic/sample_input/real_traffic_sample.mp4 \
  --weights ml/traffic/weights/yolov8n.pt \
  --conf 0.25 \
  --max_frames 150 \
  --output_video ml/traffic/sample_output/counting_result.mp4 \
  --output_json ml/traffic/sample_output/counting_result.json
```

## Running Stage 2: ByteTrack Tracking Only

```bash
python ml/traffic/tracking.py \
  --input ml/traffic/sample_input/real_traffic_sample.mp4 \
  --weights ml/traffic/weights/yolov8n.pt \
  --conf 0.25 \
  --max_frames 150 \
  --output_video ml/traffic/sample_output/tracking_result.mp4 \
  --output_json ml/traffic/sample_output/tracking_result.json
```

## Running Stage 1: Detection Only

```bash
python ml/traffic/inference.py \
  --input ml/traffic/sample_input/real_traffic_sample.jpg \
  --weights ml/traffic/weights/yolov8n.pt \
  --conf 0.25 \
  --output ml/traffic/sample_output/detection_result.jpg
```

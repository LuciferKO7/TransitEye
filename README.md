# TransitEye

> **Every Bus. A Mobile AI Sensor for the City.**

TransitEye is an edge-AI-powered mobile urban intelligence platform that
transforms public buses into distributed sensing units.

The system uses onboard computer vision to detect:

- Road defects
- Missing infrastructure
- Traffic and vehicle density
- Incidents and ANPR
- Vulnerable road-user risks
- Waterlogging

Observations are processed at the edge and combined across the bus fleet
to generate GIS-based intelligence for city authorities.

---

## Project Status

🚧 **SIH 2026 Prototype — Day 1**

This repository contains the prototype implementation of TransitEye.

---

## Architecture

```text
Public Bus
    │
    ├── Camera
    ├── GPS
    └── IMU
    │
    ▼
Edge AI
    │
    ├── Road Intelligence
    ├── Traffic Intelligence
    ├── Incident Intelligence
    ├── Safety Intelligence
    └── Water Intelligence
    │
    ▼
Edge Orchestrator
    │
    ├── FSM Tiering
    ├── Confidence Scoring
    ├── Multi-Bus Consensus
    ├── GPS / Timestamp Tagging
    ├── SQLite Buffer
    └── Store-and-Forward
    │
    ▼
Node.js / Express
    │
    ▼
Supabase + PostgreSQL + PostGIS
    │
    ▼
Central GIS Dashboard
    │
    ├── Alerts
    ├── Analytics
    ├── Repair Lifecycle
    └── Re-verification
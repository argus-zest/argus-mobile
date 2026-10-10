# Argus Mobile App Specification

This document details the functional specifications, UX requirements, and data flows for the **Argus Mobile Application**.

---

## 1. User Personas

1. **The Commuter / Delhi Citizen**:
   - Needs to quickly check whether notorious underpasses (Minto Bridge, Zakhira, Pul Prahladpur) are flooded before driving.
   - Wants a 10-second camera reporting tool when spotting a hazardous missing manhole lid or blocked grate.
2. **The Field Officer / Civic Inspector**:
   - Inspects road conditions on-site.
   - Needs to know who owns the road (PWD vs MCD) and whether a private contractor is still bound under defect liability warranty.

---

## 2. Key User Flows

### Flow A: Hazard Photo Report
```
[Open Camera / Select Photo]
            ↓
[Auto-Pin GPS Coordinates (e.g. 28.6330, 77.2200)]
            ↓
[Select Hazard Tag: Open Manhole / Broken Grate / Pothole / Debris]
            ↓
[POST /v1/report/presign → Upload Photo to Amazon S3]
            ↓
[Amazon Bedrock Nova 2 Lite AI Vision Inspection]
            ↓
[Response: Hazard Severity + Case ID + Escalation Level Assigned]
```

### Flow B: Corridor Risk Assessment
```
[Select Corridor from List or Map]
            ↓
[GET /v1/risk?rain_3h_mm=...]
            ↓
[Display Risk Severity: Low / Moderate / High / Severe]
            ↓
[Display Jurisdiction Confidence & Contractor Warranty Days Left]
```

---

## 3. Screen Specifications

### Screen 1: Corridor Feed (`CorridorsScreen`)
- **Primary List**: Ranked by vulnerability / flood risk.
- **Filter Tabs**: `All Corridors`, `Critical / High Risk`, `In Warranty`.
- **Card Elements**:
  - Corridor Title & Underpass tag.
  - Risk progress bar with color-coded band badge.
  - Civic Authority pill (`PWD`, `MCD`, etc.) with confidence level.
  - Contractor defect warranty countdown badge.

### Screen 2: Live Map (`MapScreen`)
- Full viewport map showing pins for known critical hotspots.
- Tapping a pin opens the `HotspotDetailSheet`.
- Color coding: Green (`low`), Amber (`moderate`/`high`), Red (`severe`).

### Screen 3: Camera Hazard Reporter (`ReportScreen`)
- Native file/camera picker with live preview and retake button.
- Hazard category selector (Open Manhole, Broken Drain Grate, Deep Pothole, Submerged Curb).
- Geolocation badge showing accurate latitude & longitude.
- Instant feedback with Case ID and designated escalation level.

### Screen 4: Civic Cases (`CasesScreen`)
- List of open, investigating, and escalated civic cases.
- Step Functions 4-rung escalation visualization:
  - Rung 1: Junior Engineer (JE)
  - Rung 2: Assistant Engineer (AE)
  - Rung 3: Executive Engineer (EE)
  - Rung 4: Chief Engineer (CE)

---

## 4. Design Guidelines
- **Color Palette**:
  - Background: `#f0f4f8` (Very light grey-blue)
  - Surface: `#ffffff` (Pure white cards with `#e2e8f0` borders)
  - Text Primary: `#1e293b` (Slate 800)
  - Accent Dark: `#0c192c` (Dark Navy)
  - Status Emerald: `#10b981` / Status Rose: `#f43f5e`
- **Typography**: Clean system sans-serif (Inter, SF Pro, Roboto).
- **Haptics & Touch**: Minimum touch targets of 44x44px.

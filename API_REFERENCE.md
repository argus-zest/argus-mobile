# Argus Backend API Reference

This document provides endpoint references for integrating mobile clients with the Argus AWS Serverless backend.

**Base URL**: `https://<api-id>.execute-api.<region>.amazonaws.com/v1`

---

## 1. Hotspots
### `GET /v1/hotspots`
Retrieve all monitored road corridors and underpasses across Delhi NCR.

**Response `200 OK`**:
```json
{
  "hotspots": [
    {
      "hotspot_id": "minto_bridge",
      "name": "Minto Bridge underpass",
      "lat": 28.6330,
      "lng": 77.2200,
      "road": {
        "road_id": "minto_road",
        "name": "Minto Road",
        "width_ft": 60
      },
      "jurisdiction": {
        "owner": "PWD",
        "confidence": 0.80,
        "officer_role": "Executive Engineer, PWD Division (illustrative)"
      },
      "warranty": {
        "status": "in_warranty",
        "contractor_label": "Contractor A (demo)",
        "days_remaining": 886
      }
    }
  ]
}
```

---

## 2. Risk Estimation
### `GET /v1/risk`
Calculate precipitation-adjusted flood probabilities and submerged hazard scores.

**Query Parameters**:
- `rain_3h_mm`: Cumulative 3-hour rainfall (default: 0)
- `rain_prev24h_mm`: Prior 24-hour rainfall (default: 0)
- `traffic_slowdown`: Traffic delay index between 0.0 and 1.0 (default: 0.0)

**Response `200 OK`**:
```json
{
  "scores": [
    {
      "hotspot_id": "minto_bridge",
      "probability": 0.64,
      "band": "high",
      "hazard_under_water": {
        "score": 0.51,
        "weight": 0.8,
        "asset_ids": ["asset_01", "asset_02"]
      }
    }
  ]
}
```

---

## 3. Hazard Report & Photo Upload
### Step 1: `POST /v1/report/presign`
Request an Amazon S3 presigned URL for direct image upload.

**Request Body**:
```json
{
  "content_type": "image/jpeg"
}
```

**Response `200 OK`**:
```json
{
  "upload_url": "https://argus-uploads.s3.amazonaws.com/...",
  "file_key": "reports/raw/2026-10-11/upload_xyz.jpg"
}
```

### Step 2: Upload File
Perform HTTP `PUT` directly to `upload_url` with the image binary payload.

### Step 3: `POST /v1/report/analyze`
Trigger Amazon Bedrock Nova 2 Lite AI vision analysis on the uploaded photo.

**Request Body**:
```json
{
  "file_key": "reports/raw/2026-10-11/upload_xyz.jpg",
  "lat": 28.6330,
  "lng": 77.2200,
  "user_hazard_type": "open_manhole"
}
```

**Response `200 OK`**:
```json
{
  "case_id": "CASE-2026-DEL-104",
  "status": "OPEN",
  "hazard_detected": true,
  "severity": "high",
  "escalation_rung": 2
}
```

---

## 4. Cases
### `GET /v1/cases`
Fetch all active and resolved civic escalation cases.

### `GET /v1/cases/{case_id}`
Fetch detailed timeline and Step Functions audit log for a specific case.

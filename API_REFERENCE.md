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
### Step 1: `POST /v1/uploads/presign`
Request an Amazon S3 presigned URL for direct image upload.

**Request Body**:
```json
{
  "purpose": "report",
  "content_type": "image/jpeg"
}
```

**Response `200 OK`**:
```json
{
  "upload_url": "https://argus-uploads.s3.amazonaws.com/...",
  "s3_key": "uploads/uuid4.jpg",
  "expires_in": 300
}
```

### Step 2: Upload File
Perform HTTP `PUT` directly to `upload_url` with the image binary payload and the same `Content-Type`.

### Step 3: `POST /v1/analyze`
Trigger Amazon Bedrock Nova 2 Lite AI vision analysis on the uploaded photo.

**Request Body**:
```json
{
  "s3_key": "uploads/uuid4.jpg"
}
```

**Response `200 OK`**:
```json
{
  "analysis": {
    "hazard_type": "open_manhole",
    "severity": 4,
    "submerged": true,
    "confidence": 0.82,
    "description": "...",
    "visible_evidence": "..."
  }
}
```

### Step 4: `POST /v1/resolve` then `POST /v1/cases`
Resolve ownership/warranty with `{"lat", "lng", "asset_type"}`, then open a case with
`{"hotspot_id?", "lat", "lng", "asset_type?", "analysis?", "photo_key?", "timer_profile": "demo|real"}`.
The response is `201` with the created `Case` (`case_id` like `CS-ABC123`).

---

## 4. Cases
### `GET /v1/cases`
Fetch recent civic escalation cases (newest first, max 50).

### `GET /v1/cases/{case_id}`
Fetch case details, event timeline, and an optional presigned `photo_url`.

### `POST /v1/cases/{case_id}/claim-fix`
Submit a repair verification claim with `{"s3_key", "lat", "lng"}`.
Response: `{"accepted", "reason": "VERIFIED|TOO_FAR|HAZARD_STILL_PRESENT|LOCATION_MISMATCH|LOW_CONFIDENCE|CASE_NOT_OPEN", "distance_m", "verification"}`.
Claims more than 25 m from the hazard are rejected with `TOO_FAR`.

## 5. Model & Evidence
### `GET /v1/eval/results`
Fetch `{"rdd2022": {...}|null, "backtest": {...}|null}`. Null sections render as
"Not yet measured" / "No backtest events loaded" and are never treated as errors.

/**
 * TransitEye API Service Layer
 * Consumes existing backend endpoints via relative URLs proxied through Vite.
 */

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
        if (Array.isArray(errorData.details) && errorData.details.length > 0) {
          errorMessage += `: ${errorData.details.join(", ")}`;
        }
      }
    } catch {
      // Non-JSON error payload fallback
    }
    throw new Error(errorMessage);
  }

  try {
    const payload = await response.json();
    return payload;
  } catch {
    throw new Error("Invalid JSON response payload received from server");
  }
}

/**
 * Fetch physical road observations (road_defect, waterlogging, vru_safety).
 * Backend contract: GET /api/detections
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export async function getDetections() {
  const response = await fetch("/api/detections");
  const payload = await handleResponse(response);
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response structure from /api/detections");
  }
  return payload;
}

/**
 * Fetch ANPR and traffic violation records.
 * Backend contract: GET /api/incidents
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export async function getIncidents() {
  const response = await fetch("/api/incidents");
  const payload = await handleResponse(response);
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response structure from /api/incidents");
  }
  return payload;
}

/**
 * Fetch traffic flow and vehicle density metrics.
 * Backend contract: GET /api/vehicle-density
 * @returns {Promise<{ success: boolean, count: number, data: Array }>}
 */
export async function getVehicleDensity() {
  const response = await fetch("/api/vehicle-density");
  const payload = await handleResponse(response);
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    throw new Error("Unexpected response structure from /api/vehicle-density");
  }
  return payload;
}

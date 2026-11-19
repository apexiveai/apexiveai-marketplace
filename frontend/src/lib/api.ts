
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

export type ApiRecord = {
  id: number | string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  logo?: string;
  cover_image?: string;
  images?: unknown;
  category?: string | number;
  industry?: string | number;
  listing_type?: string;
  price?: string | number | null;
  currency?: string;
  status?: string;
  [key: string]: unknown;
};

export type ApiResult<T> = {
  data: T[];
  error: string | null;
};

function extractCollection(payload: unknown): ApiRecord[] {
  if (Array.isArray(payload)) return payload as ApiRecord[];

  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;

    for (const key of ["results", "data", "items", "industries", "organizations", "listings"]) {
      if (Array.isArray(value[key])) {
        return value[key] as ApiRecord[];
      }
    }
  }

  return [];
}

export async function fetchCollection(
  endpoint: string,
): Promise<ApiResult<ApiRecord>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        data: [],
        error: `API request failed (${response.status})`,
      };
    }

    const payload: unknown = await response.json();

    return {
      data: extractCollection(payload),
      error: null,
    };
  } catch {
    return {
      data: [],
      error: "Unable to connect to the ApexiveAI Marketplace API.",
    };
  }
}

export function getRecordName(record: ApiRecord): string {
  return record.name || record.title || "Untitled";
}

export function getRecordDescription(record: ApiRecord): string {
  return record.description || "No description has been provided.";
}

export function getRecordImage(record: ApiRecord): string | null {
  const nestedImage = Array.isArray(record.images)
    ? record.images
        .map((item) =>
          item && typeof item === "object"
            ? (item as Record<string, unknown>).image
            : null,
        )
        .find((image): image is string => typeof image === "string" && Boolean(image.trim()))
    : null;
  const value = record.cover_image || record.image || record.logo || nestedImage;

  if (typeof value !== "string" || !value.trim()) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${API_BASE_URL.replace(/\/api\/v1$/, "")}${value.startsWith("/") ? "" : "/"}${value}`;
}

// Single place where transport is configured. Replace `request` with a real
// fetch against the InfraEase backend and every screen keeps working.
export const API_CONFIG = {
  baseUrl: "/api",
  endpoints: {
    formMetadata: (table: string) => `/table/${table}/form`,
    listMetadata: (table: string) => `/table/${table}/list`,
    records: (table: string) => `/table/${table}`,
    record: (table: string, id: string) => `/table/${table}/${id}`,
    lookup: (table: string) => `/table/${table}/lookup`,
    menus: () => `/navigation/menus`,
  },
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(message: string, status = 500, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (fieldErrors) this.fieldErrors = fieldErrors;
  }
}

/** Simulated network latency for the mock layer. */
export function latency(ms = 260): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockRequest<T>(producer: () => T, ms?: number): Promise<T> {
  await latency(ms);
  return producer();
}

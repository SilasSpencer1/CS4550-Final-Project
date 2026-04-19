import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { agent } from "./helpers.js";

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");
  return {
    ...actual,
    default: {
      ...actual.default,
      get: vi.fn(),
    },
  };
});

const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe("geocode (OSM / Nominatim proxy)", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("returns empty array for queries shorter than 3 chars (no upstream hit)", async () => {
    const res = await agent().get("/api/geocode/search?q=a");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("shapes Nominatim search results", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          place_id: 123456,
          display_name: "Boston, Suffolk County, Massachusetts, United States",
          lat: "42.3601",
          lon: "-71.0589",
          type: "city",
          importance: 0.82,
          address: {
            city: "Boston",
            state: "Massachusetts",
            country: "United States",
            postcode: "02108",
          },
        },
      ],
    });

    const res = await agent().get("/api/geocode/search?q=Boston MA");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    const r = res.body[0];
    expect(r.placeId).toBe("123456");
    expect(r.displayName).toContain("Boston");
    expect(r.lat).toBeCloseTo(42.3601, 4);
    expect(r.lng).toBeCloseTo(-71.0589, 4);
    expect(r.city).toBe("Boston");
    expect(r.state).toBe("Massachusetts");
    expect(r.postcode).toBe("02108");
  });

  it("uses an Accept-Language + User-Agent header", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    await agent().get("/api/geocode/search?q=Cambridge").expect(200);
    expect(mockedAxios.get).toHaveBeenCalled();
    const callArgs = mockedAxios.get.mock.calls[0];
    const opts = callArgs[1] as any;
    expect(opts.headers["User-Agent"]).toMatch(/Roster/i);
    expect(opts.headers["Accept-Language"]).toBe("en");
  });

  it("caches identical queries (second request does not hit upstream)", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          place_id: 1,
          display_name: "Somerville, MA",
          lat: "42.3876",
          lon: "-71.0995",
          address: { city: "Somerville", state: "Massachusetts" },
        },
      ],
    });
    await agent().get("/api/geocode/search?q=Somerville MA").expect(200);
    const res2 = await agent().get("/api/geocode/search?q=Somerville MA");
    expect(res2.status).toBe(200);
    expect(res2.body.length).toBe(1);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it("returns 502 when upstream errors", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("network dead"));
    const res = await agent().get("/api/geocode/search?q=NowhereReally1234");
    expect(res.status).toBe(502);
  });

  it("reverse requires lat + lng numbers", async () => {
    const res = await agent().get("/api/geocode/reverse?lat=abc");
    expect(res.status).toBe(400);
  });

  it("reverse shapes a successful response", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        place_id: 42,
        display_name: "Fenway Park, Boston, MA",
        lat: "42.3467",
        lon: "-71.0972",
        type: "stadium",
        address: {
          road: "Yawkey Way",
          city: "Boston",
          state: "Massachusetts",
          country: "United States",
        },
      },
    });
    const res = await agent().get(
      "/api/geocode/reverse?lat=42.3467&lng=-71.0972"
    );
    expect(res.status).toBe(200);
    expect(res.body.city).toBe("Boston");
    expect(res.body.placeId).toBe("42");
  });

  it("reverse returns 404 when upstream says no result", async () => {
    // Ensure cache miss: use a unique lat/lng the first test didn't touch
    mockedAxios.get.mockResolvedValueOnce({ data: { error: "Unable to geocode" } });
    const res = await agent().get(
      "/api/geocode/reverse?lat=89.99999&lng=-179.99999"
    );
    expect(res.status).toBe(404);
  });
});

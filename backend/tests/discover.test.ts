import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { agent, signupAgent } from "./helpers.js";

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

describe("discover (Ticketmaster proxy)", () => {
  beforeEach(() => {
    process.env.TICKETMASTER_API_KEY = "testkey";
    mockedAxios.get.mockReset();
  });

  it("GET /api/discover/search proxies + shapes results", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        _embedded: {
          events: [
            {
              id: "abc123",
              name: "Jazz Night",
              url: "https://tm.example/abc",
              images: [{ width: 800, url: "img.jpg" }],
              dates: { start: { dateTime: "2030-05-01T20:00:00Z" } },
              _embedded: { venues: [{ name: "Blue Note", city: { name: "Boston" } }] },
              classifications: [
                {
                  segment: { name: "Music" },
                  genre: { name: "Jazz" },
                  subGenre: { name: "Straight-ahead" },
                },
              ],
            },
          ],
        },
      },
    });

    const res = await agent().get("/api/discover/search?city=Boston&keyword=jazz");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    const e = res.body[0];
    expect(e.id).toBe("abc123");
    expect(e.name).toBe("Jazz Night");
    expect(e.venue).toBe("Blue Note");
    expect(e.city).toBe("Boston");
    expect(e.classifications).toContain("Music");
    expect(e.classifications).toContain("Jazz");
    expect(e.image).toBe("img.jpg");
  });

  it("returns 502 if Ticketmaster throws", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("upstream blew up"));
    const res = await agent().get("/api/discover/search?city=Boston");
    expect(res.status).toBe(502);
  });

  it("GET /api/discover/:id returns a shaped detail", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        id: "xyz",
        name: "Detail Event",
        info: "About this show",
        pleaseNote: "No strollers",
        url: "https://tm.example/xyz",
        images: [{ width: 1200, url: "big.jpg" }],
        dates: { start: { dateTime: "2030-06-01T19:30:00Z" } },
        priceRanges: [{ min: 20, max: 45, currency: "USD" }],
        _embedded: {
          venues: [
            {
              name: "The Hall",
              city: { name: "Cambridge" },
              state: { name: "MA" },
              address: { line1: "1 Main St" },
            },
          ],
        },
        classifications: [{ segment: { name: "Music" }, genre: { name: "Indie" } }],
      },
    });
    const res = await agent().get("/api/discover/xyz");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("xyz");
    expect(res.body.info).toBe("About this show");
    expect(res.body.venue?.name).toBe("The Hall");
    expect(res.body.priceRanges[0].min).toBe(20);
    expect(res.body.classifications).toContain("Music");
  });

  it("404 if upstream returns 404", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });
    const res = await agent().get("/api/discover/nope");
    expect(res.status).toBe(404);
  });
});

describe("suggestions", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    process.env.TICKETMASTER_API_KEY = "";
  });

  it("requires auth", async () => {
    const res = await agent().get("/api/suggestions");
    expect(res.status).toBe(401);
  });

  it("returns organizer events ranked by interest overlap", async () => {
    const regular = agent();
    const organizer = agent();
    await signupAgent(regular, {
      username: "sug",
      email: "sug@ex.com",
    });
    await regular.put("/api/users/me").send({
      interests: ["jazz", "hiking"],
      location: { city: "Boston", state: "MA" },
    });

    await signupAgent(organizer, {
      username: "host",
      email: "host@ex.com",
      role: "organizer",
    });
    const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString();
    const end = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 60 * 60 * 1000).toISOString();
    await organizer
      .post("/api/events")
      .send({
        title: "Jazz Night Boston",
        startTime: future,
        endTime: end,
        location: { city: "Boston", address: "" },
        tags: ["jazz"],
      })
      .expect(200);
    await organizer
      .post("/api/events")
      .send({
        title: "Boring Lecture",
        startTime: future,
        endTime: end,
        location: { city: "Boston", address: "" },
        tags: ["lecture"],
      })
      .expect(200);

    const res = await regular.get("/api/suggestions");
    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Jazz Night Boston");
    expect(res.body[0].source).toBe("organizer");
    expect(res.body[0].score).toBeGreaterThan(res.body[1].score);
  });
});

import { Event } from "../models/Event.js";
import { User, UserDoc } from "../models/User.js";
import { searchEvents, TmEventSummary } from "./ticketmaster.js";

export interface Suggestion {
  source: "organizer" | "ticketmaster";
  id: string;
  title: string;
  startTime: string | null;
  endTime?: string | null;
  city: string;
  tags: string[];
  score: number;
  image?: string | null;
  url?: string;
}

function overlapScore(a: string[] = [], b: string[] = []): number {
  const aSet = new Set(a.map((s) => s.toLowerCase()));
  let n = 0;
  for (const t of b) if (aSet.has(t.toLowerCase())) n++;
  return n;
}

export async function suggestFor(userId: string): Promise<Suggestion[]> {
  const user = (await User.findById(userId)) as UserDoc | null;
  if (!user) return [];

  const city = user.location?.city || "";
  const now = new Date();
  const nextMonth = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const organizerEvents = await Event.find({
    source: "organizer",
    visibility: "public",
    startTime: { $gte: now, $lte: nextMonth },
  }).limit(50);

  let tmEvents: TmEventSummary[] = [];
  if (city && process.env.TICKETMASTER_API_KEY) {
    try {
      tmEvents = await searchEvents({
        city,
        startDateTime: now.toISOString().split(".")[0] + "Z",
        size: 30,
      });
    } catch {
      tmEvents = [];
    }
  }

  const userEventsInWindow = await Event.find({
    createdBy: userId,
    startTime: { $lte: nextMonth },
    endTime: { $gte: now },
  });

  const conflicts = (start: Date | null) => {
    if (!start) return false;
    const t = start.getTime();
    return userEventsInWindow.some(
      (e) => e.startTime.getTime() <= t && t <= e.endTime.getTime()
    );
  };

  const orgSuggs: Suggestion[] = organizerEvents
    .filter((e) => !conflicts(e.startTime))
    .map((e) => ({
      source: "organizer",
      id: e._id.toString(),
      title: e.title,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      city: e.location?.city ?? "",
      tags: e.tags ?? [],
      score:
        overlapScore(user.interests, e.tags) * 2 +
        (e.location?.city?.toLowerCase() === city.toLowerCase() ? 1 : 0),
    }));

  const tmSuggs: Suggestion[] = tmEvents
    .filter((e) => !conflicts(e.startDateTime ? new Date(e.startDateTime) : null))
    .map((e) => ({
      source: "ticketmaster",
      id: e.id,
      title: e.name,
      startTime: e.startDateTime,
      city: e.city,
      tags: e.classifications,
      score:
        overlapScore(user.interests, e.classifications) * 2 +
        (e.city?.toLowerCase() === city.toLowerCase() ? 1 : 0),
      image: e.image,
      url: e.url,
    }));

  return [...orgSuggs, ...tmSuggs]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

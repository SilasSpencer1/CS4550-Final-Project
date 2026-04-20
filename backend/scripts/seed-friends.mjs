#!/usr/bin/env node
// Seed fake friends + events for a target user (default: SilasSpencer).
// Usage: MONGO_URI=... node scripts/seed-friends.mjs [targetUsername]
// Creates 6 friend accounts with accepted friendships, plus 20+ events over
// the next 14 days spanning public + friends-only visibility, scattered through
// mornings / afternoons / evenings / weekends, all anchored in the Boston area.

import mongoose from "mongoose";
import bcrypt from "bcrypt";

const TARGET = process.argv[2] ?? "SilasSpencer";
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("set MONGO_URI");
  process.exit(1);
}

// ---- schemas (mirror backend models, enough fields for seed) ----
const { Schema, Types } = mongoose;
const User = mongoose.model("User", new Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["user", "organizer"], default: "user" },
  displayName: String,
  bio: String,
  avatarUrl: String,
  interests: [String],
  location: { city: String, state: String },
  defaultPrivacy: { type: String, enum: ["busy", "friends", "public"], default: "friends" },
  google: { refreshToken: String, lastSyncAt: Date },
}, { timestamps: true }));

const Event = mongoose.model("Event", new Schema({
  title: String,
  description: String,
  startTime: { type: Date, index: true },
  endTime: Date,
  location: {
    address: String,
    city: String,
    lat: Number,
    lng: Number,
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", index: true },
  source: { type: String, enum: ["user", "organizer", "gcal_import"], default: "user" },
  visibility: { type: String, enum: ["busy", "friends", "public"], default: "friends" },
  tags: [String],
  maxAttendees: Number,
}, { timestamps: true }));

const Friendship = mongoose.model("Friendship", new Schema({
  requester: { type: Schema.Types.ObjectId, ref: "User", index: true },
  recipient: { type: Schema.Types.ObjectId, ref: "User", index: true },
  status: { type: String, enum: ["pending", "accepted"], default: "pending" },
}, { timestamps: true }));

// ---- fixture data ----
const FRIENDS = [
  {
    username: "quinn",
    displayName: "Quinn Walsh",
    email: "quinn.walsh@demo.roster.test",
    bio: "Birthday party planning, cheap wine, expensive cake.",
    interests: ["parties", "music", "bar crawls"],
    city: "Boston", state: "MA",
    defaultPrivacy: "friends",
    role: "user",
  },
  {
    username: "mel",
    displayName: "Mel Okonkwo",
    email: "mel.o@demo.roster.test",
    bio: "Food obsessive. Thursday pizza nights until I die.",
    interests: ["food", "brunch", "pizza", "cooking"],
    city: "Somerville", state: "MA",
    defaultPrivacy: "friends",
    role: "user",
  },
  {
    username: "jamie",
    displayName: "Jamie Torres",
    email: "jamie.t@demo.roster.test",
    bio: "Runs the standing Fri run club. Terrible at recovery.",
    interests: ["hiking", "running", "outdoors"],
    city: "Cambridge", state: "MA",
    defaultPrivacy: "public",
    role: "user",
  },
  {
    username: "aisha",
    displayName: "Aisha Khan",
    email: "aisha.k@demo.roster.test",
    bio: "Book club. Coffee. More coffee. Occasionally: a museum.",
    interests: ["books", "coffee", "museums", "art"],
    city: "Boston", state: "MA",
    defaultPrivacy: "friends",
    role: "user",
  },
  {
    username: "devi",
    displayName: "Devi Rao",
    email: "devi.r@demo.roster.test",
    bio: "I host shows. Come through.",
    interests: ["jazz", "music", "live music"],
    city: "Boston", state: "MA",
    defaultPrivacy: "public",
    role: "organizer",
  },
  {
    username: "teo",
    displayName: "Teo Fischer",
    email: "teo.f@demo.roster.test",
    bio: "Board games, card games, video games. Pick a night.",
    interests: ["games", "movies", "chill hangs"],
    city: "Cambridge", state: "MA",
    defaultPrivacy: "friends",
    role: "user",
  },
];

// Boston area venues with real approx coords
const VENUES = {
  melsKitchen: { address: "142 Washington Ave", city: "Somerville", lat: 42.3896, lng: -71.0892 },
  bottleShop: { address: "44 Harvard Ave", city: "Allston", lat: 42.3534, lng: -71.1319 },
  publicGarden: { address: "4 Charles St", city: "Boston", lat: 42.3541, lng: -71.0710 },
  bostonCommon: { address: "Boston Common", city: "Boston", lat: 42.3551, lng: -71.0657 },
  fenway: { address: "4 Jersey St", city: "Boston", lat: 42.3467, lng: -71.0972 },
  harvardSq: { address: "1 JFK St", city: "Cambridge", lat: 42.3736, lng: -71.1189 },
  charlesRiver: { address: "Charles River Esplanade", city: "Boston", lat: 42.3541, lng: -71.0893 },
  mfaBoston: { address: "465 Huntington Ave", city: "Boston", lat: 42.3394, lng: -71.0940 },
  paradiseRock: { address: "967 Commonwealth Ave", city: "Boston", lat: 42.3506, lng: -71.1129 },
  teoApt: { address: "Near Porter Sq", city: "Cambridge", lat: 42.3884, lng: -71.1190 },
  northEndRestaurant: { address: "234 Hanover St", city: "Boston", lat: 42.3647, lng: -71.0542 },
  arnoldArboretum: { address: "125 Arborway", city: "Boston", lat: 42.3014, lng: -71.1263 },
};

// Build events for each friend. Times relative to "now" at start of day.
function at(daysOut, hour, minute = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + daysOut);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function plusHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

const TEMPLATES = (friendsByUsername) => [
  // ---------- quinn ----------
  { owner: "quinn", title: "quinn's 30th 🎂", description: "turning 30, still not a grown up. dress fancy-ish. bring a story.", start: at(6, 20), durHrs: 5, venue: VENUES.bottleShop, visibility: "friends", tags: ["party", "birthday"] },
  { owner: "quinn", title: "saturday brunch at mel's", description: "pancakes, bacon, too many mimosas", start: at(4, 11), durHrs: 2, venue: VENUES.melsKitchen, visibility: "friends", tags: ["brunch", "food"] },
  { owner: "quinn", title: "karaoke night", description: "do-wop edition", start: at(9, 21), durHrs: 3, venue: VENUES.bottleShop, visibility: "friends", tags: ["music", "nightlife"] },
  { owner: "quinn", title: "brunch + walk in the public garden", description: "blossoms are out.", start: at(12, 10), durHrs: 3, venue: VENUES.publicGarden, visibility: "public", tags: ["brunch", "outdoors"] },

  // ---------- mel ----------
  { owner: "mel", title: "thursday pizza at mel's", description: "standing weekly. byo wine.", start: at(4, 19), durHrs: 3, venue: VENUES.melsKitchen, visibility: "friends", tags: ["food", "pizza"] },
  { owner: "mel", title: "thursday pizza at mel's", description: "standing weekly. byo wine.", start: at(11, 19), durHrs: 3, venue: VENUES.melsKitchen, visibility: "friends", tags: ["food", "pizza"] },
  { owner: "mel", title: "north end dinner crawl", description: "three restaurants, one block.", start: at(2, 18), durHrs: 4, venue: VENUES.northEndRestaurant, visibility: "friends", tags: ["food", "dinner"] },
  { owner: "mel", title: "sunday sourdough workshop", description: "bring a starter or i'll lend you one", start: at(7, 14), durHrs: 2, venue: VENUES.melsKitchen, visibility: "public", tags: ["cooking", "food"] },

  // ---------- jamie ----------
  { owner: "jamie", title: "fri run club", description: "5k pace, river loop, coffee after. all welcome.", start: at(5, 7), durHrs: 1, venue: VENUES.charlesRiver, visibility: "public", tags: ["running", "outdoors"] },
  { owner: "jamie", title: "fri run club", description: "5k pace, river loop, coffee after. all welcome.", start: at(12, 7), durHrs: 1, venue: VENUES.charlesRiver, visibility: "public", tags: ["running", "outdoors"] },
  { owner: "jamie", title: "arnold arboretum hike", description: "lilac sunday scouting trip. 7 miles, casual.", start: at(13, 9), durHrs: 4, venue: VENUES.arnoldArboretum, visibility: "public", tags: ["hiking", "outdoors"] },
  { owner: "jamie", title: "morning trail run", description: "tempo run, 6 miles, bring water", start: at(3, 6, 30), durHrs: 1.5, venue: VENUES.charlesRiver, visibility: "public", tags: ["running"] },

  // ---------- aisha ----------
  { owner: "aisha", title: "book club: tomorrow and tomorrow and tomorrow", description: "discussion + late lunch after", start: at(7, 13), durHrs: 3, venue: VENUES.harvardSq, visibility: "friends", tags: ["books", "reading"] },
  { owner: "aisha", title: "MFA sunday visit", description: "new impressionist exhibit is up", start: at(7, 15), durHrs: 2, venue: VENUES.mfaBoston, visibility: "friends", tags: ["art", "museums"] },
  { owner: "aisha", title: "morning coffee at 1369", description: "just catching up, nothing fancy", start: at(1, 9), durHrs: 1, venue: VENUES.harvardSq, visibility: "friends", tags: ["coffee"] },
  { owner: "aisha", title: "poetry reading night", description: "local poets at the grolier", start: at(10, 19), durHrs: 2, venue: VENUES.harvardSq, visibility: "public", tags: ["books", "art"] },

  // ---------- devi (organizer — events are promoted, always public, show up in suggestions) ----------
  { owner: "devi", title: "jazz night, boston trio", description: "small room, cheap cover. doors at 7.", start: at(2, 20), durHrs: 3, venue: VENUES.paradiseRock, visibility: "public", tags: ["jazz", "music", "live music"] },
  { owner: "devi", title: "jazz night, boston trio", description: "small room, cheap cover. doors at 7.", start: at(9, 20), durHrs: 3, venue: VENUES.paradiseRock, visibility: "public", tags: ["jazz", "music", "live music"] },
  { owner: "devi", title: "open mic, folk edition", description: "sign up at the door from 7:30", start: at(5, 20), durHrs: 3, venue: VENUES.paradiseRock, visibility: "public", tags: ["music", "live music"] },
  { owner: "devi", title: "sunday matinee, string quartet", description: "mozart + shostakovich. kid friendly.", start: at(14, 14), durHrs: 2, venue: VENUES.paradiseRock, visibility: "public", tags: ["music", "classical"] },

  // ---------- teo ----------
  { owner: "teo", title: "board game night", description: "bringing terraforming mars and catan. byob.", start: at(3, 19), durHrs: 4, venue: VENUES.teoApt, visibility: "friends", tags: ["games", "chill"] },
  { owner: "teo", title: "movie night, studio ghibli", description: "double feature, popcorn provided", start: at(8, 19), durHrs: 4, venue: VENUES.teoApt, visibility: "friends", tags: ["movies", "chill"] },
  { owner: "teo", title: "saturday board game night", description: "the big one. 6-8 people, games all day.", start: at(6, 15), durHrs: 7, venue: VENUES.teoApt, visibility: "friends", tags: ["games"] },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  const target = await User.findOne({ username: TARGET });
  if (!target) {
    console.error(`target user "${TARGET}" not found`);
    process.exit(1);
  }
  console.log(`target: ${target.username} (${target._id})`);

  const defaultPassword = "demo1234";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  console.log("\n--- friends ---");
  const friendIds = [];
  for (const f of FRIENDS) {
    const existing = await User.findOne({ username: f.username });
    if (existing) {
      console.log(`  ${f.username} exists — skipping create`);
      friendIds.push({ username: f.username, id: existing._id });
      continue;
    }
    const u = await User.create({
      username: f.username,
      email: f.email,
      passwordHash,
      displayName: f.displayName,
      bio: f.bio,
      interests: f.interests,
      location: { city: f.city, state: f.state },
      defaultPrivacy: f.defaultPrivacy,
      role: f.role,
    });
    console.log(`  created ${u.username} (role=${u.role}) id=${u._id}`);
    friendIds.push({ username: u.username, id: u._id });
  }

  console.log("\n--- friendships (accepted, both directions handled) ---");
  for (const { username, id } of friendIds) {
    const key = { requester: target._id, recipient: id };
    const reverse = { requester: id, recipient: target._id };
    const any = await Friendship.findOne({
      $or: [key, reverse],
    });
    if (any) {
      if (any.status !== "accepted") {
        any.status = "accepted";
        await any.save();
        console.log(`  accepted existing friendship with ${username}`);
      } else {
        console.log(`  already friends with ${username}`);
      }
    } else {
      await Friendship.create({ ...key, status: "accepted" });
      console.log(`  created accepted friendship with ${username}`);
    }
  }

  console.log("\n--- events ---");
  const usernameToId = Object.fromEntries(friendIds.map(({ username, id }) => [username, id]));
  let created = 0, skipped = 0;
  for (const t of TEMPLATES(usernameToId)) {
    const ownerId = usernameToId[t.owner];
    if (!ownerId) continue;
    const startTime = t.start;
    const endTime = plusHours(t.start, t.durHrs);
    const dupe = await Event.findOne({
      createdBy: ownerId,
      title: t.title,
      startTime,
    });
    if (dupe) {
      skipped++;
      continue;
    }
    const isOrganizer = FRIENDS.find((f) => f.username === t.owner)?.role === "organizer";
    await Event.create({
      title: t.title,
      description: t.description,
      startTime,
      endTime,
      location: t.venue,
      createdBy: ownerId,
      source: isOrganizer ? "organizer" : "user",
      visibility: isOrganizer ? "public" : t.visibility,
      tags: t.tags ?? [],
    });
    created++;
  }
  console.log(`  created ${created} events, skipped ${skipped} dupes`);

  console.log(`\n✅ done. login to any friend with password "${defaultPassword}" if you want to test from their side.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { Friendship } from "../models/Friendship.js";

export async function areFriends(userA: string, userB: string): Promise<boolean> {
  if (userA === userB) return true;
  const f = await Friendship.findOne({
    status: "accepted",
    $or: [
      { requester: userA, recipient: userB },
      { requester: userB, recipient: userA },
    ],
  });
  return !!f;
}

export async function friendIdsOf(userId: string): Promise<string[]> {
  const list = await Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  });
  return list.map((f) =>
    f.requester.toString() === userId ? f.recipient.toString() : f.requester.toString()
  );
}

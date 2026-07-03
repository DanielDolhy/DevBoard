import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { sign } from "jsonwebtoken";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean DB
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create 5 users
  const users = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          username: `user${i + 1}`,
          passwordHash: "mockhash123",
        },
      })
    )
  );

  console.log(`Created ${users.length} users.`);

  // Multi-directional follows
  // User 1 follows User 2, 3
  // User 2 follows User 1, 4
  // User 3 follows User 1, 5
  // User 4 follows User 5
  // User 5 follows User 1
  const follows = [
    { followerId: users[0].id, followingId: users[1].id },
    { followerId: users[0].id, followingId: users[2].id },
    { followerId: users[1].id, followingId: users[0].id },
    { followerId: users[1].id, followingId: users[3].id },
    { followerId: users[2].id, followingId: users[0].id },
    { followerId: users[2].id, followingId: users[4].id },
    { followerId: users[3].id, followingId: users[4].id },
    { followerId: users[4].id, followingId: users[0].id },
  ];

  await prisma.follow.createMany({ data: follows });
  console.log(`Created ${follows.length} follows.`);

  // 20 Posts distributed
  const postData = Array.from({ length: 20 }).map((_, i) => ({
    userId: users[i % 5].id,
    content: `This is mock post number ${i + 1} from ${users[i % 5].username}`,
  }));

  await prisma.post.createMany({ data: postData });
  console.log(`Created ${postData.length} posts.`);

  // Generate JWT for User 1
  const payload = { userId: users[0].id, username: users[0].username };
  const JWT_SECRET = process.env.JWT_SECRET || "devboard-local-secret-DO-NOT-USE-IN-PRODUCTION";
  const token = sign(payload, JWT_SECRET, { expiresIn: "7d" });

  console.log("\n=== SEED COMPLETE ===");
  console.log(`\nTest token for ${users[0].username}:`);
  console.log(`Bearer ${token}`);
  console.log("\nCurl command to test timeline (requires dev server running):");
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/timeline`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

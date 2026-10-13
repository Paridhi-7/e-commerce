import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const ping = await db.command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const counts: Record<string, number> = {};
    for (const name of collectionNames) {
      counts[name] = await db.collection(name).countDocuments();
    }

    return NextResponse.json({
      connected: true,
      cluster: "cluster0.th5rxrd.mongodb.net",
      database: db.databaseName,
      ping: ping.ok === 1 ? "ok" : "fail",
      collections: collectionNames,
      documentCounts: counts,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        connected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

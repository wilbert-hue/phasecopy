import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()
    const offices = await db
      .collection("offices")
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray()
    return NextResponse.json({ offices })
  } catch (err) {
    console.error("[api/offices] error:", err)
    return NextResponse.json({ offices: [], error: "Failed to load offices" }, { status: 500 })
  }
}

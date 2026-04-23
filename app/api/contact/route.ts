import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { sendContactNotification } from "@/lib/mailer"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fullName, email, company, jobTitle, country, contact, requirements } = body || {}

    if (!fullName || !email || !company || !jobTitle || !country || !contact) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection("contact_submissions").insertOne({
      fullName: String(fullName).slice(0, 200),
      email: String(email).slice(0, 200),
      company: String(company).slice(0, 200),
      jobTitle: String(jobTitle).slice(0, 200),
      country: String(country).slice(0, 100),
      contact: String(contact).slice(0, 50),
      requirements: String(requirements || "").slice(0, 4000),
      createdAt: new Date(),
      ip: req.headers.get("x-forwarded-for") || null,
      userAgent: req.headers.get("user-agent") || null,
    })

    // Send notification email (don't fail the request if SMTP errors)
    try {
      await sendContactNotification({
        fullName,
        email,
        company,
        jobTitle,
        country,
        contact,
        requirements,
      })
    } catch (mailErr) {
      console.error("[api/contact] email send failed:", mailErr)
    }

    return NextResponse.json({ ok: true, id: result.insertedId })
  } catch (err) {
    console.error("[api/contact] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const ticketRef = db.collection("e-tickets").doc(id);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      await ticketRef.set(body);
      return NextResponse.json({ message: "Create success", ticket: body });
    } else {
      await ticketRef.update({ checkInStatus: true });
      const updated = (await ticketRef.get()).data();
      return NextResponse.json({ message: "Check-in success", ticket: updated });
    }
  } catch (error) {
    console.error("E-Ticket API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection("e-tickets").get();
    const tickets = snapshot.docs.map(doc => doc.data());
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("E-Ticket GET API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
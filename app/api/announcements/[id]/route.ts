import { NextRequest } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Check if user is authenticated for admin access
    let session = null;
    try {
      session = await auth();
    } catch (error) {
      // Session might not exist, which is fine for public access
    }
    
    let query = db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));
    
    // Only show published announcements to non-admins
    if (!session?.user || session.user.role !== "admin") {
      query = query.where(
        and(
          eq(announcements.isPublished, true),
          or(
            eq(announcements.audience, "all"),
            eq(announcements.audience, "unregistered")
          )
        )
      );
    }
    
    const announcement = await query;
    
    if (announcement.length === 0) {
      return new Response(
        JSON.stringify({ error: "Announcement not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ announcement: announcement[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch announcement" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Check if announcement exists and belongs to user
    const existingAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));
    
    if (existingAnnouncement.length === 0) {
      return new Response(
        JSON.stringify({ error: "Announcement not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingAnnouncement[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this announcement" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the announcement
    const updatedAnnouncement = await db
      .update(announcements)
      .set({
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority,
        isPublished: data.isPublished,
        publishedAt: data.isPublished && !existingAnnouncement[0].publishedAt ? new Date() : existingAnnouncement[0].publishedAt,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        audience: data.audience,
        targetUrl: data.targetUrl,
        ctaText: data.ctaText,
        imageUrl: data.imageUrl,
        tags: data.tags || [],
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();
    
    return new Response(JSON.stringify({ announcement: updatedAnnouncement[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update announcement" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id } = params;
    
    // Check if announcement exists and belongs to user
    const existingAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.id, id));
    
    if (existingAnnouncement.length === 0) {
      return new Response(
        JSON.stringify({ error: "Announcement not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingAnnouncement[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to delete this announcement" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the announcement
    await db
      .delete(announcements)
      .where(eq(announcements.id, id));
    
    return new Response(JSON.stringify({ message: "Announcement deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete announcement" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
import { NextRequest } from "next/server";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { eq, and, or, asc, desc, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if user is authenticated for admin access
    let session = null;
    try {
      session = await auth();
    } catch (error) {
      // Session might not exist, which is fine for public access
    }
    
    // Build query based on filters
    let query = db.select().from(announcements);
    
    // Apply filters
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const audience = searchParams.get("audience");
    const isPublished = searchParams.get("published");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    if (type) {
      query = query.where(eq(announcements.type, type));
    }
    
    if (priority) {
      query = query.where(eq(announcements.priority, priority));
    }
    
    if (audience) {
      query = query.where(eq(announcements.audience, audience));
    }
    
    if (isPublished !== undefined) {
      query = query.where(eq(announcements.isPublished, isPublished === "true"));
    }
    
    if (search) {
      query = query.where(
        or(
          like(announcements.title, `%${search}%`),
          like(announcements.content, `%${search}%`)
        )
      );
    }
    
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
    
    // Apply sorting and pagination
    query = query.orderBy(desc(announcements.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const announcementsList = await query;
    
    return new Response(JSON.stringify({ announcements: announcementsList }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch announcements" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return new Response(
        JSON.stringify({ error: "Title and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newAnnouncement = {
      id: uuidv4(),
      title: data.title,
      content: data.content,
      type: data.type || "info",
      priority: data.priority || "medium",
      isPublished: data.isPublished !== undefined ? data.isPublished : false,
      publishedAt: data.isPublished ? new Date() : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      audience: data.audience || "all",
      targetUrl: data.targetUrl,
      ctaText: data.ctaText,
      imageUrl: data.imageUrl,
      tags: data.tags || [],
      createdBy: session.user.id,
    };
    
    const result = await db.insert(announcements).values(newAnnouncement).returning();
    
    return new Response(JSON.stringify({ announcement: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create announcement" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
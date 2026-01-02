import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, or, asc, desc, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if user is authenticated
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Build query based on filters
    let query = db.select().from(notifications);
    
    // Apply filters
    const type = searchParams.get("type");
    const priority = searchParams.get("priority");
    const isRead = searchParams.get("read");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    // Only allow users to see their own notifications
    query = query.where(eq(notifications.userId, session.user.id));
    
    if (type) {
      query = query.where(eq(notifications.type, type));
    }
    
    if (priority) {
      query = query.where(eq(notifications.priority, priority));
    }
    
    if (isRead !== undefined) {
      query = query.where(eq(notifications.isRead, isRead === "true"));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(desc(notifications.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const notificationRecords = await query;
    
    return new Response(JSON.stringify({ notifications: notificationRecords }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.message || !data.type) {
      return new Response(
        JSON.stringify({ error: "Title, message, and type are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Only admin can create notifications for other users
    const userId = data.userId || session.user.id;
    
    if (session.user.role !== "admin" && userId !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to create notifications for other users" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newNotification = {
      id: uuidv4(),
      userId: userId,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority || "normal",
      actionUrl: data.actionUrl,
      orderId: data.orderId,
      purchaseId: data.purchaseId,
      metadata: data.metadata || {},
      sentVia: data.sentVia || { email: false, push: false, in_app: true },
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      sentAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.insert(notifications).values(newNotification).returning();
    
    return new Response(JSON.stringify({ notification: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
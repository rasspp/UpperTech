import { NextRequest } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const query = db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
    
    const notification = await query;
    
    if (notification.length === 0) {
      return new Response(
        JSON.stringify({ error: "Notification not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ notification: notification[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Check if notification exists and belongs to user
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
    
    if (existingNotification.length === 0) {
      return new Response(
        JSON.stringify({ error: "Notification not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the notification - primarily for marking as read
    const updatedNotification = await db
      .update(notifications)
      .set({
        isRead: data.isRead !== undefined ? data.isRead : existingNotification[0].isRead,
        readAt: data.isRead ? new Date() : existingNotification[0].readAt,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, id))
      .returning();
    
    return new Response(JSON.stringify({ notification: updatedNotification[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id } = params;
    
    // Check if notification exists and belongs to user
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
    
    if (existingNotification.length === 0) {
      return new Response(
        JSON.stringify({ error: "Notification not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the notification
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));
    
    return new Response(JSON.stringify({ message: "Notification deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete notification" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Additional endpoint to mark all notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Mark all notifications for the user as read
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(notifications.userId, session.user.id),
        eq(notifications.isRead, false)
      ));
    
    return new Response(JSON.stringify({ message: "All notifications marked as read" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return new Response(
      JSON.stringify({ error: "Failed to mark notifications as read" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
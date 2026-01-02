import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, services } from "@/db/schema";
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
    
    let query = db
      .select()
      .from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id))
      .where(eq(orders.id, id));
    
    // Only allow users to see their own orders unless they're admin
    if (session.user.role !== "admin") {
      query = query.where(eq(orders.userId, session.user.id));
    }
    
    const orderRecords = await query;
    
    if (orderRecords.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const orderWithService = {
      ...orderRecords[0].orders,
      service: orderRecords[0].services,
    };
    
    return new Response(JSON.stringify({ order: orderWithService }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch order" }),
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
    
    // Check if order exists and belongs to user (or if admin)
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (existingOrder.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the owner or admin
    if (existingOrder[0].userId !== session.user.id && session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this order" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // For admin users, allow assignment to other users
    let assignedTo = existingOrder[0].assignedTo;
    if (session.user.role === "admin" && data.assignedTo !== undefined) {
      assignedTo = data.assignedTo;
    }
    
    // Update the order
    const updatedOrder = await db
      .update(orders)
      .set({
        title: data.title || existingOrder[0].title,
        description: data.description || existingOrder[0].description,
        status: data.status || existingOrder[0].status,
        amount: data.amount || existingOrder[0].amount,
        currency: data.currency || existingOrder[0].currency,
        requirements: data.requirements || existingOrder[0].requirements,
        attachments: data.attachments || existingOrder[0].attachments,
        assignedTo: assignedTo,
        startedAt: data.startedAt ? new Date(data.startedAt) : existingOrder[0].startedAt,
        completedAt: data.completedAt ? new Date(data.completedAt) : null,
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : existingOrder[0].estimatedDelivery,
        actualDelivery: data.actualDelivery ? new Date(data.actualDelivery) : null,
        rating: data.rating,
        review: data.review,
        notes: data.notes || existingOrder[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    
    return new Response(JSON.stringify({ order: updatedOrder[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update order" }),
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
    
    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (existingOrder.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the order
    await db
      .delete(orders)
      .where(eq(orders.id, id));
    
    return new Response(JSON.stringify({ message: "Order deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete order" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
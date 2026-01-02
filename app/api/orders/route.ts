import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, services, payments } from "@/db/schema";
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
    let query = db.select().from(orders)
      .leftJoin(services, eq(orders.serviceId, services.id));
    
    // Apply filters
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const serviceId = searchParams.get("serviceId");
    const isPaid = searchParams.get("isPaid");
    const assignedTo = searchParams.get("assignedTo");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    // Only allow users to see their own orders unless they're admin
    if (session.user.role !== "admin") {
      query = query.where(eq(orders.userId, session.user.id));
    } else if (userId) {
      // Admin can filter by specific user
      query = query.where(eq(orders.userId, userId));
    } else {
      // Admin can see all orders
    }
    
    if (status) {
      query = query.where(eq(orders.status, status));
    }
    
    if (serviceId) {
      query = query.where(eq(orders.serviceId, serviceId));
    }
    
    if (isPaid !== undefined) {
      query = query.where(eq(orders.isPaid, isPaid === "true"));
    }
    
    if (assignedTo) {
      query = query.where(eq(orders.assignedTo, assignedTo));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(desc(orders.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const orderRecords = await query;
    
    // Format results to include service information
    const ordersWithService = orderRecords.map((row: any) => ({
      ...row.orders,
      service: row.services,
    }));
    
    return new Response(JSON.stringify({ orders: ordersWithService }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch orders" }),
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
    if (!data.serviceId || !data.title || !data.amount) {
      return new Response(
        JSON.stringify({ error: "serviceId, title, and amount are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if service exists
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, data.serviceId));
      
    if (service.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service not found" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newOrder = {
      id: uuidv4(),
      userId: session.user.id,
      serviceId: data.serviceId,
      title: data.title,
      description: data.description,
      status: data.status || "pending",
      amount: data.amount,
      currency: data.currency || "USD",
      requirements: data.requirements || {},
      attachments: data.attachments || [],
      estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
      notes: data.notes,
      createdBy: session.user.id,
    };
    
    const result = await db.insert(orders).values(newOrder).returning();
    
    return new Response(JSON.stringify({ order: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
import { NextRequest } from "next/server";
import { db } from "@/db";
import { payments, orders, purchases } from "@/db/schema";
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
    let query = db.select().from(payments);
    
    // Apply filters
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");
    const purchaseId = searchParams.get("purchaseId");
    const paymentMethod = searchParams.get("paymentMethod");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    // Only allow users to see their own payments unless they're admin
    if (session.user.role !== "admin") {
      query = query.where(eq(payments.userId, session.user.id));
    } else if (userId) {
      // Admin can filter by specific user
      query = query.where(eq(payments.userId, userId));
    } else {
      // Admin can see all payments
    }
    
    if (status) {
      query = query.where(eq(payments.status, status));
    }
    
    if (orderId) {
      query = query.where(eq(payments.orderId, orderId));
    }
    
    if (purchaseId) {
      query = query.where(eq(payments.purchaseId, purchaseId));
    }
    
    if (paymentMethod) {
      query = query.where(eq(payments.paymentMethod, paymentMethod));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(desc(payments.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const paymentRecords = await query;
    
    return new Response(JSON.stringify({ payments: paymentRecords }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch payments" }),
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
    if (!data.transactionId || !data.paymentMethod || !data.amount || !data.status) {
      return new Response(
        JSON.stringify({ error: "transactionId, paymentMethod, amount, and status are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Verify that the user owns the order or purchase if provided
    if (data.orderId) {
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, data.orderId));
      
      if (order.length === 0 || order[0].userId !== session.user.id) {
        return new Response(
          JSON.stringify({ error: "Order not found or unauthorized" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    if (data.purchaseId) {
      const purchase = await db
        .select()
        .from(purchases)
        .where(eq(purchases.id, data.purchaseId));
      
      if (purchase.length === 0 || purchase[0].userId !== session.user.id) {
        return new Response(
          JSON.stringify({ error: "Purchase not found or unauthorized" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    const newPayment = {
      id: uuidv4(),
      userId: session.user.id,
      orderId: data.orderId,
      purchaseId: data.purchaseId,
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod,
      amount: data.amount,
      currency: data.currency || "USD",
      status: data.status,
      gatewayResponse: data.gatewayResponse,
      paymentUrl: data.paymentUrl,
      expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
      paidAt: data.paidAt ? new Date(data.paidAt) : null,
      refundedAt: data.refundedAt ? new Date(data.refundedAt) : null,
      refundedAmount: data.refundedAmount,
      refundedReason: data.refundedReason,
      fraudStatus: data.fraudStatus || "accept",
      signatureKey: data.signatureKey,
      billingDetails: data.billingDetails,
      shippingDetails: data.shippingDetails,
      customField1: data.customField1,
      customField2: data.customField2,
      customField3: data.customField3,
      notes: data.notes,
      processedBy: session.user.role === "admin" ? session.user.id : null,
    };
    
    const result = await db.insert(payments).values(newPayment).returning();
    
    return new Response(JSON.stringify({ payment: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create payment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
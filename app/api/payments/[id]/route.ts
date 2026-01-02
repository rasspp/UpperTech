import { NextRequest } from "next/server";
import { db } from "@/db";
import { payments, orders, purchases } from "@/db/schema";
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
      .from(payments)
      .where(eq(payments.id, id));
    
    // Only allow users to see their own payments unless they're admin
    if (session.user.role !== "admin") {
      query = query.where(eq(payments.userId, session.user.id));
    }
    
    const payment = await query;
    
    if (payment.length === 0) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ payment: payment[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch payment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // This endpoint is specifically for Midtrans webhook updates
    // It should not require authentication from users
    // Instead, it should validate the signature from Midtrans
    
    const { id } = params;
    const data = await request.json();
    
    // For now, we'll skip authentication for webhook updates
    // In production, you should validate the signature from Midtrans
    
    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    
    if (existingPayment.length === 0) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the payment
    const updatedPayment = await db
      .update(payments)
      .set({
        status: data.status || existingPayment[0].status,
        gatewayResponse: data.gatewayResponse || existingPayment[0].gatewayResponse,
        paidAt: data.paidAt ? new Date(data.paidAt) : existingPayment[0].paidAt,
        refundedAt: data.refundedAt ? new Date(data.refundedAt) : null,
        refundedAmount: data.refundedAmount,
        refundedReason: data.refundedReason,
        fraudStatus: data.fraudStatus || existingPayment[0].fraudStatus,
        signatureKey: data.signatureKey || existingPayment[0].signatureKey,
        notes: data.notes || existingPayment[0].notes,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    
    // If payment is successful, update related order or purchase
    if (updatedPayment[0].status === "settlement" || updatedPayment[0].status === "capture") {
      if (updatedPayment[0].orderId) {
        await db
          .update(orders)
          .set({
            isPaid: true,
            paidAt: new Date(),
            status: "confirmed", // Update order status to confirmed
            updatedAt: new Date(),
          })
          .where(eq(orders.id, updatedPayment[0].orderId));
      }
      
      if (updatedPayment[0].purchaseId) {
        await db
          .update(purchases)
          .set({
            purchasedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(purchases.id, updatedPayment[0].purchaseId));
      }
    }
    
    return new Response(JSON.stringify({ payment: updatedPayment[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update payment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // This endpoint is for Midtrans webhook updates
    // It should validate the signature from Midtrans
    
    const { id } = params;
    const data = await request.json();
    
    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id));
    
    if (existingPayment.length === 0) {
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the payment based on Midtrans notification
    const updatedPayment = await db
      .update(payments)
      .set({
        status: data.transaction_status,
        gatewayResponse: data,
        paidAt: data.settlement_time ? new Date(data.settlement_time) : existingPayment[0].paidAt,
        refundedAt: data.refund_time ? new Date(data.refund_time) : null,
        refundedAmount: data.refunded_amount,
        refundedReason: data.refund_reason,
        fraudStatus: data.fraud_status || existingPayment[0].fraudStatus,
        signatureKey: data.signature_key || existingPayment[0].signatureKey,
        notes: `Midtrans notification: ${data.transaction_status}`,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    
    // If payment is successful, update related order or purchase
    if (updatedPayment[0].status === "settlement" || updatedPayment[0].status === "capture") {
      if (updatedPayment[0].orderId) {
        await db
          .update(orders)
          .set({
            isPaid: true,
            paidAt: new Date(),
            status: "confirmed", // Update order status to confirmed
            updatedAt: new Date(),
          })
          .where(eq(orders.id, updatedPayment[0].orderId));
      }
      
      if (updatedPayment[0].purchaseId) {
        await db
          .update(purchases)
          .set({
            purchasedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(purchases.id, updatedPayment[0].purchaseId));
      }
    } else if (updatedPayment[0].status === "cancel" || updatedPayment[0].status === "expire" || updatedPayment[0].status === "deny") {
      // If payment failed, potentially cancel the order
      if (updatedPayment[0].orderId) {
        await db
          .update(orders)
          .set({
            isPaid: false,
            status: "cancelled",
            cancelledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(orders.id, updatedPayment[0].orderId));
      }
    }
    
    return new Response(JSON.stringify({ payment: updatedPayment[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing Midtrans webhook:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process webhook" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
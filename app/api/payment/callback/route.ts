import { NextRequest } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("order_id");
    const transactionId = searchParams.get("transaction_id");
    const status = searchParams.get("status_code");
    
    // Verify the payment status with Midtrans
    // In a real implementation, you'd call the Midtrans API to verify the transaction
    
    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: "Transaction ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the payment record in the database
    const updatedPayment = await db
      .update(payments)
      .set({
        status: status === "200" ? "settlement" : "failed",
        paidAt: status === "200" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(payments.transactionId, transactionId))
      .returning();
    
    if (updatedPayment.length === 0) {
      return new Response(
        JSON.stringify({ error: "Payment record not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Redirect to success page or return success response
    // In a real app, you might want to redirect to a success page
    return new Response(JSON.stringify({ 
      success: true, 
      payment: updatedPayment[0],
      message: status === "200" ? "Payment successful" : "Payment failed"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing payment callback:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process payment callback" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
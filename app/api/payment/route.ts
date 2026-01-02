import { NextRequest } from "next/server";
import { processServicePayment, processDigitalProductPayment, handleMidtransWebhook } from "@/lib/midtrans-service";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    
    if (action === "service") {
      // Handle service payment
      const session = await auth();
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const data = await request.json();
      
      if (!data.orderId) {
        return new Response(
          JSON.stringify({ error: "orderId is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const result = await processServicePayment(data.orderId);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (action === "product") {
      // Handle digital product payment
      const session = await auth();
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const data = await request.json();
      
      if (!data.purchaseId) {
        return new Response(
          JSON.stringify({ error: "purchaseId is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const result = await processDigitalProductPayment(data.purchaseId);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else if (action === "webhook") {
      // Handle Midtrans webhook
      // Note: In a real implementation, you'd want to verify the webhook signature
      // For this example, we'll skip the verification for simplicity
      
      const data = await request.json();
      
      const result = await handleMidtransWebhook(data);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use ?action=service, ?action=product, or ?action=webhook" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process payment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
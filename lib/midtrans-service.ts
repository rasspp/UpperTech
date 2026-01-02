import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, purchases, payments, digitalProducts, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Mock Midtrans service since we don't have the actual package installed
// In a real implementation, you would use the official Midtrans package
class MidtransService {
  private serverKey: string;
  private clientKey: string;
  private isProduction: boolean;

  constructor() {
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-xxx";
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxx";
    this.isProduction = process.env.NODE_ENV === "production";
  }

  // Create a payment transaction
  async createTransaction(orderData: any) {
    // In a real implementation, this would call the Midtrans API
    // For now, we'll simulate the response
    const transactionId = `order-${Date.now()}`;
    
    return {
      transaction_id: transactionId,
      token: `token-${transactionId}`,
      redirect_url: `https://app.midtrans.com/snap/v3/${transactionId}`,
      gross_amount: orderData.gross_amount,
      order_id: orderData.order_id,
    };
  }

  // Verify a transaction
  async verifyTransaction(transactionId: string) {
    // In a real implementation, this would call the Midtrans API
    // For now, we'll simulate a successful response
    return {
      status_code: "200",
      status_message: "Success, transaction found",
      transaction_id: transactionId,
      order_id: transactionId,
      gross_amount: "10000.00",
      currency: "IDR",
      transaction_status: "settlement",
      fraud_status: "accept",
      payment_type: "credit_card",
      transaction_time: new Date().toISOString(),
    };
  }

  // Refund a transaction
  async refundTransaction(transactionId: string, amount: number, reason: string) {
    // In a real implementation, this would call the Midtrans API
    // For now, we'll simulate the response
    return {
      status_code: "200",
      status_message: "Refund processed successfully",
      transaction_id: transactionId,
      refund_amount: amount,
      reason: reason,
    };
  }
}

export const midtransService = new MidtransService();

// Function to process service payment
export async function processServicePayment(orderId: string) {
  try {
    // Get the order details
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));
    
    if (order.length === 0) {
      throw new Error("Order not found");
    }
    
    const orderData = order[0];
    
    // Get service details
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, orderData.serviceId));
    
    if (service.length === 0) {
      throw new Error("Service not found");
    }
    
    // Prepare Midtrans transaction data
    const transactionData = {
      order_id: orderData.id,
      gross_amount: parseFloat(orderData.amount.toString()),
      item_details: [
        {
          id: service[0].id,
          price: parseFloat(orderData.amount.toString()),
          quantity: 1,
          name: service[0].title,
        }
      ],
      customer_details: {
        first_name: "Customer", // In a real app, get from user profile
        email: "customer@example.com", // In a real app, get from user profile
      }
    };
    
    // Create Midtrans transaction
    const midtransResponse = await midtransService.createTransaction(transactionData);
    
    // Create payment record
    const newPayment = {
      id: uuidv4(),
      userId: orderData.userId,
      orderId: orderData.id,
      transactionId: midtransResponse.transaction_id,
      paymentMethod: "credit_card", // This would come from Midtrans response
      amount: orderData.amount,
      currency: orderData.currency,
      status: "pending",
      gatewayResponse: midtransResponse,
      paymentUrl: midtransResponse.redirect_url,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const paymentResult = await db.insert(payments).values(newPayment).returning();
    
    return {
      payment: paymentResult[0],
      redirectUrl: midtransResponse.redirect_url,
      token: midtransResponse.token,
    };
  } catch (error) {
    console.error("Error processing service payment:", error);
    throw error;
  }
}

// Function to process digital product payment
export async function processDigitalProductPayment(purchaseId: string) {
  try {
    // Get the purchase details
    const purchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId));
    
    if (purchase.length === 0) {
      throw new Error("Purchase not found");
    }
    
    const purchaseData = purchase[0];
    
    // Get product details
    const product = await db
      .select()
      .from(digitalProducts)
      .where(eq(digitalProducts.id, purchaseData.productId));
    
    if (product.length === 0) {
      throw new Error("Product not found");
    }
    
    // For digital products, we need to get the price from the product
    const productData = product[0];
    
    // Prepare Midtrans transaction data
    const transactionData = {
      order_id: purchaseData.id,
      gross_amount: parseFloat(productData.price.toString()),
      item_details: [
        {
          id: productData.id,
          price: parseFloat(productData.price.toString()),
          quantity: 1,
          name: productData.title,
        }
      ],
      customer_details: {
        first_name: "Customer", // In a real app, get from user profile
        email: "customer@example.com", // In a real app, get from user profile
      }
    };
    
    // Create Midtrans transaction
    const midtransResponse = await midtransService.createTransaction(transactionData);
    
    // Create payment record
    const newPayment = {
      id: uuidv4(),
      userId: purchaseData.userId,
      purchaseId: purchaseData.id,
      transactionId: midtransResponse.transaction_id,
      paymentMethod: "credit_card", // This would come from Midtrans response
      amount: productData.price,
      currency: "IDR", // Default to IDR for Midtrans
      status: "pending",
      gatewayResponse: midtransResponse,
      paymentUrl: midtransResponse.redirect_url,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const paymentResult = await db.insert(payments).values(newPayment).returning();
    
    return {
      payment: paymentResult[0],
      redirectUrl: midtransResponse.redirect_url,
      token: midtransResponse.token,
    };
  } catch (error) {
    console.error("Error processing digital product payment:", error);
    throw error;
  }
}

// Function to handle Midtrans webhook
export async function handleMidtransWebhook(notificationPayload: any) {
  try {
    const { order_id, transaction_status, fraud_status, payment_type } = notificationPayload;
    
    // Verify the transaction with Midtrans
    const verificationResult = await midtransService.verifyTransaction(notificationPayload.transaction_id);
    
    // Update the payment record based on the transaction status
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.transactionId, notificationPayload.transaction_id));
    
    if (existingPayment.length === 0) {
      throw new Error("Payment record not found");
    }
    
    const updatedPayment = await db
      .update(payments)
      .set({
        status: transaction_status,
        fraudStatus: fraud_status,
        paymentMethod: payment_type,
        gatewayResponse: notificationPayload,
        paidAt: transaction_status === "settlement" || transaction_status === "capture" 
          ? new Date() 
          : existingPayment[0].paidAt,
        updatedAt: new Date(),
      })
      .where(eq(payments.transactionId, notificationPayload.transaction_id))
      .returning();
    
    // If payment is successful, update related order or purchase
    if (transaction_status === "settlement" || transaction_status === "capture") {
      if (updatedPayment[0].orderId) {
        await db
          .update(orders)
          .set({
            isPaid: true,
            paidAt: new Date(),
            status: "confirmed",
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
    } else if (transaction_status === "cancel" || transaction_status === "expire" || transaction_status === "deny") {
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
    
    return {
      status: "success",
      message: "Webhook processed successfully",
      payment: updatedPayment[0],
    };
  } catch (error) {
    console.error("Error handling Midtrans webhook:", error);
    throw error;
  }
}
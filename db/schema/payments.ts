import { pgTable, text, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { orders } from "./orders";
import { purchases } from "./purchases";

export const payments = pgTable("payments", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    orderId: text("order_id")
        .references(() => orders.id, { onDelete: "set null" }),
    purchaseId: text("purchase_id")
        .references(() => purchases.id, { onDelete: "set null" }),
    transactionId: text("transaction_id").notNull(), // Midtrans transaction ID
    paymentMethod: text("payment_method", { 
        enum: ["credit_card", "bank_transfer", "qris", "ovo", "dana", "gopay", "shopeepay", "other"] 
    }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    status: text("status", { 
        enum: ["pending", "settlement", "capture", "cancel", "expire", "fail", "refund", "partial_refund"] 
    }).default("pending").notNull(),
    gatewayResponse: json("gateway_response"), // Full response from payment gateway
    paymentUrl: text("payment_url"), // URL for payment if needed
    expiryTime: timestamp("expiry_time"), // When the payment link expires
    paidAt: timestamp("paid_at"), // When payment was completed
    refundedAt: timestamp("refunded_at"), // When payment was refunded
    refundedAmount: decimal("refunded_amount", { precision: 10, scale: 2 }), // Amount refunded
    refundedReason: text("refunded_reason"), // Reason for refund
    fraudStatus: text("fraud_status", { 
        enum: ["accept", "pending", "challenge", "deny"] 
    }).default("accept"),
    signatureKey: text("signature_key"), // Signature key from payment gateway
    billingDetails: json("billing_details"), // Billing information
    shippingDetails: json("shipping_details"), // Shipping information if applicable
    customField1: text("custom_field1"), // Custom field for additional data
    customField2: text("custom_field2"), // Custom field for additional data
    customField3: text("custom_field3"), // Custom field for additional data
    notes: text("notes"), // Internal notes
    processedBy: text("processed_by")
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxPaymentsTransactionId = payments.transactionId;
export const idxPaymentsUserId = payments.userId;
export const idxPaymentsOrderId = payments.orderId;
export const idxPaymentsPurchaseId = payments.purchaseId;
export const idxPaymentsStatus = payments.status;
export const idxPaymentsPaidAt = payments.paidAt;
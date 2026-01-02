import { pgTable, text, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { services } from "./services";

export const orders = pgTable("orders", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
        .notNull()
        .references(() => services.id, { onDelete: "set null" }),
    title: text("title").notNull(), // Copy of service title at time of order
    description: text("description"), // Additional requirements from client
    status: text("status", { 
        enum: ["pending", "confirmed", "processing", "in_review", "completed", "cancelled", "refunded"] 
    }).default("pending").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    requirements: json("requirements").$type<Record<string, any>>(), // Client requirements as key-value pairs
    attachments: json("attachments").$type<Array<{ name: string; url: string; type: string }>>(), // Files uploaded by client
    assignedTo: text("assigned_to") // ID of admin/user assigned to handle the order
        .references(() => user.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    estimatedDelivery: timestamp("estimated_delivery"),
    actualDelivery: timestamp("actual_delivery"),
    rating: integer("rating"), // Client rating after completion (1-5)
    review: text("review"), // Client review after completion
    isPaid: boolean("is_paid").default(false),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    cancelledReason: text("cancelled_reason"),
    cancellationFee: decimal("cancellation_fee", { precision: 10, scale: 2 }), // Fee if cancelled after certain conditions
    notes: text("notes"), // Internal notes for admin
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxOrdersStatus = orders.status;
export const idxOrdersUserId = orders.userId;
export const idxOrdersServiceId = orders.serviceId;
export const idxOrdersAssignedTo = orders.assignedTo;
export const idxOrdersIsPaid = orders.isPaid;
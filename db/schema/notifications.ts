import { pgTable, text, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { orders } from "./orders";
import { purchases } from "./purchases";

export const notifications = pgTable("notifications", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type", { 
        enum: [
            "order_update", "payment_confirmation", "new_service", 
            "promotion", "system", "reminder", "review_request"
        ] 
    }).notNull(),
    priority: text("priority", { 
        enum: ["low", "normal", "high", "urgent"] 
    }).default("normal").notNull(),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    actionUrl: text("action_url"), // URL to navigate to when notification is clicked
    orderId: text("order_id")
        .references(() => orders.id, { onDelete: "cascade" }), // Associated order if any
    purchaseId: text("purchase_id")
        .references(() => purchases.id, { onDelete: "cascade" }), // Associated purchase if any
    metadata: json("metadata"), // Additional data related to the notification
    sentVia: json("sent_via").$type<{ email?: boolean; push?: boolean; in_app?: boolean }>(), // How the notification was sent
    scheduledAt: timestamp("scheduled_at"), // When to send the notification (for scheduled notifications)
    sentAt: timestamp("sent_at"), // When the notification was actually sent
    deliveredAt: timestamp("delivered_at"), // When the notification was delivered
    error: text("error"), // Error message if notification failed to send
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxNotificationsUserId = notifications.userId;
export const idxNotificationsType = notifications.type;
export const idxNotificationsIsRead = notifications.isRead;
export const idxNotificationsOrderId = notifications.orderId;
export const idxNotificationsPurchaseId = notifications.purchaseId;
export const idxNotificationsScheduledAt = notifications.scheduledAt;
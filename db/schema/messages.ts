import { pgTable, text, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { orders } from "./orders";

export const messages = pgTable("messages", {
    id: text("id").primaryKey().notNull(),
    senderId: text("sender_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    receiverId: text("receiver_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    orderId: text("order_id")
        .references(() => orders.id, { onDelete: "cascade" }), // Associated order if any
    subject: text("subject"),
    content: text("content").notNull(),
    messageType: text("message_type", { 
        enum: ["text", "file", "image", "notification"] 
    }).default("text").notNull(),
    attachments: json("attachments").$type<Array<{ name: string; url: string; type: string; size: number }>>(), // Attached files
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    repliedTo: text("replied_to") // ID of the message this is a reply to
        .references(() => messages.id, { onDelete: "set null" }),
    isDeleted: boolean("is_deleted").default(false), // Soft delete
    deletedAt: timestamp("deleted_at"),
    deletedBy: text("deleted_by")
        .references(() => user.id, { onDelete: "set null" }),
    priority: text("priority", { 
        enum: ["low", "normal", "high", "urgent"] 
    }).default("normal"),
    tags: json("tags").$type<string[]>(), // Array of tags
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxMessagesSenderId = messages.senderId;
export const idxMessagesReceiverId = messages.receiverId;
export const idxMessagesOrderId = messages.orderId;
export const idxMessagesIsRead = messages.isRead;
export const idxMessagesMessageType = messages.messageType;
export const idxMessagesCreatedAt = messages.createdAt;
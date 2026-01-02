import { pgTable, text, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const announcements = pgTable("announcements", {
    id: text("id").primaryKey().notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    type: text("type", { 
        enum: ["info", "warning", "success", "error", "promotion", "maintenance", "update"] 
    }).default("info").notNull(),
    priority: text("priority", { 
        enum: ["low", "medium", "high", "critical"] 
    }).default("medium").notNull(),
    isPublished: boolean("is_published").default(false),
    publishedAt: timestamp("published_at"),
    expiresAt: timestamp("expires_at"), // When the announcement expires
    audience: text("audience", { 
        enum: ["all", "clients", "admins", "unregistered"] 
    }).default("all").notNull(),
    targetUrl: text("target_url"), // URL to redirect to if applicable
    ctaText: text("cta_text"), // Call to action text
    imageUrl: text("image_url"), // Image for the announcement
    tags: json("tags").$type<string[]>(), // Array of tags
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxAnnouncementsPublished = announcements.isPublished;
export const idxAnnouncementsType = announcements.type;
export const idxAnnouncementsPriority = announcements.priority;
export const idxAnnouncementsAudience = announcements.audience;
export const idxAnnouncementsExpiresAt = announcements.expiresAt;
import { pgTable, text, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const profiles = pgTable("profiles", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    firstName: text("first_name"),
    lastName: text("last_name"),
    bio: text("bio"),
    avatar: text("avatar"),
    role: text("role", { enum: ["admin", "client"] }).default("client").notNull(),
    phone: text("phone"),
    address: text("address"),
    city: text("city"),
    country: text("country"),
    isPublic: boolean("is_public").default(false),
    socialLinks: json("social_links"), // Store social media links as JSON
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxProfilesUserId = profiles.userId;
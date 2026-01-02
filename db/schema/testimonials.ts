import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const testimonials = pgTable("testimonials", {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    title: text("title"),
    company: text("company"),
    avatar: text("avatar"),
    content: text("content").notNull(),
    rating: integer("rating").notNull(), // 1-5 stars
    isPublic: boolean("is_public").default(true),
    verified: boolean("verified").default(false),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxTestimonialsRating = testimonials.rating;
export const idxTestimonialsCreatedBy = testimonials.createdBy;
import { pgTable, text, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { serviceCategories } from "./service-categories";

export const services = pgTable("services", {
    id: text("id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    categoryId: text("category_id")
        .notNull()
        .references(() => serviceCategories.id, { onDelete: "set null" }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price in USD or local currency
    currency: text("currency").default("USD"),
    duration: integer("duration"), // Duration in days
    deliveryTime: integer("delivery_time"), // Delivery time in days
    features: json("features").$type<string[]>(), // Array of service features
    revisions: integer("revisions"), // Number of revisions included
    isActive: boolean("is_active").default(true),
    isPublic: boolean("is_public").default(true),
    thumbnailUrl: text("thumbnail_url"),
    faqs: json("faqs").$type<Array<{ question: string; answer: string }>>(), // Array of FAQ objects
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxServicesCategory = services.categoryId;
export const idxServicesActive = services.isActive;
export const idxServicesCreatedBy = services.createdBy;
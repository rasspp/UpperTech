import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const serviceCategories = pgTable("service_categories", {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    description: text("description"),
    icon: text("icon"), // Icon name or URL
    isActive: boolean("is_active").default(true),
    sortOrder: integer("sort_order").default(0),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxServiceCategoriesName = serviceCategories.name;
export const idxServiceCategoriesSortOrder = serviceCategories.sortOrder;
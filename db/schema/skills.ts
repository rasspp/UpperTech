import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const skills = pgTable("skills", {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    category: text("category", { enum: ["frontend", "backend", "database", "devops", "design", "other"] }).notNull(),
    level: integer("level").notNull(), // 1-100 percentage
    icon: text("icon"), // Icon name or URL
    description: text("description"),
    yearsOfExperience: integer("years_of_experience"),
    isPublic: boolean("is_public").default(true),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxSkillsCategory = skills.category;
export const idxSkillsCreatedBy = skills.createdBy;
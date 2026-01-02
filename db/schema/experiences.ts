import { pgTable, text, timestamp, integer, boolean, date } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const experiences = pgTable("experiences", {
    id: text("id").primaryKey().notNull(),
    title: text("title").notNull(),
    company: text("company").notNull(),
    location: text("location"),
    employmentType: text("employment_type", { 
        enum: ["full_time", "part_time", "contract", "internship", "freelance", "self_employed"] 
    }).default("full_time"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"), // null if current position
    description: text("description"),
    responsibilities: text("responsibilities").array(), // Array of responsibilities
    achievements: text("achievements").array(), // Array of achievements
    isPublic: boolean("is_public").default(true),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxExperiencesCompany = experiences.company;
export const idxExperiencesCreatedBy = experiences.createdBy;
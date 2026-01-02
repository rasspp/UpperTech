import { pgTable, text, timestamp, integer, json, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const portfolioProjects = pgTable("portfolio_projects", {
    id: text("id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    imageUrl: text("image_url"),
    demoUrl: text("demo_url"),
    sourceCodeUrl: text("source_code_url"),
    technologies: json("technologies").$type<string[]>(), // Array of technology names
    category: text("category", { enum: ["web", "mobile", "desktop", "other"] }).default("web"),
    featured: boolean("featured").default(false),
    status: text("status", { enum: ["completed", "in_progress", "planned"] }).default("completed"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    client: text("client"),
    projectType: text("project_type", { enum: ["freelance", "personal", "open_source", "commercial"] }),
    tags: json("tags").$type<string[]>(), // Array of tags
    slug: text("slug").notNull().unique(), // URL-friendly identifier
    views: integer("views").default(0),
    likes: integer("likes").default(0),
    isPublic: boolean("is_public").default(true),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxPortfolioProjectsSlug = portfolioProjects.slug;
export const idxPortfolioProjectsCategory = portfolioProjects.category;
export const idxPortfolioProjectsFeatured = portfolioProjects.featured;
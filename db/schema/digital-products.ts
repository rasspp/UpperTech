import { pgTable, text, timestamp, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const digitalProducts = pgTable("digital_products", {
    id: text("id").primaryKey().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    shortDescription: text("short_description"),
    category: text("category", { 
        enum: ["template", "script", "full_project", "plugin", "theme", "other"] 
    }).notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    thumbnailUrl: text("thumbnail_url"),
    demoUrl: text("demo_url"),
    downloadUrl: text("download_url").notNull(), // URL to the downloadable file
    sourceCodeUrl: text("source_code_url"), // URL to source code if different
    previewCode: text("preview_code"), // Code snippet for preview
    documentationUrl: text("documentation_url"),
    techStack: json("tech_stack").$type<string[]>(), // Technologies used
    features: json("features").$type<string[]>(), // Array of product features
    licenseType: text("license_type", { 
        enum: ["personal", "commercial", "extended", "open_source"] 
    }).default("personal"),
    licenseTerms: text("license_terms"), // Detailed license terms
    fileSize: integer("file_size"), // File size in bytes
    downloadLimit: integer("download_limit"), // Number of times product can be downloaded
    salesCount: integer("sales_count").default(0),
    isActive: boolean("is_active").default(true),
    isPublic: boolean("is_public").default(true),
    tags: json("tags").$type<string[]>(), // Array of tags
    version: text("version").default("1.0.0"),
    changelog: json("changelog").$type<Array<{ version: string; date: string; changes: string[] }>>(), // Version history
    supportEmail: text("support_email"),
    demoCredentials: json("demo_credentials").$type<{ username?: string; password?: string }>(), // Demo credentials if needed
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxDigitalProductsCategory = digitalProducts.category;
export const idxDigitalProductsActive = digitalProducts.isActive;
export const idxDigitalProductsCreatedBy = digitalProducts.createdBy;
export const idxDigitalProductsSalesCount = digitalProducts.salesCount;
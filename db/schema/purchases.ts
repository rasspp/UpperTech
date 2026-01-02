import { pgTable, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { digitalProducts } from "./digital-products";

export const purchases = pgTable("purchases", {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
        .notNull()
        .references(() => digitalProducts.id, { onDelete: "cascade" }),
    orderId: text("order_id"), // Reference to order if purchased as part of an order
    licenseType: text("license_type", { 
        enum: ["personal", "commercial", "extended"] 
    }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    downloadCount: integer("download_count").default(0),
    downloadLimit: integer("download_limit"), // Specific download limit for this purchase
    licenseKey: text("license_key"), // Unique license key for the purchase
    isRefunded: boolean("is_refunded").default(false),
    refundedAt: timestamp("refunded_at"),
    refundedReason: text("refunded_reason"),
    refundedBy: text("refunded_by")
        .references(() => user.id, { onDelete: "set null" }),
    purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
    licenseExpiry: timestamp("license_expiry"), // When the license expires
    notes: text("notes"), // Internal notes
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Indexes
export const idxPurchasesUserId = purchases.userId;
export const idxPurchasesProductId = purchases.productId;
export const idxPurchasesLicenseKey = purchases.licenseKey;
export const idxPurchasesIsRefunded = purchases.isRefunded;
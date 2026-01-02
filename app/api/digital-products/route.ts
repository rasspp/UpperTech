import { NextRequest } from "next/server";
import { db } from "@/db";
import { digitalProducts } from "@/db/schema";
import { eq, and, or, asc, desc, like } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if user is authenticated for admin access
    let session = null;
    try {
      session = await auth();
    } catch (error) {
      // Session might not exist, which is fine for public access
    }
    
    const isPublicOnly = !session?.user || session.user.role !== "admin";
    
    // Build query based on filters
    let query = db.select().from(digitalProducts);
    
    // Apply filters
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isActive = searchParams.get("active");
    const isPublic = searchParams.get("public");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    if (category) {
      query = query.where(eq(digitalProducts.category, category));
    }
    
    if (search) {
      query = query.where(
        or(
          like(digitalProducts.title, `%${search}%`),
          like(digitalProducts.description, `%${search}%`),
          like(digitalProducts.shortDescription, `%${search}%`)
        )
      );
    }
    
    if (isActive !== undefined) {
      query = query.where(eq(digitalProducts.isActive, isActive === "true"));
    }
    
    if (isPublic !== undefined) {
      query = query.where(eq(digitalProducts.isPublic, isPublic === "true"));
    }
    
    if (isPublicOnly) {
      query = query.where(eq(digitalProducts.isPublic, true));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(desc(digitalProducts.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const products = await query;
    
    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching digital products:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch digital products" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.description || !data.price || !data.downloadUrl) {
      return new Response(
        JSON.stringify({ error: "Title, description, price, and downloadUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newProduct = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      category: data.category || "other",
      price: data.price,
      currency: data.currency || "USD",
      thumbnailUrl: data.thumbnailUrl,
      demoUrl: data.demoUrl,
      downloadUrl: data.downloadUrl,
      sourceCodeUrl: data.sourceCodeUrl,
      previewCode: data.previewCode,
      documentationUrl: data.documentationUrl,
      techStack: data.techStack || [],
      features: data.features || [],
      licenseType: data.licenseType || "personal",
      licenseTerms: data.licenseTerms,
      fileSize: data.fileSize,
      downloadLimit: data.downloadLimit,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      tags: data.tags || [],
      version: data.version || "1.0.0",
      changelog: data.changelog || [],
      supportEmail: data.supportEmail,
      demoCredentials: data.demoCredentials,
      createdBy: session.user.id,
    };
    
    const result = await db.insert(digitalProducts).values(newProduct).returning();
    
    return new Response(JSON.stringify({ product: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating digital product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create digital product" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
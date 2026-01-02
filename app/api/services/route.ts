import { NextRequest } from "next/server";
import { db } from "@/db";
import { services, serviceCategories } from "@/db/schema";
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
    let query = db.select().from(services)
      .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id));
    
    // Apply filters
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");
    const isActive = searchParams.get("active");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    if (categoryId) {
      query = query.where(eq(services.categoryId, categoryId));
    }
    
    if (search) {
      query = query.where(
        or(
          like(services.title, `%${search}%`),
          like(services.description, `%${search}%`),
          like(serviceCategories.name, `%${search}%`)
        )
      );
    }
    
    if (isActive !== undefined) {
      query = query.where(eq(services.isActive, isActive === "true"));
    }
    
    if (isPublicOnly) {
      query = query.where(eq(services.isPublic, true));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(desc(services.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const results = await query;
    
    // Format results to include category information
    const servicesWithCategory = results.map((row: any) => ({
      ...row.services,
      category: row.service_categories,
    }));
    
    return new Response(JSON.stringify({ services: servicesWithCategory }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch services" }),
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
    if (!data.title || !data.description || !data.categoryId || !data.price) {
      return new Response(
        JSON.stringify({ error: "Title, description, categoryId, and price are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if category exists
    const category = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, data.categoryId));
      
    if (category.length === 0) {
      return new Response(
        JSON.stringify({ error: "Category not found" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newService = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      categoryId: data.categoryId,
      price: data.price,
      currency: data.currency || "USD",
      duration: data.duration,
      deliveryTime: data.deliveryTime,
      features: data.features || [],
      revisions: data.revisions,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      thumbnailUrl: data.thumbnailUrl,
      faqs: data.faqs || [],
      createdBy: session.user.id,
    };
    
    const result = await db.insert(services).values(newService).returning();
    
    return new Response(JSON.stringify({ service: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating service:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create service" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
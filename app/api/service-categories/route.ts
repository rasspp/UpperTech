import { NextRequest } from "next/server";
import { db } from "@/db";
import { serviceCategories } from "@/db/schema";
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
    let query = db.select().from(serviceCategories);
    
    // Apply filters
    const search = searchParams.get("search");
    const isActive = searchParams.get("active");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    if (search) {
      query = query.where(like(serviceCategories.name, `%${search}%`));
    }
    
    if (isActive !== undefined) {
      query = query.where(eq(serviceCategories.isActive, isActive === "true"));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(serviceCategories.sortOrder, asc(serviceCategories.name));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const categories = await query;
    
    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching service categories:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch service categories" }),
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
    if (!data.name) {
      return new Response(
        JSON.stringify({ error: "Name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newCategory = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      icon: data.icon,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: data.sortOrder || 0,
      createdBy: session.user.id,
    };
    
    const result = await db.insert(serviceCategories).values(newCategory).returning();
    
    return new Response(JSON.stringify({ category: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating service category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create service category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
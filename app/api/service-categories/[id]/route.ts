import { NextRequest } from "next/server";
import { db } from "@/db";
import { serviceCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    const category = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, id));
    
    if (category.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service category not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ category: category[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching service category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch service category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Check if category exists and belongs to user
    const existingCategory = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, id));
    
    if (existingCategory.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service category not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingCategory[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this category" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the category
    const updatedCategory = await db
      .update(serviceCategories)
      .set({
        name: data.name,
        description: data.description,
        icon: data.icon,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(serviceCategories.id, id))
      .returning();
    
    return new Response(JSON.stringify({ category: updatedCategory[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating service category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update service category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id } = params;
    
    // Check if category exists and belongs to user
    const existingCategory = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.id, id));
    
    if (existingCategory.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service category not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingCategory[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to delete this category" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the category
    await db
      .delete(serviceCategories)
      .where(eq(serviceCategories.id, id));
    
    return new Response(JSON.stringify({ message: "Service category deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting service category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete service category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
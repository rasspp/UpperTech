import { NextRequest } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Check if user is authenticated for admin access
    let session = null;
    try {
      session = await auth();
    } catch (error) {
      // Session might not exist, which is fine for public access
    }
    
    const isPublicOnly = !session?.user || session.user.role !== "admin";
    
    let query = db
      .select()
      .from(services)
      .where(eq(services.id, id));
    
    if (isPublicOnly) {
      query = query.where(eq(services.isPublic, true));
    }
    
    const service = await query;
    
    if (service.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ service: service[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch service" }),
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
    
    // Check if service exists and belongs to user
    const existingService = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    
    if (existingService.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingService[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this service" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the service
    const updatedService = await db
      .update(services)
      .set({
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: data.categoryId,
        price: data.price,
        currency: data.currency,
        duration: data.duration,
        deliveryTime: data.deliveryTime,
        features: data.features || [],
        revisions: data.revisions,
        isActive: data.isActive,
        isPublic: data.isPublic,
        thumbnailUrl: data.thumbnailUrl,
        faqs: data.faqs || [],
        updatedAt: new Date(),
      })
      .where(eq(services.id, id))
      .returning();
    
    return new Response(JSON.stringify({ service: updatedService[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update service" }),
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
    
    // Check if service exists and belongs to user
    const existingService = await db
      .select()
      .from(services)
      .where(eq(services.id, id));
    
    if (existingService.length === 0) {
      return new Response(
        JSON.stringify({ error: "Service not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingService[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to delete this service" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the service
    await db
      .delete(services)
      .where(eq(services.id, id));
    
    return new Response(JSON.stringify({ message: "Service deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete service" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
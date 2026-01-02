import { NextRequest } from "next/server";
import { db } from "@/db";
import { digitalProducts } from "@/db/schema";
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
      .from(digitalProducts)
      .where(eq(digitalProducts.id, id));
    
    if (isPublicOnly) {
      query = query.where(eq(digitalProducts.isPublic, true));
    }
    
    const product = await query;
    
    if (product.length === 0) {
      return new Response(
        JSON.stringify({ error: "Digital product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ product: product[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching digital product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch digital product" }),
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
    
    // Check if product exists and belongs to user
    const existingProduct = await db
      .select()
      .from(digitalProducts)
      .where(eq(digitalProducts.id, id));
    
    if (existingProduct.length === 0) {
      return new Response(
        JSON.stringify({ error: "Digital product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingProduct[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this product" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the product
    const updatedProduct = await db
      .update(digitalProducts)
      .set({
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        price: data.price,
        currency: data.currency,
        thumbnailUrl: data.thumbnailUrl,
        demoUrl: data.demoUrl,
        downloadUrl: data.downloadUrl,
        sourceCodeUrl: data.sourceCodeUrl,
        previewCode: data.previewCode,
        documentationUrl: data.documentationUrl,
        techStack: data.techStack || [],
        features: data.features || [],
        licenseType: data.licenseType,
        licenseTerms: data.licenseTerms,
        fileSize: data.fileSize,
        downloadLimit: data.downloadLimit,
        isActive: data.isActive,
        isPublic: data.isPublic,
        tags: data.tags || [],
        version: data.version,
        changelog: data.changelog || [],
        supportEmail: data.supportEmail,
        demoCredentials: data.demoCredentials,
        updatedAt: new Date(),
      })
      .where(eq(digitalProducts.id, id))
      .returning();
    
    return new Response(JSON.stringify({ product: updatedProduct[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating digital product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update digital product" }),
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
    
    // Check if product exists and belongs to user
    const existingProduct = await db
      .select()
      .from(digitalProducts)
      .where(eq(digitalProducts.id, id));
    
    if (existingProduct.length === 0) {
      return new Response(
        JSON.stringify({ error: "Digital product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingProduct[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to delete this product" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the product
    await db
      .delete(digitalProducts)
      .where(eq(digitalProducts.id, id));
    
    return new Response(JSON.stringify({ message: "Digital product deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting digital product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete digital product" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
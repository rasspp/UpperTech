import { NextRequest } from "next/server";
import { db } from "@/db";
import { portfolioProjects, portfolioProjectSkills } from "@/db/schema";
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
      .from(portfolioProjects)
      .where(eq(portfolioProjects.id, id));
    
    if (isPublicOnly) {
      query = query.where(eq(portfolioProjects.isPublic, true));
    }
    
    const project = await query;
    
    if (project.length === 0) {
      return new Response(
        JSON.stringify({ error: "Portfolio project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(JSON.stringify({ project: project[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching portfolio project:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch portfolio project" }),
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
    
    // Check if project exists and belongs to user
    const existingProject = await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.id, id));
    
    if (existingProject.length === 0) {
      return new Response(
        JSON.stringify({ error: "Portfolio project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingProject[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this project" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the project
    const updatedProject = await db
      .update(portfolioProjects)
      .set({
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        imageUrl: data.imageUrl,
        demoUrl: data.demoUrl,
        sourceCodeUrl: data.sourceCodeUrl,
        technologies: data.technologies || [],
        category: data.category,
        featured: data.featured,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        client: data.client,
        projectType: data.projectType,
        tags: data.tags || [],
        slug: data.slug,
        isPublic: data.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(portfolioProjects.id, id))
      .returning();
    
    // Update skills if provided
    if (data.skillIds && Array.isArray(data.skillIds)) {
      // First, delete existing associations
      await db
        .delete(portfolioProjectSkills)
        .where(eq(portfolioProjectSkills.projectId, id));
      
      // Then add new associations
      const skillAssociations = data.skillIds.map((skillId: string) => ({
        id: uuidv4(),
        projectId: id,
        skillId,
      }));
      
      if (skillAssociations.length > 0) {
        await db.insert(portfolioProjectSkills).values(skillAssociations);
      }
    }
    
    return new Response(JSON.stringify({ project: updatedProject[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating portfolio project:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update portfolio project" }),
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
    
    // Check if project exists and belongs to user
    const existingProject = await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.id, id));
    
    if (existingProject.length === 0) {
      return new Response(
        JSON.stringify({ error: "Portfolio project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is the creator or admin
    if (existingProject[0].createdBy !== session.user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to delete this project" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Delete the project and its skill associations
    await db
      .delete(portfolioProjectSkills)
      .where(eq(portfolioProjectSkills.projectId, id));
    
    await db
      .delete(portfolioProjects)
      .where(eq(portfolioProjects.id, id));
    
    return new Response(JSON.stringify({ message: "Portfolio project deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting portfolio project:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete portfolio project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
import { NextRequest } from "next/server";
import { db } from "@/db";
import { portfolioProjects, skills, portfolioProjectSkills } from "@/db/schema";
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
    let query = db.select().from(portfolioProjects)
      .leftJoin(portfolioProjectSkills, eq(portfolioProjects.id, portfolioProjectSkills.projectId))
      .leftJoin(skills, eq(portfolioProjectSkills.skillId, skills.id));
    
    // Apply filters
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    
    if (category) {
      query = query.where(eq(portfolioProjects.category, category));
    }
    
    if (featured === "true") {
      query = query.where(eq(portfolioProjects.featured, true));
    }
    
    if (search) {
      query = query.where(
        or(
          like(portfolioProjects.title, `%${search}%`),
          like(portfolioProjects.description, `%${search}%`),
          like(portfolioProjects.shortDescription, `%${search}%`)
        )
      );
    }
    
    if (isPublicOnly) {
      query = query.where(eq(portfolioProjects.isPublic, true));
    }
    
    // Apply sorting and pagination
    query = query.orderBy(desc(portfolioProjects.createdAt));
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    const results = await query;
    
    // Group results by project to include skills
    const projectsMap = new Map();
    results.forEach((row: any) => {
      const project = row.portfolio_projects;
      if (!projectsMap.has(project.id)) {
        projectsMap.set(project.id, {
          ...project,
          skills: row.skills ? [row.skills] : []
        });
      } else {
        const existingProject = projectsMap.get(project.id);
        if (row.skills && !existingProject.skills.some((s: any) => s.id === row.skills.id)) {
          existingProject.skills.push(row.skills);
        }
      }
    });
    
    const projects = Array.from(projectsMap.values());
    
    return new Response(JSON.stringify({ projects }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching portfolio projects:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch portfolio projects" }),
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
    if (!data.title || !data.description || !data.slug) {
      return new Response(
        JSON.stringify({ error: "Title, description, and slug are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if slug already exists
    const existingProject = await db
      .select()
      .from(portfolioProjects)
      .where(eq(portfolioProjects.slug, data.slug));
      
    if (existingProject.length > 0) {
      return new Response(
        JSON.stringify({ error: "Slug already exists" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const newProject = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription,
      imageUrl: data.imageUrl,
      demoUrl: data.demoUrl,
      sourceCodeUrl: data.sourceCodeUrl,
      technologies: data.technologies || [],
      category: data.category || "web",
      featured: data.featured || false,
      status: data.status || "completed",
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      client: data.client,
      projectType: data.projectType,
      tags: data.tags || [],
      slug: data.slug,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      createdBy: session.user.id,
    };
    
    const result = await db.insert(portfolioProjects).values(newProject).returning();
    
    // Add skills if provided
    if (data.skillIds && Array.isArray(data.skillIds)) {
      const skillAssociations = data.skillIds.map((skillId: string) => ({
        id: uuidv4(),
        projectId: result[0].id,
        skillId,
      }));
      
      if (skillAssociations.length > 0) {
        await db.insert(portfolioProjectSkills).values(skillAssociations);
      }
    }
    
    return new Response(JSON.stringify({ project: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating portfolio project:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create portfolio project" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
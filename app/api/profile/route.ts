import { NextRequest } from "next/server";
import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Get profile for the authenticated user
    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id));
    
    if (userProfile.length === 0) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Also get the user information
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));
    
    const profileData = {
      ...userProfile[0],
      user: user[0],
    };
    
    return new Response(JSON.stringify({ profile: profileData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch profile" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const data = await request.json();
    
    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id));
    
    if (existingProfile.length > 0) {
      return new Response(
        JSON.stringify({ error: "Profile already exists. Use PUT to update." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Create new profile
    const newProfile = {
      id: uuidv4(),
      userId: session.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      avatar: data.avatar,
      role: "client", // Default role for new profiles
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
      isPublic: data.isPublic !== undefined ? data.isPublic : false,
      socialLinks: data.socialLinks || {},
    };
    
    const result = await db.insert(profiles).values(newProfile).returning();
    
    return new Response(JSON.stringify({ profile: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create profile" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const data = await request.json();
    
    // Get existing profile
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id));
    
    if (existingProfile.length === 0) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if user is admin or owner of the profile
    const isProfileOwner = existingProfile[0].userId === session.user.id;
    const isAdmin = session.user.role === "admin";
    
    if (!isProfileOwner && !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized to update this profile" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update the profile
    const updatedProfile = await db
      .update(profiles)
      .set({
        firstName: data.firstName !== undefined ? data.firstName : existingProfile[0].firstName,
        lastName: data.lastName !== undefined ? data.lastName : existingProfile[0].lastName,
        bio: data.bio !== undefined ? data.bio : existingProfile[0].bio,
        avatar: data.avatar !== undefined ? data.avatar : existingProfile[0].avatar,
        phone: data.phone !== undefined ? data.phone : existingProfile[0].phone,
        address: data.address !== undefined ? data.address : existingProfile[0].address,
        city: data.city !== undefined ? data.city : existingProfile[0].city,
        country: data.country !== undefined ? data.country : existingProfile[0].country,
        isPublic: data.isPublic !== undefined ? data.isPublic : existingProfile[0].isPublic,
        socialLinks: data.socialLinks !== undefined ? data.socialLinks : existingProfile[0].socialLinks,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id))
      .returning();
    
    return new Response(JSON.stringify({ profile: updatedProfile[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
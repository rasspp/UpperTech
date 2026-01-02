import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Define role-based access control middleware
export async function roleBasedAuth(
  request: NextRequest,
  requiredRole: "admin" | "client" | "any" = "any"
): Promise<NextResponse | null> {
  try {
    // Get the session
    const session = await auth();
    
    // If no session and role is required, deny access
    if (!session?.user) {
      if (requiredRole !== "any") {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
      return null; // Allow access for public routes
    }
    
    // If session exists but role is required, check the role
    if (requiredRole !== "any") {
      // Get user profile to check role
      // For now, we'll use the role from the session if available
      // In a real implementation, you'd fetch the role from the database
      const userRole = session.user.role || "client";
      
      if (requiredRole === "admin" && userRole !== "admin") {
        // Admin access required but user is not admin
        return NextResponse.redirect(new URL("/", request.url));
      }
      
      if (requiredRole === "client" && userRole !== "client" && userRole !== "admin") {
        // Client access required but user is neither client nor admin
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    
    return null; // Allow access
  } catch (error) {
    console.error("Role-based auth error:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

// Specific middleware functions
export async function adminOnly(request: NextRequest): Promise<NextResponse | null> {
  return roleBasedAuth(request, "admin");
}

export async function clientOnly(request: NextRequest): Promise<NextResponse | null> {
  return roleBasedAuth(request, "client");
}

export async function authenticatedOnly(request: NextRequest): Promise<NextResponse | null> {
  return roleBasedAuth(request, "any");
}
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";

// Helper function to get user role
export async function getUserRole(userId: string) {
  try {
    const userProfile = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.userId, userId));
    
    if (userProfile.length > 0) {
      return userProfile[0].role;
    }
    
    return "client"; // Default role
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "client"; // Default to client on error
  }
}

// Helper function to check if user is admin
export async function isAdmin() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return false;
    }
    
    const role = await getUserRole(session.user.id);
    return role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Helper function to check if user is client
export async function isClient() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return false;
    }
    
    const role = await getUserRole(session.user.id);
    return role === "client" || role === "admin"; // Admins can also access client features
  } catch (error) {
    console.error("Error checking client status:", error);
    return false;
  }
}

// Higher-order function to create role-based access control
export function withRoleAccess(allowedRoles: ("admin" | "client")[]) {
  return async function (handler: (req: any, ctx: any) => any) {
    return async (req: any, ctx: any) => {
      try {
        const session = await auth();
        
        if (!session?.user) {
          return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            { status: 401, headers: { "Content-Type": "application/json" } }
          );
        }
        
        const role = await getUserRole(session.user.id);
        
        if (!allowedRoles.includes(role as any)) {
          return new Response(
            JSON.stringify({ error: "Forbidden: Insufficient permissions" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
        
        return handler(req, ctx);
      } catch (error) {
        console.error("Role access check error:", error);
        return new Response(
          JSON.stringify({ error: "Internal server error" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    };
  };
}
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema/auth";
import { profiles } from "@/db/schema/profiles";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: {
            user: user,
            account: account,
            session: session,
            verification: verification,
        }
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        // Add social providers here if needed
    },
    hooks: {
        // Add hooks to handle role assignment
        afterUserCreated: async ({ user }) => {
            // Create a profile for the new user with default role
            await db.insert(profiles).values({
                id: user.id, // Use the same ID as the user
                userId: user.id,
                role: "client", // Default role is client
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    },
    plugins: [
        // Add a plugin to include role in session
        {
            id: "user-role",
            sessionCreated: async ({ session, user }) => {
                // Fetch user profile to get role
                const userProfile = await db
                    .select()
                    .from(profiles)
                    .where(eq(profiles.userId, user.id));

                if (userProfile.length > 0) {
                    // Update session with role information
                    // Note: This is a simplified approach
                    // In a real implementation, you might need to update the session data differently
                }
            }
        }
    ]
});
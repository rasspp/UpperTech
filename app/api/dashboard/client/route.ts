import { NextRequest } from "next/server";
import { db } from "@/db";
import {
  orders,
  purchases,
  notifications,
  digitalProducts,
  services
} from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
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

    // Get client dashboard data
    const [
      userOrders,
      userPurchases,
      unreadNotifications,
      recentNotifications
    ] = await Promise.all([
      // Get user's orders
      db
        .select()
        .from(orders)
        .where(eq(orders.userId, session.user.id))
        .orderBy(desc(orders.createdAt))
        .limit(10),

      // Get user's purchases
      db
        .select({
          id: purchases.id,
          productId: purchases.productId,
          purchasedAt: purchases.purchasedAt,
          licenseKey: purchases.licenseKey,
          downloadCount: purchases.downloadCount,
          downloadLimit: purchases.downloadLimit,
          product: {
            id: digitalProducts.id,
            title: digitalProducts.title,
            thumbnailUrl: digitalProducts.thumbnailUrl,
          }
        })
        .from(purchases)
        .leftJoin(digitalProducts, eq(purchases.productId, digitalProducts.id))
        .where(eq(purchases.userId, session.user.id))
        .orderBy(desc(purchases.purchasedAt))
        .limit(10),

      // Get unread notifications count
      db
        .select({ count: { count: Number } })
        .from(notifications)
        .where(and(
          eq(notifications.userId, session.user.id),
          eq(notifications.isRead, false)
        )),

      // Get recent notifications
      db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, session.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(5)
    ]);

    // Get service information for orders
    const orderServiceIds = userOrders.map(order => order.serviceId);
    const orderServices = await db
      .select()
      .from(services)
      .where(inArray(services.id, orderServiceIds));

    const serviceMap = new Map(orderServices.map(service => [service.id, service]));

    const dashboardData = {
      orders: userOrders.map(order => ({
        ...order,
        service: serviceMap.get(order.serviceId) || null
      })),
      purchases: userPurchases,
      unreadNotifications: unreadNotifications[0]?.count || 0,
      recentNotifications,
    };

    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching client dashboard data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch dashboard data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
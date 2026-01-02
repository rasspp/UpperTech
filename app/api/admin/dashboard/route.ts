import { NextRequest } from "next/server";
import { db } from "@/db";
import { 
  orders, 
  payments, 
  digitalProducts, 
  users, 
  profiles 
} from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { count, sum, avg } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    // Parse date range
    let dateFilter = undefined;
    if (startDate && endDate) {
      dateFilter = and(
        gte(orders.createdAt, new Date(startDate)),
        lte(orders.createdAt, new Date(endDate))
      );
    } else if (startDate) {
      dateFilter = gte(orders.createdAt, new Date(startDate));
    } else if (endDate) {
      dateFilter = lte(orders.createdAt, new Date(endDate));
    }
    
    // Get basic statistics
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      pendingOrders,
      processingOrders
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users).then(result => result[0].count),
      
      // Total orders
      db.select({ count: count() }).from(orders)
        .where(dateFilter ? dateFilter : undefined)
        .then(result => result[0].count),
      
      // Total revenue
      db.select({ total: sum(orders.amount) })
        .from(orders)
        .where(and(
          eq(orders.isPaid, true),
          dateFilter ? dateFilter : undefined
        ))
        .then(result => parseFloat(result[0].total?.toString() || "0")),
      
      // Total digital products
      db.select({ count: count() }).from(digitalProducts)
        .then(result => result[0].count),
      
      // Pending orders
      db.select({ count: count() })
        .from(orders)
        .where(and(
          eq(orders.status, "pending"),
          dateFilter ? dateFilter : undefined
        ))
        .then(result => result[0].count),
      
      // Processing orders
      db.select({ count: count() })
        .from(orders)
        .where(and(
          eq(orders.status, "processing"),
          dateFilter ? dateFilter : undefined
        ))
        .then(result => result[0].count)
    ]);
    
    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        title: orders.title,
        amount: orders.amount,
        status: orders.status,
        isPaid: orders.isPaid,
        createdAt: orders.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(dateFilter ? dateFilter : undefined)
      .orderBy(orders.createdAt)
      .limit(10);
    
    // Get top selling products
    const topProducts = await db
      .select({
        id: digitalProducts.id,
        title: digitalProducts.title,
        salesCount: digitalProducts.salesCount,
        price: digitalProducts.price
      })
      .from(digitalProducts)
      .orderBy(digitalProducts.salesCount)
      .limit(5);
    
    // Get monthly revenue
    const monthlyRevenue = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${orders.createdAt})`.as('month'),
        total: sum(orders.amount).as('total'),
        count: count().as('count')
      })
      .from(orders)
      .where(and(
        eq(orders.isPaid, true),
        dateFilter ? dateFilter : undefined
      ))
      .groupBy(sql`DATE_TRUNC('month', ${orders.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${orders.createdAt})`);
    
    const dashboardData = {
      stats: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        pendingOrders,
        processingOrders,
      },
      recentOrders,
      topProducts,
      monthlyRevenue: monthlyRevenue.map(r => ({
        month: r.month,
        total: parseFloat(r.total?.toString() || "0"),
        count: parseInt(r.count.toString()),
      })),
    };
    
    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch dashboard data" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
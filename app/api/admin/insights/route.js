// app/api/admin/insights/route.js
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const usersCount = await prisma.user.count();
        let ordersCount = 0;
        let productsCount = 0;
      
        try {
          ordersCount = await prisma.order.count();
        } catch (error) {
          console.warn("Order table not found, returning 0 as count.");
          ordersCount = 0;
        }
      
        try {
          productsCount = await prisma.product.count();
        } catch (error) {
          console.warn("Product table not found, returning 0 as count.");
          productsCount = 0;
        }
      
        return new Response(
          JSON.stringify({ users: usersCount, orders: ordersCount, products: productsCount }),
          { status: 200 }
        );
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch insights' }), { status: 500 });
      }
      
}

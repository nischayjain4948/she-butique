import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const users = await prisma.user.findMany();
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching users' }), { status: 500 });
  }
}

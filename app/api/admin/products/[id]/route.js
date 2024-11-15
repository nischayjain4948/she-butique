import { prisma } from '@/lib/prisma';

export async function PATCH(req, { params }) {
  const { id } = params;
  const body = await req.json();

  try {
    const updatedUser = await prisma.product.update({
      where: { id },
      data: body,
    });
    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating product' }), { status: 500 });
  }
}

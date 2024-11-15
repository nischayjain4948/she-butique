// app/api/register/route.js
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req) {
  const { fullName, email, password } = await req.json();

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return new Response(JSON.stringify({ error: 'User already exists' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the user in the database
  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
    },
  });

  return new Response(JSON.stringify({ message: 'User registered successfully' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

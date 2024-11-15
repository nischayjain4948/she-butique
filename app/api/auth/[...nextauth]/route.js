// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';  // Import Prisma client
import bcrypt from 'bcrypt';  // For password hashing comparison

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials;

        // Fetch the user from the database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Check if user exists and if password is correct
        if (user && await bcrypt.compare(password, user.password)) {
          // If credentials are valid, return the user object
          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            role: user.role,  // Store user role
          };
        }
        
        // If credentials are invalid, return null
        return null;
      }
    })
  ],
  secret : "ecom_secret",
  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
  },
  session: {
    strategy: 'jwt',  // Use JWTs for sessions
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role; 
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; 
      }
      return token;
    },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

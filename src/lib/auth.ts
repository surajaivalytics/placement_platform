import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log('❌ Login failed: Missing credentials');
                        throw new Error('Missing credentials');
                    }

                    console.log('🔄 Attempting login for:', credentials.email);

                    // Find user in database
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user || !user.password) {
                        console.log('❌ Login failed: User not found or no password');
                        throw new Error('Invalid credentials');
                    }

                    // Verify password
                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        console.log('❌ Login failed: Invalid password');
                        throw new Error('Invalid credentials');
                    }

                    console.log('✅ Login successful for:', user.email);

                    // Return user object with role
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role as "admin" | "user",
                    };
                } catch (error) {
                    const errorDetails = {
                        message: (error as Error).message,
                        stack: (error as Error).stack,
                        error,
                        timestamp: new Date().toISOString()
                    };
                    console.error('❌ Authorization error details:', errorDetails);

                    console.error('❌ Authorization error details:', errorDetails);

                    // Return null to trigger CredentialsSignin error
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.isProfileComplete = false; // Default
            }

            // If user is logged in, fetch latest data to check profile completion
            if (token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: {
                        phone: true,
                        graduationCGPA: true,
                        tenthPercentage: true,
                        twelfthPercentage: true,
                        role: true
                    }
                });

                if (dbUser) {
                    token.role = dbUser.role as "admin" | "user";
                    const isComplete = !!(
                        dbUser.phone &&
                        dbUser.graduationCGPA !== null &&
                        dbUser.tenthPercentage !== null &&
                        dbUser.twelfthPercentage !== null
                    );
                    token.isProfileComplete = isComplete;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.sub!;
                session.user.isProfileComplete = token.isProfileComplete;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    debug: process.env.NODE_ENV === 'development',
};

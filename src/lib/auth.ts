import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
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

                    // Direct file logging
                    try {
                        const fs = require('fs');
                        const path = require('path');
                        const logFile = path.join(process.cwd(), 'auth_debug.log');
                        fs.appendFileSync(logFile, JSON.stringify(errorDetails, null, 2) + '\n');
                    } catch (fsError) {
                        console.error('Failed to write to log file', fsError);
                    }

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
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.sub!;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    debug: process.env.NODE_ENV === 'development',
};

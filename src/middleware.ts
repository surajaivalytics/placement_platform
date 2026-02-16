import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup');

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
            return null;
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }
            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        // Admin Route Protection
        if (req.nextUrl.pathname.startsWith('/admin')) {
            if (token?.role !== 'admin') {
                return NextResponse.redirect(new URL('/dashboard', req.url));
            }
        }

        // Profile Completion Enforcement
        if (isAuth && !token.isProfileComplete) {
            const isProfilePage = req.nextUrl.pathname.startsWith('/dashboard/profile');
            const isApi = req.nextUrl.pathname.startsWith('/api'); // Don't block API calls

            if (req.nextUrl.pathname.startsWith('/dashboard') && !isProfilePage && !isApi) {
                return NextResponse.redirect(new URL('/dashboard/profile?incomplete=true', req.url));
            }
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};

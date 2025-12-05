import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (trigger === 'signIn' || trigger === 'signUp') {
                if (user) {
                    token.username = user.username
                    token.role = user.role
                    token.sub = user.id
                }
            }
            return token
        },
        async session({ session, token }) {
            // Add username and role to the session from the token
            if (session.user) {
                session.user.username = token.username as string
                session.user.role = token.role as string
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            console.log('Middleware Authorized Check:', {
                pathname: nextUrl.pathname,
                isLoggedIn,
                role: auth?.user?.role,
                isOnAdmin
            });

            if (isOnAdmin) {
                if (isLoggedIn && auth?.user?.role === 'ADMIN') return true;
                return false; // Redirect unauthorized users
            }

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const response = NextResponse.next();

    // Security Headers
    const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');

    // Allow 'self', nonce, and critical Next.js domains/schemes
    // In development mode, allow 'unsafe-eval' for React devtools/sourcemaps and WebSocket connections for HMR.
    const isDev = process.env.NODE_ENV !== 'production';

    const scriptSrc = isDev
        ? `'self' 'unsafe-eval' 'unsafe-inline'`
        : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

    const connectSrc = isDev ? "connect-src 'self' ws: wss:;" : "";

    const cspHeader = `
        default-src 'self';
        script-src ${scriptSrc};
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: https:;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        ${connectSrc}
        ${isDev ? '' : 'block-all-mixed-content;'}
        ${isDev ? '' : 'upgrade-insecure-requests;'}
    `.replace(/\s{2,}/g, ' ').trim();

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME-sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Control feature permissions
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=()'
    );

    // Strict Transport Security (HSTS) - Force HTTPS
    // Max-age: 1 year (31536000 seconds)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    // Set CSP
    response.headers.set('Content-Security-Policy', cspHeader);
    // Also set the nonce request header so it can be read by server components if needed
    response.headers.set('x-nonce', nonce);

    return response;
});

// Configure paths that middleware applies to
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

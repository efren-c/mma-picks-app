'use server';

import { cookies } from 'next/headers';
import { LOCALE_COOKIE_NAME } from '@/lib/i18n';
import { revalidatePath } from 'next/cache';

export async function switchLanguage(locale: string) {
    const cookieStore = await cookies();

    // Set cookie to expire in 1 year
    cookieStore.set(LOCALE_COOKIE_NAME, locale, {
        path: '/',
        maxAge: 31536000,
        sameSite: 'strict',
    });

    revalidatePath('/');
}

import { cookies } from 'next/headers';
import { en } from '@/dictionaries/en';
import { es } from '@/dictionaries/es';

const dictionaries = {
    en,
    es,
};

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
export type Locale = keyof typeof dictionaries;

export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(LOCALE_COOKIE_NAME);
    const locale = cookie?.value as Locale;

    if (locale && dictionaries[locale]) {
        return locale;
    }

    return 'en';
}

export async function getDictionary(locale?: Locale) {
    const l = locale || await getLocale();
    return dictionaries[l];
}

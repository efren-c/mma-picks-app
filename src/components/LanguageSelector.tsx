"use client"

import { switchLanguage } from "@/app/actions/switch-language"
import { Button } from "@/components/ui/button"

interface LanguageSelectorProps {
    currentLocale: 'en' | 'es'
}

export function LanguageSelector({ currentLocale }: LanguageSelectorProps) {

    const handleSwitch = async (newLocale: 'en' | 'es') => {
        if (newLocale === currentLocale) return
        await switchLanguage(newLocale)
    }

    return (
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4 ml-2">
            <button
                onClick={() => handleSwitch('en')}
                className={`w-6 h-6 rounded-full overflow-hidden transition-all ${currentLocale === 'en' ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                title="English"
            >
                <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
                    <path fill="#bd3d44" d="M0 0h640v480H0" />
                    <path stroke="#fff" strokeWidth="37" d="M0 55.3h640M0 129h640M0 202.8h640M0 276.5h640M0 350.3h640M0 424h640" />
                    <path fill="#192f5d" d="M0 0h296v258H0" />
                    <path fill="#fff" d="M15.4 122.3h22.6L7.4 144c2.8-8.8 17.5-36 17.5-36l17.7 36H20L45.4 100" transform="translate(18 13)" />
                    {/* Simplified stars for file size in example */}
                    <circle cx="50" cy="50" r="12" fill="#fff" />
                    <circle cx="150" cy="50" r="12" fill="#fff" />
                    <circle cx="250" cy="50" r="12" fill="#fff" />
                    <circle cx="100" cy="150" r="12" fill="#fff" />
                    <circle cx="200" cy="150" r="12" fill="#fff" />
                </svg>
            </button>
            <button
                onClick={() => handleSwitch('es')}
                className={`w-6 h-6 rounded-full overflow-hidden transition-all ${currentLocale === 'es' ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                title="Español"
            >
                <svg viewBox="0 0 640 480" className="w-full h-full object-cover">
                    <path fill="#006341" d="M0 0h213.3v480H0z" />
                    <path fill="#fff" d="M213.3 0h213.4v480H213.3z" />
                    <path fill="#ce1126" d="M426.7 0h213.3v480H426.7z" />
                    {/* Simplified emblem */}
                    <circle cx="320" cy="240" r="40" fill="#a05e2c" />
                </svg>
            </button>
        </div>
    )
}

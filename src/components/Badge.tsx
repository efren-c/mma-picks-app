'use client';

import { useState } from 'react';

import { Trophy, Medal, Star, Target, Dog } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeProps {
    name: string;
    icon: string;
    description: string;
    size?: number;
}

export function Badge({ name, icon, description, size = 16 }: BadgeProps) {
    const [open, setOpen] = useState(false);

    const getIcon = () => {
        switch (icon) {
            case 'Trophy': return <Trophy size={size} className="text-yellow-500" />;
            case 'Medal': return <Medal size={size} className="text-blue-500" />;
            case 'Star': return <Star size={size} className="text-purple-500" />;
            case 'Target': return <Target size={size} className="text-red-500" />;
            case 'Dog': return <Dog size={size} className="text-orange-500" />;
            default: return <Medal size={size} className="text-gray-500" />;
        }
    };

    return (
        <TooltipProvider>
            <Tooltip open={open} onOpenChange={setOpen}>
                <TooltipTrigger asChild>
                    <div
                        className="cursor-help p-1 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        onClick={() => setOpen(!open)}
                        onMouseEnter={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                    >
                        {getIcon()}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{name}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

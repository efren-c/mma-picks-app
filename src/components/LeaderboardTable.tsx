'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/Badge";

interface LeaderboardUser {
    id: string;
    username: string;
    points: number;
    rank: number;
    badges: {
        badge: {
            name: string;
            icon: string;
            description: string;
        };
    }[];
}

interface LeaderboardTableProps {
    users: LeaderboardUser[];
    currentUserId?: string;
}

export function LeaderboardTable({ users, currentUserId, dict }: LeaderboardTableProps & { dict: any }) {
    return (
        <div className="rounded-xl border border-slate-800 overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-950/50">
                    <TableRow className="hover:bg-transparent border-slate-800">
                        <TableHead className="w-[80px] text-slate-400">{dict.leaderboard.rank}</TableHead>
                        <TableHead className="text-slate-400">{dict.leaderboard.user}</TableHead>
                        <TableHead className="text-slate-400">{dict.leaderboard.points}</TableHead>
                        <TableHead className="text-right text-slate-400">{dict.leaderboard.badges}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const isCurrentUser = user.id === currentUserId;
                        return (
                            <TableRow
                                key={user.id}
                                className={`
                                    border-slate-800 transition-colors
                                    ${isCurrentUser
                                        ? 'bg-purple-500/10 hover:bg-purple-500/20 border-l-2 border-l-purple-500'
                                        : 'hover:bg-slate-800/50'
                                    }
                                `}
                            >
                                <TableCell className="font-medium text-slate-300">
                                    <div className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold
                                        ${user.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                            user.rank === 2 ? 'bg-slate-400/20 text-slate-400' :
                                                user.rank === 3 ? 'bg-orange-500/20 text-orange-500' :
                                                    'bg-slate-800 text-slate-500'}
                                    `}>
                                        {user.rank}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-medium ${isCurrentUser ? 'text-purple-400' : 'text-slate-200'}`}>
                                            {user.username}
                                        </span>
                                        {isCurrentUser && (
                                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                                                {dict.leaderboard.you}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-300 font-bold">{user.points}</TableCell>
                                <TableCell className="text-right flex justify-end gap-1">
                                    {user.badges.slice(0, 3).map((ub, i) => (
                                        <Badge key={i} name={ub.badge.name} icon={ub.badge.icon} description={ub.badge.description} />
                                    ))}
                                    {user.badges.length > 3 && (
                                        <span className="text-xs text-slate-500 self-center">+{user.badges.length - 3}</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

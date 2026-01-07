'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  testTitle: string;
  testCompany: string | null;
  testTopic: string | null;
  score: number;
  total: number;
  percentage: number;
  completedAt: Date;
}

interface LeaderboardProps {
  testId?: string;
  limit?: number;
}

export default function Leaderboard({ testId, limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (testId) params.append('testId', testId);

      const res = await fetch(`/api/leaderboard?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLeaderboard(data.leaderboard);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [testId, limit]);

  useEffect(() => {
    fetchLeaderboard();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">🏆 Champion</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">🥈 Runner-up</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">🥉 Third Place</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Leaderboard
            </CardTitle>
            <CardDescription>
              {testId ? 'Test Rankings' : 'Global Rankings'}
            </CardDescription>
          </div>
          {userRank && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-2xl font-bold text-primary">#{userRank}</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No results yet. Be the first to take a test!
          </p>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={`${entry.userId}-${entry.completedAt}`}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-950/20'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex-shrink-0 w-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.userImage || undefined} alt={entry.userName} />
                  <AvatarFallback>
                    {entry.userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{entry.userName}</p>
                    {getRankBadge(entry.rank)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {entry.testCompany || entry.testTopic || entry.testTitle}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-primary">{entry.percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.score}/{entry.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

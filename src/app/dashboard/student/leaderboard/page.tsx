'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DUMMY_ACTIVITIES, DUMMY_USERS } from '@/lib/data';
import { useAuth } from '@/lib/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Star } from 'lucide-react';

export default function LeaderboardPage() {
  const { user } = useAuth();

  const studentPoints = DUMMY_USERS
    .filter(u => u.role === 'student')
    .map(student => {
        const points = DUMMY_ACTIVITIES
            .filter(act => act.studentId === student.uid && act.status === 'approved')
            .reduce((sum, act) => sum + act.points, 0);
        return {
            uid: student.uid,
            name: student.displayName,
            photoURL: student.photoURL,
            points: points,
        };
    })
    .sort((a,b) => b.points - a.points);
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Award className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-yellow-700" />;
    return <span className="text-sm font-medium">{rank}</span>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
       <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">See who is making the biggest impact.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Student Contributors</CardTitle>
          <CardDescription>Rankings are based on total points from verified activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentPoints.map((student, index) => (
                <TableRow key={student.uid} className={student.uid === user?.uid ? 'bg-accent/50' : ''}>
                  <TableCell>
                    <div className='flex items-center justify-center h-full w-[50px]'>
                      <RankIcon rank={index + 1} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.photoURL ?? ''} />
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">{student.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

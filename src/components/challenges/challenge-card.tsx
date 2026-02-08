import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    reward: string;
    progress: number;
    goal: number;
  };
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isCompleted = challenge.progress >= challenge.goal;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{challenge.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Trophy className="h-5 w-5" />
            <span>{challenge.reward}</span>
          </div>
        </div>
        <CardDescription>{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Progress value={challenge.progress} />
          <p className="text-xs text-muted-foreground text-right">{challenge.progress}% Complete</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={isCompleted}>
          {isCompleted ? 'Completed' : 'View Progress'}
        </Button>
      </CardFooter>
    </Card>
  );
}

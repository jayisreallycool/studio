import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Sword, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <Card className={cn(
      "flex flex-col transition-all duration-300 border-2",
      isCompleted ? "border-primary/50 bg-primary/5" : "border-transparent bg-card"
    )}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Sword className="h-4 w-4 text-accent" />
            <CardTitle className="text-lg font-black uppercase tracking-tight">{challenge.title}</CardTitle>
          </div>
          {isCompleted && <Sparkles className="h-5 w-5 text-primary animate-bounce" />}
        </div>
        <CardDescription className="text-xs font-medium leading-relaxed mt-2">{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reward</span>
            <span className="text-sm font-black text-primary flex items-center gap-1">
              <Trophy className="h-3 w-3" /> {challenge.reward}
            </span>
          </div>
          <Progress value={challenge.progress} className="h-2" />
          <p className="text-[10px] font-black text-muted-foreground text-right uppercase tracking-widest">{challenge.progress}% Synchronized</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className={cn(
            "w-full font-black uppercase tracking-widest text-xs",
            isCompleted ? "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30" : "shadow-lg shadow-primary/10"
          )} 
          disabled={isCompleted}
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? 'Mission Complete' : 'Accept Quest'}
        </Button>
      </CardFooter>
    </Card>
  );
}

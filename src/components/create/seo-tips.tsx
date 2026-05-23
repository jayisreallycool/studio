
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scroll, Sword } from 'lucide-react';

const tips = [
  "Choose a name that commands attention.",
  "Write deep lore (at least 50 words) to anchor the artifact.",
  "Assign attributes that resonate with the Arena meta.",
  "Visual scans (images) with clear descriptions increase Power Level.",
  "Legendary artifacts often link to rare loot drops.",
  "Engage with other Operators to boost your Karma.",
];

export function SeoTips() {
  return (
    <Card className="sticky top-24 border-accent/20 bg-accent/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase tracking-tighter italic font-black text-accent">
          <Scroll className="h-5 w-5" />
          The Forge Guide
        </CardTitle>
      </Header>
      <CardContent>
        <ul className="space-y-4">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3 group">
              <Sword className="h-4 w-4 text-primary mt-1 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm font-medium text-muted-foreground leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

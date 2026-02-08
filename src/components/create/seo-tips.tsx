import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, CheckCircle } from 'lucide-react';

const tips = [
  "Use your main keyword in the title.",
  "Include keywords naturally in the first 100 words.",
  "Write a compelling meta description.",
  "Use short paragraphs and sentences.",
  "Add relevant images with alt text.",
  "Link to other relevant posts (internal linking).",
  "Aim for a content length of at least 1000 words for competitive topics."
];

export function SeoTips() {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-accent" />
          SEO Optimization Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

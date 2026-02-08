import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PostsTableProps {
  data: {
    id: string;
    title: string;
    views: number;
    clicks: number;
    conversions: number;
    earnings: number;
  }[];
}

export function PostsTable({ data }: PostsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Posts</CardTitle>
        <CardDescription>Your best performing content at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* For medium screens and up */}
        <div className="hidden sm:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Post</TableHead>
                <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((post) => (
                <TableRow key={post.id}>
                    <TableCell className="font-medium truncate max-w-sm">{post.title}</TableCell>
                    <TableCell className="text-right font-mono">${post.earnings.toFixed(2)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        {/* For small screens */}
        <div className="sm:hidden space-y-3">
            {data.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                    <p className="font-medium truncate pr-4 text-sm">{post.title}</p>
                    <p className="font-mono text-sm text-right flex-shrink-0">${post.earnings.toFixed(2)}</p>
                </div>
            ))}
             {data.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No posts to display.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

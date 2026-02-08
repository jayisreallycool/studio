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
                <TableCell className="font-medium truncate max-w-48">{post.title}</TableCell>
                <TableCell className="text-right font-mono">${post.earnings.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

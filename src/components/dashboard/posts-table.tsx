import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Post } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface PostsTableProps {
  posts: Post[];
  loading?: boolean;
}

export function PostsTable({ posts, loading }: PostsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts Performance</CardTitle>
        <CardDescription>Metrics for your latest user-submitted content.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post Title</TableHead>
                    <TableHead className="text-right">SEO Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">{post.title}</TableCell>
                      <TableCell className="text-right">
                        {post.aiResult ? (
                          <Badge variant="outline" className="text-primary border-primary/20">
                            {Math.round(post.aiResult.relevanceScore * 100)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                        No posts created yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="sm:hidden space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                  <p className="font-medium truncate pr-4 text-sm">{post.title}</p>
                  {post.aiResult && (
                    <Badge variant="outline" className="text-primary text-[10px]">
                      {Math.round(post.aiResult.relevanceScore * 100)}%
                    </Badge>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No posts to display.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

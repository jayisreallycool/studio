import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Post } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Sword } from 'lucide-react';

interface PostsTableProps {
  posts: Post[];
  loading?: boolean;
}

export function PostsTable({ posts, loading }: PostsTableProps) {
  return (
    <Card className="comic-card bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
          <Sword className="h-4 w-4 text-primary" /> Artifact Appraisal Log
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground italic">Chronicle of your forged items and their Arena power rating.</CardDescription>
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
                  <TableRow className="border-black">
                    <TableHead className="text-[10px] font-black uppercase">Artifact Name</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase">Power Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="border-black hover:bg-white/5">
                      <TableCell className="font-bold italic truncate max-w-[200px] text-xs">{post.title}</TableCell>
                      <TableCell className="text-right">
                        {post.aiResult ? (
                          <Badge variant="outline" className="text-primary border-primary font-black italic">
                            {Math.round(post.aiResult.relevanceScore * 100)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[10px] uppercase">Scanning...</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground py-12">
                        <p className="text-[10px] font-black uppercase tracking-widest">The Forge is cold. No artifacts detected.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="sm:hidden space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-black/40 border-2 border-black">
                  <p className="font-bold italic truncate pr-4 text-xs uppercase">{post.title}</p>
                  {post.aiResult && (
                    <Badge variant="outline" className="text-primary border-primary text-[10px]">
                      {Math.round(post.aiResult.relevanceScore * 100)}%
                    </Badge>
                  )}
                </div>
              ))}
              {posts.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4 uppercase font-black">No artifacts chronicled.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

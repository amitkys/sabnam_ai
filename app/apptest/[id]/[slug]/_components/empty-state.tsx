import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  categoryName: string;
}

/**
 * Shown when a category node has neither child categories
 * nor any published test papers — i.e. it's a leaf with no content yet.
 */
export function EmptyState({ categoryName }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-muted-foreground py-12 text-center text-sm">
        No content available yet for <strong>{categoryName}</strong>.
      </CardContent>
    </Card>
  );
}

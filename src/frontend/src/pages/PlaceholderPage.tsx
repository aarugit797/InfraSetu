import { Layout } from "@/components/Layout";

interface PlaceholderPageProps {
  title: string;
  subtitle?: string;
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className="glass rounded-2xl p-12 text-center border border-dashed border-border/50">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-primary text-xl">🚧</span>
          </div>
          <p className="text-foreground font-medium">{title}</p>
          <p className="text-muted-foreground text-sm mt-1">
            This page is being built. Check back soon!
          </p>
        </div>
      </div>
    </Layout>
  );
}

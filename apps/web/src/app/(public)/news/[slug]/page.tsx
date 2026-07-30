import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/public/article-body";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { ShareLinks } from "@/components/public/share-links";
import { JsonLd } from "@/components/seo/json-ld";
import type { ApiNews } from "@/lib/api";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { serverFetch } from "@/lib/server-api";

type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  return serverFetch<ApiNews>(`/api/cms/news/${slug}/`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) {
    return buildMetadata({
      title: "Article not found",
      description: "The requested news article could not be found.",
      path: `/news/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${slug}`,
    type: "article",
    publishedTime: article.published_at || undefined,
    modifiedTime: article.updated_at || undefined,
  });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(slug, article.category);
  const body = article.body?.trim() || article.excerpt;

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.excerpt,
          path: `/news/${slug}`,
          datePublished: article.published_at,
          dateModified: article.updated_at,
        })}
      />
      <PageHero
        title={article.title}
        description={article.excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: article.title },
        ]}
        lastUpdated={article.published_at}
        lastUpdatedLabel="Published"
      />
      <Section>
        <article className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-ocean-700">
                {article.category}
              </span>
              {article.published_at
                ? ` · ${new Date(article.published_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : ""}
            </p>
            <ShareLinks title={article.title} path={`/news/${slug}`} />
          </div>
          <div className="mt-8">
            <ArticleBody content={body} />
          </div>
          <Link
            href="/news"
            className="mt-10 inline-flex text-sm font-semibold text-ocean-700 focus-ring"
          >
            Back to news
          </Link>
        </article>

        {related.length > 0 ? (
          <aside className="mx-auto mt-12 max-w-3xl">
            <h2 className="font-display text-2xl text-navy-950">Related news</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="surface-card block h-full p-4 transition hover:border-ocean-500/35 focus-ring"
                  >
                    <span className="text-xs font-semibold text-ocean-700">
                      {item.category}
                    </span>
                    <span className="mt-2 block font-display text-base text-navy-950">
                      {item.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </Section>
    </>
  );
}

async function getRelatedArticles(slug: string, category: string) {
  type ListResponse = { results?: ApiNews[] } | ApiNews[];
  const payload = await serverFetch<ListResponse>(
    "/api/cms/news/?page_size=20&status=published",
  );
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : [];
  return items
    .filter((item) => item.slug !== slug)
    .sort(
      (a, b) =>
        Number(b.category === category) - Number(a.category === category),
    )
    .slice(0, 3);
}

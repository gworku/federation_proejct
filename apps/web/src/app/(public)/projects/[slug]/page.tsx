import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/page-hero";
import { Section } from "@/components/public/section";
import { ShareLinks } from "@/components/public/share-links";
import { Badge, statusTone } from "@/components/ui/badge";
import type { ApiProject } from "@/lib/api";
import { buildMetadata } from "@/lib/seo";
import { serverFetch } from "@/lib/server-api";

type Props = { params: Promise<{ slug: string }> };

async function getProject(slug: string) {
  return serverFetch<ApiProject>(`/api/projects/${slug}/`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    return buildMetadata({
      title: "Project not found",
      description: "The requested project could not be found.",
      path: `/projects/${slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: project.title,
    description: project.description,
    path: `/projects/${slug}`,
  });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const milestones = "milestones" in project ? project.milestones ?? [] : [];

  return (
    <>
      <PageHero
        title={project.title}
        description={project.description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={statusTone(project.status)}>{project.status}</Badge>
              <span className="text-sm text-slate-600">{project.category}</span>
            </div>
            <ShareLinks title={project.title} path={`/projects/${slug}`} />
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm text-slate-600">
              <span>Progress</span>
              <span className="font-semibold text-navy-950">
                {project.progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sky-200">
              <div
                className="h-full rounded-full bg-ocean-600"
                style={{
                  width: `${Math.min(100, Math.max(0, project.progress))}%`,
                }}
              />
            </div>
          </div>

          <p className="mt-8 text-base leading-relaxed text-slate-700">
            {project.description}
          </p>

          <dl className="mt-8 grid gap-5 border-y border-border py-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Location
              </dt>
              <dd className="mt-1 text-navy-950">{project.location}</dd>
            </div>
            {"funding_partner" in project && project.funding_partner ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Funding partner
                </dt>
                <dd className="mt-1 text-navy-950">{project.funding_partner}</dd>
              </div>
            ) : null}
            {"contact_person" in project && project.contact_person ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Contact
                </dt>
                <dd className="mt-1 text-navy-950">{project.contact_person}</dd>
              </div>
            ) : null}
            {"implementing_partners" in project &&
            project.implementing_partners ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Implementing partners
                </dt>
                <dd className="mt-1 text-navy-950">
                  {project.implementing_partners}
                </dd>
              </div>
            ) : null}
          </dl>

          {"objectives" in project && project.objectives ? (
            <div className="mt-8">
              <h2 className="font-display text-xl text-navy-950">Objectives</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {project.objectives}
              </p>
            </div>
          ) : null}

          {milestones.length > 0 ? (
            <div className="mt-10">
              <h2 className="font-display text-xl text-navy-950">Milestones</h2>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {milestones.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <span className="font-medium text-navy-950">{item.title}</span>
                    <span className="text-slate-600">
                      {item.due_date
                        ? new Date(item.due_date).toLocaleDateString("en-GB")
                        : "TBD"}{" "}
                      · {item.status.replaceAll("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Link
            href="/projects"
            className="mt-10 inline-flex text-sm font-semibold text-ocean-700 focus-ring"
          >
            Back to projects
          </Link>
        </div>
      </Section>
    </>
  );
}

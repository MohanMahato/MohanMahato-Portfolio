import { useQuery } from '@tanstack/react-query'
import SEO from '@/components/common/SEO'
import SectionHeading from '@/components/common/SectionHeading'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { fetchPortfolio } from '@/services/publicPortfolioService'

export default function ProjectsPage() {
  const { data, isPending } = useQuery({ queryKey: ['public-portfolio'], queryFn: fetchPortfolio, retry: false })
  const projects = data?.projects || []
  return <section className="container-page py-16 sm:py-20">
    <SEO title="Projects" description="Published projects by Mohan Mahato." />
    <SectionHeading eyebrow="Selected work" title="Projects" subtitle="A collection of projects and practical work." />
    {isPending ? <Card>Loading projects…</Card> : projects.length === 0 ? <Card><h2 className="text-xl font-semibold">Projects will appear here</h2><p className="mt-2 text-sm text-muted">Published projects added from the Admin Dashboard will appear on this page.</p></Card> :
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.map((project) => <Card key={project.id} className="flex h-full flex-col overflow-hidden p-0">{project.cover_image_path && <img src={project.cover_image_path} alt="" loading="lazy" className="h-48 w-full object-cover" />}<div className="flex flex-1 flex-col p-5"><Badge tone="accent">{project.status?.replaceAll('_', ' ') || 'Project'}</Badge><h2 className="mt-3 text-xl font-semibold">{project.title}</h2><p className="mt-2 flex-1 text-sm leading-6 text-muted">{project.short_description || project.long_description}</p>{project.tech_stack?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{project.tech_stack.map((tag) => <span key={tag} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">{tag}</span>)}</div>}<div className="mt-5 flex gap-4 text-sm">{project.github_url && <a className="text-accent hover:underline" href={project.github_url} target="_blank" rel="noreferrer">GitHub ↗</a>}{project.live_url && <a className="text-accent hover:underline" href={project.live_url} target="_blank" rel="noreferrer">Live demo ↗</a>}</div></div></Card>)}</div>}
  </section>
}

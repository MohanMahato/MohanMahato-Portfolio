import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUpRight, Mail, MapPin, ExternalLink, GraduationCap, Code2, Sparkles } from 'lucide-react'
import SEO from '@/components/common/SEO'
import SectionHeading from '@/components/common/SectionHeading'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import { SITE } from '@/config/site'
import { fetchPortfolio } from '@/services/publicPortfolioService'


function Section({ id, eyebrow, title, children }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.section
      id={id}
      className="container-page scroll-mt-24 py-14 sm:py-20"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: 'easeOut',
      }}
    >
      <SectionHeading eyebrow={eyebrow} title={title} />
      {children}
    </motion.section>
  )
}

function External({ href, children }) {
  if (!href) return null
  return <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">{children}<ExternalLink className="h-3.5 w-3.5" /></a>
}
function ProjectCard({ project }) {
  return <Card className="group flex h-full flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-glow">
    {project.cover_image_path && <img src={project.cover_image_path} alt="" loading="lazy" className="h-44 w-full object-cover" />}
    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap items-center gap-2"><Badge tone="accent">{project.status?.replaceAll('_', ' ') || 'Project'}</Badge>{project.is_featured && <Badge>Featured</Badge>}</div>
      <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">{project.short_description || project.long_description}</p>
      {project.tech_stack?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{project.tech_stack.map((tag) => <span key={tag} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">{tag}</span>)}</div>}
      <div className="mt-5 flex flex-wrap gap-4"><External href={project.github_url}>GitHub</External><External href={project.live_url}>Live demo</External></div>
    </div>
  </Card>
}
export default function HomePage() {
  const { data, isPending } = useQuery({ queryKey: ['public-portfolio'], queryFn: fetchPortfolio, retry: false })
  const profile = data?.profile
  const name = profile?.full_name || SITE.name
  const headline = profile?.headline || 'Computer Science & Engineering Student'
  const intro = profile?.intro || 'I am building my skills through learning, practical work and projects. Explore my portfolio to see my journey.'
  const links = data?.links || []
  return <>
    <SEO title={profile?.full_name || SITE.name} description={profile?.about || SITE.description} />
    <section className="relative isolate overflow-hidden border-b border-border">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgb(var(--accent)/.18),transparent_42%),radial-gradient(ellipse_at_90%_80%,rgb(var(--accent-2)/.12),transparent_38%)]" />
      <div className="container-page grid min-h-[76vh] items-center gap-12 py-20 lg:grid-cols-[1.3fr_.7fr] lg:py-28">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }}>
          <Badge tone="accent"><Sparkles className="mr-1 inline h-3 w-3" /> Student portfolio</Badge>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[.2em] text-muted">Hello, I am</p>
          <h1 className="mt-2 max-w-3xl text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl"><span className="gradient-text">{name}</span></h1>
          <h2 className="mt-5 text-xl font-semibold sm:text-2xl">{headline}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted sm:text-lg">{intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as="a" href="#projects">Explore projects <ArrowDown className="ml-1 h-4 w-4" /></Button>
            {profile?.resume_path && <Button as="a" href={profile.resume_path} target="_blank" rel="noreferrer" variant="secondary">View resume <ArrowUpRight className="ml-1 h-4 w-4" /></Button>}
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-muted">
            {profile?.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{profile.location}</span>}
            {profile?.contact_email && <a className="inline-flex items-center gap-2 hover:text-fg" href={`mailto:${profile.contact_email}`}><Mail className="h-4 w-4" />{profile.contact_email}</a>}
          </div>
          {links.length > 0 && <div className="mt-6 flex flex-wrap gap-4">{links.map((link) => <External key={link.id} href={link.url}>{link.label || link.platform}</External>)}</div>}
          {(profile?.cgpa !== null && profile?.cgpa !== undefined || profile?.current_semester) && <div className="mt-7 flex flex-wrap gap-3">{profile?.cgpa !== null && profile?.cgpa !== undefined && <div className="rounded-xl border border-border bg-surface/80 px-4 py-3"><p className="text-xs text-muted">CGPA</p><p className="text-xl font-bold">{Number(profile.cgpa).toFixed(2)}</p></div>}{profile?.current_semester && <div className="rounded-xl border border-border bg-surface/80 px-4 py-3"><p className="text-xs text-muted">Current semester</p><p className="text-xl font-bold">{profile.current_semester}</p></div>}</div>}
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .6, delay: .1 }} className="mx-auto w-full max-w-sm">
          <div className="relative rounded-[2rem] border border-border bg-surface/80 p-4 shadow-2xl backdrop-blur-xl">
            {profile?.avatar_path ? <img src={profile.avatar_path} alt={name} className="aspect-[4/5] w-full rounded-[1.5rem] object-cover" /> : <div className="flex aspect-[4/5] items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-accent/20 via-surface-2 to-accent-2/20"><span className="font-display text-8xl font-bold gradient-text">{name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span></div>}
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-border bg-surface px-5 py-4 shadow-xl"><p className="text-xs text-muted">Currently studying</p><p className="mt-1 font-semibold">{profile?.programme || 'Computer Science & Engineering'}</p><p className="text-xs text-muted">{profile?.university || 'University'}</p></div>
          </div>
        </motion.div>
      </div>
    </section>
    {isPending && <div className="container-page grid gap-4 py-12 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>}
    {profile?.about && <Section id="about" eyebrow="A little about me" title="About"><Card><p className="whitespace-pre-line leading-8 text-muted">{profile.about}</p></Card></Section>}
    
{(data?.skills?.length > 0) && (
  <Section
    id="skills"
    eyebrow="What I work with"
    title="Skills"
  >
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.skills.map((skill, index) => (
        <motion.div
          key={skill.id}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.45,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
          whileHover={{ y: -6 }}
        >
          <Card className="h-full transition-shadow duration-300 hover:shadow-glow">
            <p className="text-xs uppercase tracking-wider text-muted">
              {skill.category}
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              {skill.name}
            </h3>

            {skill.proficiency && (
              <p className="mt-1 text-sm capitalize text-muted">
                {skill.proficiency}
              </p>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  </Section>
)}

    
{(data?.projects?.length > 0) && (
  <Section
    id="projects"
    eyebrow="Selected work"
    title="Projects"
  >
    <div className="grid gap-5 md:grid-cols-2">
      {data.projects.slice(0, 4).map((project, index) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.5,
            delay: index * 0.12,
            ease: 'easeOut',
          }}
          whileHover={{ y: -7, scale: 1.01 }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>

    <div className="mt-6">
      <Button as="a" href="/projects" variant="secondary">
        View all projects
      </Button>
    </div>
  </Section>
)}

    {(data?.academics?.length > 0) && <Section id="academics" eyebrow="Education" title="Academic journey"><div className="grid gap-4 md:grid-cols-2">{data.academics.map((item) => <Card key={item.id}><div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-accent" /><Badge>{`Semester ${item.semester_number}`}</Badge><span className="text-xs text-muted">{item.academic_year}</span></div><h3 className="mt-3 text-lg font-semibold">{item.title || `Semester ${item.semester_number}`}</h3><div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">{item.sgpa !== null && item.sgpa !== undefined && <span>SGPA <strong className="text-fg">{Number(item.sgpa).toFixed(2)}</strong></span>}{item.credits_earned !== null && item.credits_earned !== undefined && <span>Credits {item.credits_earned}</span>}</div></Card>)}</div></Section>}
    
    {(data?.education?.length > 0) && <Section id="education" eyebrow="My background" title="Schooling & Intermediate">
      <div className="grid gap-4 md:grid-cols-2">
        {data.education.map((item) => <Card key={item.id}>
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-accent" />
            <Badge>{item.level === 'schooling' ? 'Schooling' : 'Intermediate'}</Badge>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{item.institution}</h3>
          {item.board && <p className="mt-2 text-sm text-muted">{item.board}</p>}
          {item.location && <p className="mt-1 text-sm text-muted">{item.location}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
            {item.passing_year && <span>Passing Year <strong className="text-fg">{item.passing_year}</strong></span>}
            {item.percentage !== null && item.percentage !== undefined && <span>Percentage <strong className="text-fg">{item.percentage}%</strong></span>}
          </div>
        </Card>)}
      </div>
    </Section>}

{(data?.certifications?.length > 0 ||
  data?.internships?.length > 0 ||
  data?.hackathons?.length > 0 ||
  data?.achievements?.length > 0) && (
  <Section
    id="experience"
    eyebrow="Growth & experience"
    title="Milestones"
  >
    <div className="grid gap-4 md:grid-cols-2">
      {[
        ...(data.certifications || []).map((x) => ({
          ...x,
          heading: x.title,
          sub: x.issuer,
          type: 'Certification',
        })),
        ...(data.internships || []).map((x) => ({
          ...x,
          heading: x.role,
          sub: x.company,
          type: 'Internship',
        })),
        ...(data.hackathons || []).map((x) => ({
          ...x,
          heading: x.name,
          sub: x.organizer,
          type: 'Hackathon',
        })),
        ...(data.achievements || []).map((x) => ({
          ...x,
          heading: x.title,
          sub: x.organization,
          type: 'Achievement',
        })),
      ].map((item, index) => (
        <motion.div
          key={`${item.type}-${item.id}`}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: 'easeOut',
          }}
          whileHover={{ y: -6 }}
        >
          <Card className="h-full transition-shadow duration-300 hover:shadow-glow">
            <p className="text-xs uppercase tracking-wider text-muted">
              {item.type}
            </p>

            <h3 className="mt-2 font-semibold">
              {item.heading}
            </h3>

            {item.sub && (
              <p className="mt-1 text-sm text-muted">
                {item.sub}
              </p>
            )}

            {item.description && (
              <p className="mt-3 text-sm leading-6 text-muted">
                {item.description}
              </p>
            )}

            {item.credential_url && (
              <div className="mt-3">
                <External href={item.credential_url}>
                  View credential
                </External>
              </div>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  </Section>
)}

    {(data?.codingProfiles?.length > 0 || data?.learning?.length > 0 || data?.research?.length > 0) && <Section id="more" eyebrow="Beyond the classroom" title="Learning & building"><div className="grid gap-4 md:grid-cols-2">{(data.codingProfiles || []).map((item) => <Card key={item.id}><Code2 className="h-5 w-5 text-accent" /><h3 className="mt-2 font-semibold">{item.platform}</h3><p className="text-sm text-muted">{item.username} {item.stats_note}</p><div className="mt-3"><External href={item.profile_url}>View profile</External></div></Card>)}{(data.learning || []).map((item) => <Card key={item.id}><p className="text-xs uppercase tracking-wider text-muted">Learning timeline</p><h3 className="mt-2 font-semibold">{item.title}</h3><p className="text-sm text-muted">{item.provider} · {item.status?.replaceAll('_', ' ')}</p>{item.notes && <p className="mt-2 text-sm text-muted">{item.notes}</p>}</Card>)}{(data.research || []).map((item) => <Card key={item.id}><p className="text-xs uppercase tracking-wider text-muted">Research · {item.kind}</p><h3 className="mt-2 font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted">{item.description}</p><External href={item.link_url}>Read more</External></Card>)}</div></Section>}
    
<motion.section
  id="contact"
  className="container-page pb-20 pt-8"
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
>
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="overflow-hidden bg-gradient-to-br from-accent/15 via-surface to-accent-2/15 p-8 sm:p-12 transition-shadow duration-300 hover:shadow-glow">
      <div className="max-w-2xl">
        <Badge tone="accent">Contact</Badge>

        <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
          Let’s connect and build something meaningful.
        </h2>

        <p className="mt-3 text-muted">
          For collaborations, learning opportunities or project discussions,
          feel free to reach out.
        </p>

        {profile?.contact_email && (
          <div className="mt-6">
            <Button
              as="a"
              href={`mailto:${profile.contact_email}`}
            >
              <Mail className="mr-2 h-4 w-4" />
              Email me
            </Button>
          </div>
        )}
      </div>
    </Card>
  </motion.div>
</motion.section>

  </>
}

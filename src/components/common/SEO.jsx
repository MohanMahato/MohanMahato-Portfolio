import { SITE } from '@/config/site'

// React 19 automatically moves <title> and <meta> into the page <head>.
export default function SEO({ title, description = SITE.description, noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.title
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </>
  )
}

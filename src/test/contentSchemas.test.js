import { describe, it, expect } from 'vitest'
import { CONTENT_SCHEMAS } from '@/config/contentSchemas'

describe('content manager schema',()=>{
 it('maps the core database tables',()=>{ expect(Object.keys(CONTENT_SCHEMAS)).toEqual(expect.arrayContaining(['profiles','academic_records','skills','projects','certifications','website_settings'])) })
 it('does not expose sensitive marksheet records as a public manager',()=>{ expect(CONTENT_SCHEMAS).not.toHaveProperty('academic_marksheets') })
 it('marks singleton tables correctly',()=>{ expect(CONTENT_SCHEMAS.profiles.singleton).toBe(true); expect(CONTENT_SCHEMAS.website_settings.singleton).toBe(true) })
})

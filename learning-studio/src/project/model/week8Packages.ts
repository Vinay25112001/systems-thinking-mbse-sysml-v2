// The packages a team may choose for a Week 1 ID in the Week 8 lab tool (M7): the package names of the course working
// mapping (MAPPING_KINDS, the single source), without the entries that are not a package ("owned by what it measures")
// or that qualify one ("Physical (external interfaces in Context)" is the Physical package). Shared by the tool and the
// course server, which refuses any other value.
import { MAPPING_KINDS } from '../../content/lectures/week08/labBrief'

export const WEEK8_PACKAGES: string[] = [...new Set(MAPPING_KINDS.map((k) => k.pkg).filter((p) => /^[A-Z][A-Za-z]*$/.test(p)))]
export const isWeek8Package = (p: string) => WEEK8_PACKAGES.includes(p)

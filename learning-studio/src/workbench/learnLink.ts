// When the workbench is the Practice stage of a book-style week, a mission step's "Read more" points first to the Learn
// section that teaches it (WEEK1_LEARNING_DESIGN §4), with the Reference drawer as the fallback. Null elsewhere.
import { createContext, useContext } from 'react'

export type LearnLink = { href: string; label: string }
export const LearnLinkContext = createContext<((block: string) => LearnLink | null) | null>(null)
export const useLearnLink = () => useContext(LearnLinkContext)

// Wording hook for labels drawn inside a shared figure (review M4A F1, F3, F10). The same SVG serves the lecture slides,
// the .pptx and the Week 1 textbook; the textbook provides a function that maps a course label to its student wording
// ("Goal" → "Objective", "(proposed)" → "(teaching assumption)", "taught in Session 2" → the chapters). Everywhere else
// the identity applies, so the slides and the decks are unchanged. A returned "\n" splits a label onto two lines.
import { createContext, useContext } from 'react'

export const FigureWording = createContext<(label: string) => string>((label) => label)
export const useFigureWording = () => useContext(FigureWording)

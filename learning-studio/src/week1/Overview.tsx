// Week 1 Overview (#/week/1; spec §c, blocks 1–10, OV-01/OV-02), M4 part A. Concise: one screen on desktop. No lecture
// cards, no .pptx downloads, no internal codes (no L-codes, RB-codes, slide numbers, "proposed", "pending faculty"),
// only the approved objectives B1.1–B1.5 (in plain words). Time is computed from data, never hard-coded (overviewTime). Earlier week page (Home.tsx) is kept in source, unrouted.
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import { WEEKS } from '../content/course'
import { LAB_MINIMUMS as MIN } from '../content/lectures/week01/labBrief'
import { OPENER } from '../content/learn/week01'
import { PRACTICE_MINUTES } from './practice/tasks'
import { LESSON_WPM, REQUIRED_READINGS, READING_RATE_PAGES_PER_HOUR, REQUIRED_PAGES, WORKLOAD, WORKLOAD_ROWS } from '../content/week1Path'
import week01 from '../content/weeks/week01'
import { Link } from '../lib/router'
import { learnWords } from './learn/words'
import { loadProgress } from './learn/progress'
import { READING_PLAN, displayNumber, sectionById } from './learn/textbook'
import { studentCitation, sourcesHref } from './learn/studentText'
import { learnPath, WEEK1_PATHS } from './route'

const W1 = WEEKS[0]
const fmt = (h: number) => `${(Math.round(h * 10) / 10).toFixed(1)} h`

/** The Week 1 time model (review M4A F2). One source: the stated Week 1 workload rows (weeks/week01.ts, checked against
 *  the content by week1Path.ts WORKLOAD and its test), with the Learn row computed from the textbook as this edition
 *  shows it. Every required row is counted; Guided Practice is optional (faculty-default decision 3) and listed apart,
 *  never added to the total. Nothing is cut to meet the budget (8.1 h accepted by faculty, DECISION_LOG A26). */
export function overviewTime() {
  const words = learnWords()
  const rows = [
    { id: 'class', what: 'Class: two sessions of 75 minutes', hours: WORKLOAD.classHours },
    { id: 'learn', what: `Learn: about ${words.toLocaleString('en-US')} words at ${LESSON_WPM} words a minute`, hours: words / LESSON_WPM / 60 },
    { id: 'readings', what: `Required readings: ${REQUIRED_PAGES} pages at about ${READING_RATE_PAGES_PER_HOUR} pages an hour`, hours: REQUIRED_PAGES / READING_RATE_PAGES_PER_HOUR },
    { id: 'candidate', what: 'A candidate enterprise to bring to Session 2 (each team member)', hours: WORKLOAD_ROWS.candidate.hours },
    { id: 'team', what: 'Your share of the team’s work on the Week 1 Team Record', hours: WORKLOAD.teamHours },
    { id: 'quiz', what: 'Readiness quiz', hours: WORKLOAD.quizHours },
    { id: 'grad', what: 'Graduate needs review (individual): revise four of the team’s needs', hours: WORKLOAD_ROWS.grad.hours },
    { id: 'log', what: 'Time log', hours: WORKLOAD_ROWS.log.hours },
  ]
  // week1-m5: the Guided Practice minutes come from its six tasks (spec §e.2, ≈ 96 min)
  const optional = [{ id: 'practice', what: 'Guided Practice on AeroLink (optional, not counted in the total)', hours: PRACTICE_MINUTES / 60 }]
  const total = rows.reduce((a, r) => a + r.hours, 0)
  return { rows, optional, total, words, budget: WORKLOAD.budget, over: Math.round((total - WORKLOAD.budget) * 10) / 10 }
}

/** Faculty-facing budget note (not rendered): the computed required total was 8.1 h against A21's 8.0 h target, and
 *  faculty accepted it for Week 1 (DECISION_LOG A26, 2026-10-21; within rounding of the 8 h estimate, nothing removed).
 *  Students see only the honest computed total. week1.test.tsx fails if the computed total moves away from the accepted
 *  figure, so a content change that grows the week reopens the decision instead of passing silently. */
export const WEEK1_WORKLOAD_ACCEPTED = { hours: 8.1, budget: 8.0, decision: 'DECISION_LOG A26', date: '2026-10-21', note: '8.1 h, accepted by faculty 2026-10-21 (DECISION_LOG A26)' } as const

export default function Overview() {
  const time = useMemo(overviewTime, [])
  const last = loadProgress().last
  const lastSec = last ? sectionById(last) : undefined
  const objectives = OPENER.canDo.filter((o) => W1.objectives.some((x) => x.id === o.id))
  return (
    <div className="ov" data-testid="week1-overview">
      <p className="ov-kicker">Week 1 · Overview</p>
      <h1 className="ov-title">Week 1 · Team formation, needs and identifying stakeholders</h1>
      <p className="ov-lede" data-testid="ov-why">
        You form a team and choose an enterprise. You find who has a stake in it and what they need. Every identifier you create now is a key you will use in Week 2 and in your Week 8 model.
      </p>

      <div className="ov-grid">
        <section aria-labelledby="ov-obj" data-testid="ov-objectives">
          <h2 id="ov-obj">By the end of the week you will be able to</h2>
          <ul>
            {objectives.map((o) => (
              <li key={o.id}>{o.text.text}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="ov-create" data-testid="ov-create">
          <h2 id="ov-create">Your team will create</h2>
          <ul>
            <li>A team charter</li>
            <li>An enterprise proposal, approved by the instructor</li>
            <li>A context with at least {MIN.context} external systems</li>
            <li>
              A stakeholder register: at least {MIN.stakeholders} stakeholders in at least {MIN.roleGroups} role groups, with at least one approving authority
            </li>
            <li>
              Relationships between stakeholders: at least {MIN.relationships}, at least {MIN.conflicts} of them a conflict
            </li>
            <li>At least {MIN.needs} initial needs</li>
          </ul>
          <p>
            <Link to={WEEK1_PATHS.project}>My Project / Lab</Link>
          </p>
        </section>
      </div>

      <section aria-labelledby="ov-practice">
        <h2 id="ov-practice">You will practice</h2>
        <p>
          On AeroLink, the instructor’s example: boundary, stakeholders, concerns and relationships, needs and objectives. <Link to={WEEK1_PATHS.practice}>Guided Practice</Link>
        </p>
      </section>

      <section aria-labelledby="ov-later" data-testid="ov-later">
        <h2 id="ov-later">How this is used later</h2>
        <p>Week 2 extends your needs into a concept of operations and requirements, traced to NEED IDs.</p>
        <p>
          Week 8 imports your stakeholders, concerns, needs and mission into your SysML v2 model with the same IDs. <Link to={learnPath('ch10', 'ch10-05')}>Learn {displayNumber('ch10-05')}: toward Week 2 and Week 8</Link>
        </p>
      </section>

      <div className="ov-grid">
        <section aria-labelledby="ov-time" data-testid="ov-time">
          <h2 id="ov-time">Time</h2>
          <table className="ov-table">
            <caption className="sr-only">Week 1 required time per student, computed from the content</caption>
            <tbody>
              {time.rows.map((r) => (
                <tr key={r.id} data-testid={`ov-time-${r.id}`}>
                  <th scope="row">{r.what}</th>
                  <td>{fmt(r.hours)}</td>
                </tr>
              ))}
              <tr className="ov-total">
                <th scope="row">Total required</th>
                <td data-testid="ov-time-total">{fmt(time.total)}</td>
              </tr>
            </tbody>
          </table>
          <table className="ov-table is-optional" data-testid="ov-time-optional">
            <caption className="sr-only">Optional practice, not counted in the total</caption>
            <tbody>
              {time.optional.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.what}</th>
                  <td>{fmt(r.hours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section aria-labelledby="ov-read" data-testid="ov-readings">
          <h2 id="ov-read">Readings</h2>
          <ul>
            {REQUIRED_READINGS.map((r) => (
              <li key={r.citation.reading}>
                <Link to={sourcesHref(r.citation)}>{studentCitation(r.citation)}</Link>
              </li>
            ))}
          </ul>
          <p data-testid="ov-reading-plan">
            <strong>Reading plan.</strong> {READING_PLAN}
          </p>
          <p>
            <strong>Due.</strong> {week01.assignment.due}.
          </p>
        </section>
      </div>

      <div className="ov-start">
        <Link to={lastSec ? learnPath(lastSec.chapter.id, lastSec.section.id) : learnPath('ch01')} className="hp-btn" data-testid="ov-start">
          {lastSec ? `Continue: ${lastSec.section.title}` : 'Start Learn: chapter 1'} <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  )
}

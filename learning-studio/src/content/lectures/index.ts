// Registered lectures. One entry per (week, session); scripts/build-lectures.mjs exports every entry, the viewer and
// reader look them up here. The pipeline FIXTURE (src/content/lectures/fixture/demo.ts) is no longer registered; it is
// kept for the validator tests only (docs/lectures/PIPELINE.md).
import type { Lecture, LessonSection } from './types'
import { WEEK01_SESSION1 } from './week01/session1'
import { WEEK1_SESSION2 } from './week01/session2'
import { WEEK2_SESSION1 } from './week02/session1'
import { WEEK2_SESSION2 } from './week02/session2'
// --- week03 ---
import { WEEK3_SESSION1 } from './week03/session1'
import { WEEK3_SESSION2 } from './week03/session2'
// --- end week03 ---
// --- week04 ---
import { WEEK4_SESSION1 } from './week04/session1'
import { WEEK4_SESSION2 } from './week04/session2'
// --- end week04 ---
// --- week05 ---
import { WEEK5_SESSION1 } from './week05/session1'
import { WEEK5_SESSION2 } from './week05/session2'
// --- end week05 ---
// --- week06 ---
import { WEEK6_SESSION1 } from './week06/session1'
import { WEEK6_SESSION2 } from './week06/session2'
// --- end week06 ---
// --- week07 ---
import { WEEK7_SESSION1 } from './week07/session1'
import { WEEK7_SESSION2 } from './week07/session2'
// --- end week07 ---
// --- week08 ---
import { WEEK8_SESSION1 } from './week08/session1'
import { WEEK8_SESSION2 } from './week08/session2'
// --- end week08 ---
// --- week09 ---
import { WEEK9_SESSION1 } from './week09/session1'
import { WEEK9_SESSION2 } from './week09/session2'
// --- end week09 ---
// --- week10 ---
import { WEEK10_SESSION1 } from './week10/session1'
import { WEEK10_SESSION2 } from './week10/session2'
// --- end week10 ---
// --- week11 ---
import { WEEK11_SESSION1 } from './week11/session1'
import { WEEK11_SESSION2 } from './week11/session2'
// --- end week11 ---

export const LECTURES: Lecture[] = [WEEK01_SESSION1, WEEK1_SESSION2, WEEK2_SESSION1, WEEK2_SESSION2, WEEK3_SESSION1, WEEK3_SESSION2, WEEK4_SESSION1, WEEK4_SESSION2, WEEK5_SESSION1, WEEK5_SESSION2, WEEK6_SESSION1, WEEK6_SESSION2, WEEK7_SESSION1, WEEK7_SESSION2, WEEK8_SESSION1, WEEK8_SESSION2, WEEK9_SESSION1, WEEK9_SESSION2, WEEK10_SESSION1, WEEK10_SESSION2, WEEK11_SESSION1, WEEK11_SESSION2]


export const getLecture = (week: number, session: number): Lecture | undefined => LECTURES.find((l) => l.week === week && l.session === session)

export const lecturesOfWeek = (week: number): Lecture[] => LECTURES.filter((l) => l.week === week).sort((a, b) => a.session - b.session)

export const hasLecture = (week: number) => LECTURES.some((l) => l.week === week)

/** The week's student lesson: both sessions' lesson sections in session order, each tagged with its lecture. */
export const weekLesson = (week: number): { lecture: Lecture; section: LessonSection }[] => lecturesOfWeek(week).flatMap((lecture) => lecture.studentLesson.map((section) => ({ lecture, section })))

export * from './types'

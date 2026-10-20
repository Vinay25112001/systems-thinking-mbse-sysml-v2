// Which edition this bundle is. The student edition (`npm run build:student`, .env.student) is a compile-time constant,
// so instructor-only UI (the faculty-notes toggle, "include faculty notes" in the handout) is removed from its bundle;
// the note text itself is stripped from the lecture sources by student-edition.ts.
export const IS_STUDENT_EDITION = import.meta.env.VITE_EDITION === 'student'

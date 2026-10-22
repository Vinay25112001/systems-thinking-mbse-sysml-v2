// Course settings that faculty own (spec HP-03, DECISION_LOG A24). Until the course server (M2/M3) stores them with an
// audit log and an instructor/admin-only editor, they are configuration values here.
//
// department_label: the sponsoring department's display name. UNVERIFIED PLACEHOLDER (A24: the faculty owner confirms the
// name before the faculty demo). Empty by default, and while it is empty or unverified students see the university name
// alone; nothing such as "Department to be confirmed" ever reaches students. No logo, seal, endorsement or
// accreditation statement is shown.
export const COURSE_SETTINGS = {
  department_label: '',
  department_label_verified: false,
}

/** The institution line students see: the university, plus the department only when faculty have set and verified it. */
export function institutionLine(settings = COURSE_SETTINGS): string {
  const dept = settings.department_label.trim()
  return dept && settings.department_label_verified ? `Wright State University · ${dept}` : 'Wright State University'
}

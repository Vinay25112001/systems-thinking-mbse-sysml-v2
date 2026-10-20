// INSTRUCTOR KEY (not bundled into the app): Week 8 applied exercise, task 5, corrected. Expected: PASS, no message.
// Defect 1 (checker reports it, a syntax error at 5:2): `import` without visibility. The visibility of an import is
//   always shown explicitly (S10 slide 6; S06 p.61). This import is owned by package CampusMicrogrid, not by a root
//   namespace, so the root-namespace rule (S06 p.63) does not apply here. Fix: `private import`.
// Defect 2 (checker reports it, a syntax error at 8:15): <STK-002> is unquoted; a hyphen is not allowed in a basic
//   name (S06 pp.49-50). Fix: <'STK-002'>.
// Defect 3 (checker is SILENT): an attribute definition owns a composite part; an attribute definition may not have
//   composite features (S10 slide 9; S06 p.77). Fix: the battery belongs to a part definition; the attribute
//   definition keeps only data. The 2026-08 checker accepts the defective form without a message (Session 1,
//   "Predict the checker", item 3).
// Task 5(b), reading the seeded output: 5:2 and 5:21 come from defect 1; 8:15 and 8:21 from defect 2; 18:1 (the
//   extraneous closing brace) follows from the parser losing its place after defect 1; 11:24 and 11:3 (Boolean not
//   resolved, so the attribute is untyped) follow from the failed import of ScalarValues, not from defect 3; 16:27 and
//   16:3 follow from defect 2 (no element named 'STK-002' was declared). No error points at defect 3 itself.
// Task 5(c): exercise_microgrid_defects12_fixed.sysml (defects 1 and 2 fixed, defect 3 kept) passes with no message,
//   which isolates defect 3: a PASS does not show that the model is right.
// Task 3: a plain dependency with a comment naming the type is full credit; a keyword metadata definition is optional.
//   The conflict is symmetric, so either direction is accepted; a directed relationship must run from the dependent.
// Time: about 45 minutes in all (tasks 1-2 about 20, task 3 about 5, task 4 about 10, task 5 about 10).
package CampusMicrogrid {
	private import ScalarValues::*;
	part def <'ENT-001'> 'Campus Microgrid Enterprise' {
		part reserveBattery : Battery;
		attribute status : GridStatus;
	}
	part def <'STK-001'> 'Facilities office';
	part def <'STK-002'> 'Student residents';
	part def Battery;
	attribute def GridStatus {
		attribute islanded : Boolean;
	}
	concern <'CON-001'> 'Power during outages' {
		subject enterprise : 'ENT-001';
		stakeholder residents : 'STK-002';
	}
}

// Week 8 individual applied exercise, task 5(c) (expected: PASS, no message). The seeded fragment
// (invalid_exercise_microgrid_seeded.sysml) with its first two defects fixed (the import visibility and the quoted
// short name) and the third left in on purpose: GridStatus still owns a composite part. A PASS shows only that the file
// parsed, every name resolved and no validation rule fired; it does not show that the model is right.
package CampusMicrogrid {
	private import ScalarValues::*;
	part def <'ENT-001'> 'Campus Microgrid Enterprise';
	part def <'STK-001'> 'Facilities office';
	part def <'STK-002'> 'Student residents';
	part def Battery;
	attribute def GridStatus {
		attribute islanded : Boolean;
		part reserveBattery : Battery;
	}
	concern <'CON-001'> 'Power during outages' {
		subject enterprise : 'ENT-001';
		stakeholder residents : 'STK-002';
	}
}

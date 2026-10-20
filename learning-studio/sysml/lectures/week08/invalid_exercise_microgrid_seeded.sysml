// Week 8 individual applied exercise, task 5 (INTENTIONALLY DEFECTIVE; expected: FAIL). A campus microgrid team's first
// Stakeholders package (FICTIONAL). Three defects are seeded: fix each, then read the recorded checker output of this
// file and of exercise_microgrid_defects12_fixed.sysml. The corrected key is instructor-only (sysml/instructor/week08/).
package CampusMicrogrid {
	import ScalarValues::*;
	part def <'ENT-001'> 'Campus Microgrid Enterprise';
	part def <'STK-001'> 'Facilities office';
	part def <STK-002> 'Student residents';
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

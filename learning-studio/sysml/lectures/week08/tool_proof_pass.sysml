// Week 8 tool proof, file 1 of 2 (expected: PASS, no message). Run it before Session 2 and keep the output for the
// checker log. A PASS means the file parsed, every name resolved and no validation rule fired; nothing more.
package ToolProof {
	private import ScalarValues::*;
	part def <'ENT-001'> 'Example Enterprise' {
		doc /* A minimal enterprise with one external system and one stakeholder concern. */
	}
	part def 'Road network';
	part context {
		part <'EXT-001'> roadNetwork : 'Road network';
	}
	part def <'STK-001'> 'Example users';
	concern <'CON-001'> {
		doc /* Example users want their trips to start on time. */
		subject enterprise : 'ENT-001';
		stakeholder users : 'STK-001';
	}
}

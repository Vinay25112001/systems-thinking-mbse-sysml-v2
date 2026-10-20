// Week 8, Session 1 writing check: the model answer (expected: PASS, no message). A bakery owns two to four ovens and
// works with one flour supplier that it does not own; each oven has a capacity. A PASS means the file parsed, every
// name resolved and no validation rule fired; the reasons for part versus ref part are given in the faculty notes.
package WritingCheck {
	private import ScalarValues::*;
	part def Oven {
		attribute capacity : Natural;
	}
	part def Supplier;
	part def Bakery {
		part ovens : Oven[2..4];
		ref part supplier : Supplier;
	}
}

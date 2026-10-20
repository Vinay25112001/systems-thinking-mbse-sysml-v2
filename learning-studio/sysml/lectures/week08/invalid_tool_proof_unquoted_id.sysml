// Week 8 tool proof, file 2 of 2 (INTENTIONALLY INVALID; expected: FAIL at line 9, the short name). The course ID
// contains a hyphen, so it must be written as a quoted short name <'EXT-001'> (SysML v2.1 Beta 2, Part 1,
// pp.49-50). Keep the error message in the checker log: it proves the checker can fail.
package ToolProofFail {
	part def <'ENT-001'> 'Example Enterprise';
	part def 'Road network';
	part context {
		// the next line breaks the course ID rule
		part <EXT-001> roadNetwork : 'Road network';
	}
}

// Self-test (expected: FAIL). Syntax errors: missing ";" after an attribute, a doubled "=", and an unclosed package body.
package SelfTestInvalidSyntax {
	part def Drone {
		attribute mass : ScalarValues::Real
	}
	part survey : Drone = = ;

// Self-test (expected: FAIL). Wrong keyword: "block" is SysML v1, not SysML v2 ("part def").
package SelfTestInvalidWrongKeyword {
	block Drone {
		attribute mass : ScalarValues::Real;
	}
}

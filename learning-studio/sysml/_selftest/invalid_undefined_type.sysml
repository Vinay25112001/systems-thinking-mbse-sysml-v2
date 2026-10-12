// Self-test (expected: FAIL). Reference to a type that is defined nowhere.
package SelfTestInvalidUndefinedType {
	private import ISQ::*;
	part def Drone {
		attribute mass : MassValue;
	}
	part survey : Quadcopter;
}

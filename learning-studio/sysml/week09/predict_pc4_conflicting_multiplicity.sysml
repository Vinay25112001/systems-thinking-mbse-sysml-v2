// Week 9 "predict the checker" item pc4. Predict PASS or FAIL, and the message, before you reveal the recorded result.
// FICTIONAL: three hubs in the baseline; ALT-004 adds a fourth.
package PredictPc4 {
	part def Vertiport;
	part def VertiportNetwork {
		part sites : Vertiport[1..*];
		part hubs : Vertiport[1..*] subsets sites;
	}
	part baselineNetwork : VertiportNetwork {
		part redefines hubs[3];
	}
	part alt004Network :> baselineNetwork {
		part redefines hubs[4];
	}
}

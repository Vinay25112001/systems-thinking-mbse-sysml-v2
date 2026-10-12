// Week 9 "predict the checker" item pc8. Predict PASS or FAIL, and the message, before you reveal the recorded result.
package PredictPc8 {
	abstract part def Vertiport;
	part def HubVertiport :> Vertiport;
	part def VertiportNetwork {
		part hubs : HubVertiport[3] :> Vertiport;
	}
}

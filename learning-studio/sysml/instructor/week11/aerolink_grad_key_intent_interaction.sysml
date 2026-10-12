// Week 11 graduate task, instructor key: an interaction view of SCN-002 steps 2-3 (file the flight intent; the ANSP
// accepts it or not, A3), realised by send and accept actions through the ports of IF-003 (S10 sl.45-46; S06
// 7.17.7-7.17.8). Adapted from the instructor reference model; the decision item and the "in" direction of the port
// are additions this key proposes (see the notes). Every value is FICTIONAL.
// Connection direction: S06 p.138 says the receiver of a transfer sent via a port is "determined by interface
// connections having the port usage as their source". The IF-003 connection has the operations centre's port as its
// source, so by that wording it routes the intent only. The key therefore adds a second connection, sourced at the
// ANSP's port, for the decision; whether one connection may carry both directions is not stated in the course sources.
package 'AeroLink W11 Graduate Key' {
	private import ScalarValues::*;
	package Physical {
		item def FlightIntent { attribute route : String; }
		item def IntentDecision { attribute accepted : Boolean; }
		port def FlightIntentPort { out item intent : FlightIntent; in item decision : IntentDecision; }
		interface def FlightIntentExchange { end operatorSide : FlightIntentPort; end anspSide : ~FlightIntentPort; }
		interface def IntentDecisionReturn { end anspSide : ~FlightIntentPort; end operatorSide : FlightIntentPort; }
		part def OperationsCenter { port intentOut : FlightIntentPort; }
		part def AirNavigationServiceProvider { port intentIn : ~FlightIntentPort; }
		part def AeroLinkEnterprise;
	}
	package Context {
		part aeroLinkContext {
			part aeroLink : Physical::AeroLinkEnterprise {
				part <'PHY-004'> operationsCenter : Physical::OperationsCenter {
					perform action fileAndAwaitDecision {
						doc /* SCN-002 steps 2-3 as seen by the operations centre. */
						action fileIntent send new Physical::FlightIntent() via operationsCenter.intentOut;
						then action awaitDecision accept decision : Physical::IntentDecision via operationsCenter.intentOut;
						then decide intentCheck;
							if awaitDecision.decision.accepted then clearForBoarding;
							else holdAndRefile;
						action clearForBoarding { doc /* Step 3 accepted: this view ends here; step 4 (boarding) follows in the SCN-002 flow. */ }
						then done;
						action holdAndRefile { doc /* A3: hold the departure and re-file; the scenario ends (SCN-002 A3). */ }
						then done;
					}
				}
			}
			part <'EXT-001'> ansp : Physical::AirNavigationServiceProvider {
				perform action reviewIntent {
					doc /* SCN-002 step 3 as seen by the ANSP. The decision is a FICTIONAL acceptance (accepted = true). */
					action receiveIntent accept intent : Physical::FlightIntent via ansp.intentIn;
					then action sendDecision send new Physical::IntentDecision(true) via ansp.intentIn;
				}
			}
			interface <'IF-003'> operationsCentreANSP : Physical::FlightIntentExchange
				connect aeroLink.'PHY-004'.intentOut to 'EXT-001'.intentIn;
			interface decisionReturn : Physical::IntentDecisionReturn
				connect 'EXT-001'.intentIn to aeroLink.'PHY-004'.intentOut;
		}
	}
}

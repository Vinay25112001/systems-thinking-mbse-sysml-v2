// Week 11 worked example (a): ConOps scenario SCN-002 Passenger Transport Mission as an action flow.
// Adapted from the instructor reference model sysml/reference/aerolink_v03_behavior.sysml (Behavior::'SCN-002'),
// reduced to the elements the flow needs so that this file is self-contained. One addition to the reference: the
// item flow of the flight intent from planFlight to fileFlightIntent (lines 32-34). Every value is FICTIONAL.
package 'AeroLink W11 Action Flow' {
	private import ScalarValues::*;
	package Context {
		part def <'ENT-001'> AeroLinkEnterprise;
	}
	package Stakeholders {
		part def <'STK-008'> 'Pilots / remote operators';
	}
	package Physical {
		item def FlightIntent { attribute route : String; }
	}
	package Logical {
		action <'FN-003'> 'Plan flight' { doc /* Produce a route and energy plan that lands with at least the reserve. */ }
		action <'FN-005'> 'Fly passenger trip' { doc /* Take off, cruise, approach and land on the published procedures. */ }
		action <'FN-012'> 'Coordinate flight intent' { doc /* Exchange route and timing with the air navigation service provider before departure. */ }
		action <'FN-014'> 'Board and alight passengers' { doc /* Move passengers, including wheelchair users, between terminal and cabin. */ }
	}
	package Behavior {
		use case <'SCN-002'> 'Passenger Transport Mission' {
			subject enterprise : Context::AeroLinkEnterprise;
			actor pilotsRemoteOperators : Stakeholders::'STK-008';
			objective { doc /* Success: passengers delivered; the aircraft on the destination pad with at least 20 % usable energy. */ }
			attribute flightIntentAccepted : Boolean;
			attribute allPassengersPresent : Boolean;
			attribute destinationPadFree : Boolean;
			attribute holdWithinReserve : Boolean;
			first start;
			then action planFlight :> Logical::'FN-003' { out intent : Physical::FlightIntent; }
			flow planFlight.intent to fileFlightIntent.intent;
			then action fileFlightIntent :> Logical::'FN-012' { in intent : Physical::FlightIntent; }
			then decide intentCheck;
				if flightIntentAccepted then boardPassengers;
				else holdAndRefile;
			action holdAndRefile { doc /* A3 (step 3): hold, re-file; if no acceptance, cancel and re-accommodate. Scenario ends. */ }
			then done;
			action boardPassengers :> Logical::'FN-014' { doc /* 4. Board the party step-free at the departure pad. */ }
			then decide partyCheck;
				if allPassengersPresent then departureReady;
				else departWithRemainingParty;
			action departWithRemainingParty { doc /* A2 (step 4): depart on time with the remaining party. Rejoin at step 5. */ }
			then departureReady;
			merge departureReady;
			then action takeOff { doc /* 5. Take off within the pad-edge noise limit. */ }
			then action cruise :> Logical::'FN-005' { doc /* 5. Cruise for about 10 min at 150 km/h. */ }
			then merge approachAgain;
			then action approach { doc /* 6. Approach the destination pad. */ }
			then decide padCheck;
				if destinationPadFree then landAtDestination;
				if (not destinationPadFree) and holdWithinReserve then holdForPad;
				else divertToAlternate;
			action holdForPad { doc /* A1 (step 6): hold within the energy reserve. */ }
			then approachAgain;
			action divertToAlternate { doc /* A1 (step 6): divert to the nearest open vertiport. Rejoin at step 7. */ }
			then arrived;
			action landAtDestination { doc /* 6. Land at the destination pad. */ }
			then arrived;
			merge arrived;
			then action deplanePassengers { doc /* 7. Passengers deplane at the destination. */ }
			then action handOverToCharging { doc /* 7. The aircraft passes to charging (SCN-003). */ }
			then done;
		}
	}
}

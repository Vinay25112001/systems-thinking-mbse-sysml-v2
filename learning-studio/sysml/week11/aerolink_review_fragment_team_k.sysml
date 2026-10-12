// Week 11 worked example (d): a model fragment to review. FICTIONAL "Team K" draft of SCN-005 Weather Disruption
// (action flow) and a vertiport weather-hold state machine. The course-designated checker accepts this file, yet it
// contains several defects a reviewer must find. Do not copy it: it is seeded with errors for the RID exercise.
package 'Team K L11 Draft' {
	private import ScalarValues::*;
	package Context {
		part def <'ENT-001'> AeroLinkEnterprise;
		part def AirNavigationServiceProvider;
		part def VertiportNetwork;
	}
	package Logical {
		action <'FN-004'> 'Assess dispatch weather';
		action <'FN-012'> 'Coordinate flight intent';
		part def DecisionSupport;
		part def FlightOperations;
		part logicalArchitecture {
			part <'LOG-006'> decisionSupport : DecisionSupport { perform Logical::'FN-004'; }
			part <'LOG-001'> flightOperations : FlightOperations;
		}
	}
	package Behavior {
		use case <'SCN-005'> 'Weather Disruption' {
			subject enterprise : Context::AeroLinkEnterprise;
			actor airNavigationServiceProvider : Context::AirNavigationServiceProvider;
			attribute regionWide : Boolean;
			attribute alternateOpen : Boolean;
			attribute alternateWithinReserve : Boolean;
			first start;
			then action declareHold { doc /* Duty manager declares a weather hold for V3. */ }
			then action flagVertiport :> Logical::'FN-004' { doc /* Flag V3 approaching its limits; list affected flights. */ }
			then decide holdScope;
				if regionWide then suspendNetwork;
				else divertFlights;
			action suspendNetwork { doc /* Region-wide event: suspend all departures network-wide. */ }
			then notifyPassengers;
			action divertFlights { doc /* Divert each airborne flight bound for V3 to its planned alternate. */ }
			then decide alternateCheck;
				if alternateOpen then acceptRevisedIntents;
				if alternateWithinReserve then divertNearest;
			action divertNearest { doc /* Divert to the nearest open vertiport within the reserve. */ }
			action acceptRevisedIntents :> Logical::'FN-012' { doc /* ANSP accepts the revised flight intents. */ }
			then notifyPassengers;
			action notifyPassengers { doc /* Notify passengers of a new time, an alternate vertiport or a refund. */ }
			then action passengersRespond { doc /* Each passenger accepts a new time or vertiport, or takes the refund. */ }
			then action liftHold { doc /* Lift the hold; re-time the backlog. */ }
			then done;
		}
		attribute def LimitForecast;
		attribute def ForecastClear;
		state def VertiportWeatherStates {
			first start then open;
			state open;
			accept LimitForecast then hold;
			state hold;
			accept ForecastClear then open;
			state closedForDay { doc /* Bookings to the vertiport cancelled for the rest of the day. */ }
			accept ForecastClear then open;
		}
		state vertiportWeatherStates : VertiportWeatherStates;
	}
	package Physical {
		part aeroLink : Context::AeroLinkEnterprise {
			part <'PHY-002'> vertiports : Context::VertiportNetwork;
		}
	}
}

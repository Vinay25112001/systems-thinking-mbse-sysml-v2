// Week 11 Lab L11 starter: the six main-flow steps of SCN-001 Passenger Ride Request in succession, inside the use
// case, so that class time goes into the decisions and alternates. NOT a model answer: it has no decision, no
// alternate flow, no item flow and no FN subsetting yet; adding those is the lab task. Paste it into your v0.2 model
// and replace the stand-in definitions with your own elements. Every value is FICTIONAL.
package 'AeroLink W11 L11 Starter' {
	private import ScalarValues::*;
	package Context {
		part def <'ENT-001'> AeroLinkEnterprise;
	}
	package Stakeholders {
		part def <'STK-001'> 'Passengers';
	}
	package Behavior {
		use case <'SCN-001'> 'Passenger Ride Request' {
			subject enterprise : Context::AeroLinkEnterprise;
			actor passengers : Stakeholders::'STK-001';
			first start;
			then action enterRequest { doc /* 1. STK-001 enters the origin and destination vertiports and the party size (1-4). */ }
			then action checkWeatherAndCapacity { doc /* 2. AeroLink checks weather status and capacity at both vertiports. */ }
			then action quoteFare { doc /* 3. AeroLink quotes the fare and an estimated boarding time. */ }
			then action confirmBooking { doc /* 4. STK-001 confirms the booking. */ }
			then action assignAircraft { doc /* 5. AeroLink assigns a dispatch-ready aircraft within 60 s of confirmation. */ }
			then action issueBoardingPass { doc /* 6. AeroLink issues a boarding pass with the pad and the boarding time. */ }
			then done;
		}
	}
}

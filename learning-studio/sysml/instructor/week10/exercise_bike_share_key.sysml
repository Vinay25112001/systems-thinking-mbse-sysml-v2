// Week 10 applied exercise: instructor key (NOT for students; never bundled into the app). City bike-share case
// (FICTIONAL). Tasks 2-4: the rental scenario as an action flow with a decision, a merge and both alternates; the dock
// states with at least three states, four transitions and one guard (the key shows four and seven); the use case header. Marking notes are in the
// assessment rubric (src/content/week10Assessment.ts); any equivalent model that keeps the meaning earns full marks.
package 'W10 Exercise Bike Share Key' {
	private import ScalarValues::*;
	part def BikeShareService;
	part def Rider;
	part def PaymentProvider;
	item def Bike;
	item def RideRecord;
	action def UnlockBike { out bike : Bike; }
	action def Ride { in bike : Bike; out bikeAfterRide : Bike; }
	action def ReturnBike { in bike : Bike; out ride : RideRecord; }
	use case 'Rent a bike' {
		doc /* Trigger: a rider asks to rent a bike at a station. Failure end state: no bike rented, or the ride closed at another station. */
		subject service : BikeShareService;
		actor rider : Rider;
		actor payment : PaymentProvider;
		objective { doc /* Success: the rider rode and returned the bike, and the ride was charged. */ }
		attribute noBikeAvailable : Boolean;
		attribute dockFull : Boolean;
		first start;
		then action requestBike { doc /* 1. The rider asks for a bike at the station. */ }
		then decide bikeCheck;
			if noBikeAvailable then pointToNearestStation;
			else unlock;
		action pointToNearestStation { doc /* A1: no bike available. Show the nearest station with a bike; the scenario ends. */ }
		then done;
		action unlock : UnlockBike { doc /* 2. Unlock a bike for the rider. */ }
		then action ride : Ride { doc /* 3. The rider rides. */ }
		then decide dockCheck;
			if dockFull then extendToNextStation;
			else returned;
		action extendToNextStation { doc /* A2: the dock is full. Give the rider 15 free minutes to reach the next station; rejoin at the return. */ }
		then returned;
		merge returned;
		then action returnAtDock : ReturnBike { doc /* 4. The rider docks the bike; the ride is closed and charged. */ }
		then done;
		flow unlock.bike to ride.bike;
		flow ride.bikeAfterRide to returnAtDock.bike;
	}
	attribute def BikeDocked;
	attribute def BikeRemoved;
	attribute def BatteryLow;
	attribute def BatteryCharged;
	attribute def FaultReported;
	attribute def Repaired;
	state def DockStates {
		attribute bikePresent : Boolean;
		first start then empty;
		state empty;
		state available;
		state charging;
		state outOfService;
		transition docked first empty accept BikeDocked then available;
		transition removed first available accept BikeRemoved then empty;
		transition lowBattery first available accept BatteryLow then charging;
		transition charged first charging accept BatteryCharged then available;
		transition fault first available accept FaultReported then outOfService;
		transition repairedWithBike first outOfService accept Repaired if bikePresent then available;
		transition repairedEmpty first outOfService accept Repaired if not bikePresent then empty;
	}
	state dockStates : DockStates;
	part def DockStation {
		exhibit dockStates;
	}
}

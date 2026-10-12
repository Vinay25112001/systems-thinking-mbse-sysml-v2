// INSTRUCTOR ONLY - Week 9 graduate KerML memo, part (d), model answer (not shown in the app).
// Starting from aerolink_def_usage.sysml, the bindings of ratedPower are removed from HighPowerCharger and
// StandardCharger. A charger may now be of both kinds, so a site may be both a HubVertiport and a SpokeVertiport:
// "no site is both a hub and a spoke" is no longer entailed. It is therefore stated, as asserted constraints in
// VertiportNetwork (the pattern of aerolink_network_stated.sysml). The checker accepts this file, and it accepted
// the original too: it resolves the names in the constraints but evaluates neither the entailment nor the
// constraints (a deliberately false constraint, falseOnPurpose below, also passes). FICTIONAL teaching model.
package Week09MemoDModelAnswer {
	private import ISQ::*;
	private import ScalarValues::*;
	private import SequenceFunctions::*;

	abstract part def Charger {
		attribute ratedPower : PowerValue;
	}
	part def HighPowerCharger :> Charger;
	part def StandardCharger :> Charger;

	abstract part def Vertiport {
		attribute pads : Natural;
		part chargers : Charger[1..*];
	}
	part def HubVertiport :> Vertiport {
		part turnaroundChargers : HighPowerCharger[2] subsets chargers;
	}
	part def SpokeVertiport :> Vertiport {
		part redefines chargers : StandardCharger[1..*];
	}

	part def VertiportNetwork {
		part sites : Vertiport[1..*];
		part hubs : HubVertiport[1..*] subsets sites;
		part spokes : SpokeVertiport[0..*] subsets sites;
		assert constraint hubsAreNotSpokes { isEmpty(intersection(hubs, spokes)) }
		assert constraint everySiteIsHubOrSpoke { includesOnly(sites, union(hubs, spokes)) }
		assert constraint falseOnPurpose {
			doc /* Deliberately false (more hubs than sites): shows that the checker does not evaluate constraints. */
			size(hubs) > size(sites)
		}
	}
}

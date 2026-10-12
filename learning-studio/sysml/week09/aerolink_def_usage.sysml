// Week 9 worked example (b): definition vs usage, specialization, subsetting and redefinition on the AeroLink
// vertiport network. Adapted from the Physical package of the instructor reference skeleton (v0.1).
// FICTIONAL VALUES (teaching values, not real-world data): six vertiports with three hubs and three spokes in the
// baseline; ALT-004 (DEC-001) converts one spoke into a fourth hub with high-power chargers; two turnaround chargers
// per hub. The charger ratings 350 kW and 150 kW are instructor values for this listing only.
package AeroLinkVertiportNetwork {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	abstract part def Charger {
		attribute ratedPower : PowerValue;
	}
	part def HighPowerCharger :> Charger {
		attribute redefines ratedPower = 350 [kW];
	}
	part def StandardCharger :> Charger {
		attribute redefines ratedPower = 150 [kW];
	}

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
	}

	part vertiportNetwork : VertiportNetwork;

	part baselineNetwork :> vertiportNetwork {
		doc /* The network as baselined at CP3 (the ALT-001 configuration of PHY-002): six sites, three hubs, three spokes. */
		part redefines sites[6];
		part redefines hubs[3];
		part redefines spokes[3];
	}
	part alt004Network :> vertiportNetwork {
		doc /* The ALT-004 configuration recommended by DEC-001: one spoke converted into a fourth hub. */
		part redefines sites[6];
		part redefines hubs[4];
		part redefines spokes[2];
	}
}

// Week 5 micro-lab 1, listing 1 (read-only). Syntax follows the SysML v2 training material, release 2026-08:
// packages and imports (S10 sl.5-6), part and attribute definitions (sl.9), redefinition and multiplicity
// (sl.12), definitions then usages (sl.15), bound values with units (sl.89), ISQ and SI (sl.167-168).
// All values are FICTIONAL teaching values from the AeroLink Data Sheet.
package AeroLinkFleet {
	doc /* A read-only fragment of the AeroLink case for the Week 5 SysML reading micro-lab. */
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	// ---- Definitions ----
	part def Battery {
		attribute usableEnergy : EnergyValue;
		attribute reserveShare : Real;
	}

	part def EVTOLAircraft {
		attribute seats : Integer;
		attribute cruiseSpeed : SpeedValue;
		part battery : Battery;
	}

	part def Charger {
		attribute chargeTimeToDispatch : DurationValue;
	}

	part def Vertiport {
		doc /* The pad-edge limit is A-weighted (dBA); the dB unit does not record the weighting. */
		attribute padEdgeNoiseLimit : SoundPressureLevelValue;
		part chargers : Charger[1..*];
	}

	part def AeroLinkNetwork {
		attribute operatingDay : DurationValue;
		part fleet : EVTOLAircraft[*];
		part vertiports : Vertiport[*];
	}

	// ---- Usages ----
	part aerolink : AeroLinkNetwork {
		attribute redefines operatingDay = 16 [h];
		part redefines fleet[12] {
			attribute redefines seats = 4;
			attribute redefines cruiseSpeed = 150 [km/h];
			part redefines battery {
				attribute redefines reserveShare = 0.20;
			}
		}
		part redefines vertiports[6] {
			attribute redefines padEdgeNoiseLimit = 65 [dB];
			part redefines chargers[2] {
				attribute redefines chargeTimeToDispatch = 20 [min];
			}
		}
	}
}

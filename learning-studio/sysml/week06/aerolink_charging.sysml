// Week 6 micro-lab 2 (online), listing 1 (read-only). Definition vs usage, specialization and attributes with units.
// Syntax follows the SysML v2 training material, release 2026-08: part and attribute definitions (S10 sl.9),
// specialization (sl.10), subsetting (sl.11), redefinition (sl.12), parts (sl.15-16), ISQ and SI (sl.167-168).
// Adapted from sysml/reference/aerolink_v01_skeleton.sysml (package Physical) and the Week 6 TECH items.
// All values are FICTIONAL teaching values (charger power and pack energy are instructor values).
package AeroLinkCharging {
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;

	// ---- Definitions ----
	attribute def ReadinessAssessment {
		doc /* A TRL is an ordinal level, not a quantity: it is typed by Natural and has no unit. */
		attribute trl : Natural;
		attribute basis : String;
	}

	abstract part def Charger {
		attribute ratedPower : PowerValue;
		attribute chargeTimeToDispatch : DurationValue;
	}

	part def <'TECH-001'> HighPowerCharger :> Charger {
		attribute readiness : ReadinessAssessment;
	}

	part def StandardCharger :> Charger;

	part def BatteryPack {
		attribute usableEnergy : EnergyValue;
		attribute reserveShare : Real;
		attribute maxChargePower : PowerValue;
	}

	part def HubVertiport {
		attribute connectionLimit : PowerValue;
		part chargers : Charger[1..*];
	}

	// ---- Usages ----
	part hub1 : HubVertiport {
		attribute redefines connectionLimit {
			doc /* TBD-02: deliberately left unbound until the utility confirms capacity (U-002). */
		}
		part turnaroundChargers : HighPowerCharger[2] subsets chargers {
			attribute redefines ratedPower = 350 [kW];
			attribute redefines chargeTimeToDispatch = 20 [min];
			attribute redefines readiness {
				attribute redefines trl = 6;
				attribute redefines basis = "Assumption A-003";
			}
		}
	}

	part aircraftPack : BatteryPack {
		attribute redefines usableEnergy = 160 [kW * h];
		attribute redefines reserveShare = 0.20;
		attribute redefines maxChargePower = 400 [kW];
	}
}

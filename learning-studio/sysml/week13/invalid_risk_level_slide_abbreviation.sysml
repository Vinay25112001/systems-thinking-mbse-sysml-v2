// Week 13 teaching listing (intentionally invalid): risk level copied from a slide's abbreviation.
// S10 sl.147 prints the library's RiskLevelEnum with LevelEnum::L, ::M and ::H, while its LevelEnum lists the values
// low, medium and high. A team copied the abbreviation. The checker rejects line 15: the enumeration has no value M.
// The fix is LevelEnum::medium (or a number between 0.0 and 1.0). All values FICTIONAL (teaching values).
package AeroLinkRiskLevelSlip {
	private import ScalarValues::*;
	private import RiskMetadata::*;

	part def EVTOLAircraft;
	part aircraft : EVTOLAircraft;

	metadata teamDraftThermalRisk : Risk about aircraft {
		doc /* A team's draft (no course ID yet): technical risk of a battery thermal event on a pad, recorded at the library's medium probability level. */
		technicalRisk = new RiskLevel(
			probability = LevelEnum::M);
	}
}

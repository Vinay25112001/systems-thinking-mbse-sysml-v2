// Week 9, commentary on worked example (b): stating what aerolink_def_usage.sysml only entails.
// SysML v2 (pilot 2026-08) has no disjoining or unioning clause on definitions or usages, so the two properties are
// stated as asserted constraints over the features, the pattern the standard library itself uses for causes and
// effects (Domain Libraries/Cause and Effect/CausationConnections.sysml). The checker resolves every name in the
// constraint expressions; it does not evaluate them. FICTIONAL teaching model.
package AeroLinkVertiportNetworkStated {
	private import SequenceFunctions::*;

	abstract part def Vertiport;
	part def HubVertiport :> Vertiport;
	part def SpokeVertiport :> Vertiport;

	part def VertiportNetwork {
		part sites : Vertiport[1..*];
		part hubs : HubVertiport[1..*] subsets sites;
		part spokes : SpokeVertiport[0..*] subsets sites;
		assert constraint hubsAreNotSpokes {
			doc /* No site is both a hub and a spoke. */
			isEmpty(intersection(hubs, spokes))
		}
		assert constraint everySiteIsHubOrSpoke {
			doc /* Every site is a hub or a spoke, and every hub and spoke is a site. */
			includesOnly(sites, union(hubs, spokes))
		}
	}
}

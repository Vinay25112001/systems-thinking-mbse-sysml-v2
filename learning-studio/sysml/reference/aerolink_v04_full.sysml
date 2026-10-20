// AeroLink Urban Mobility: instructor reference SysML v2 model, v0.4 full model (L12 / CP5).
// Generated from the instructor reference baseline (learning-studio/src/model/reference/week*.ts) and checked
// with the OMG SysML v2 Pilot Implementation release 2026-08 (kernel 0.62.0) via `npm run content:sysml`.
// Content at this level: v0.3 + 11 verification cases, MOE / MOP / TPM, TECH, AROU metadata (library Risk), ALT / CRIT / DEC trade study and every course link of the baseline.
// Conventions (LABORATORY_AND_CAPSTONE_PLAN.md C.2): course IDs are short names written as quoted unrestricted
// names in the form <'ID'> (S06 p.49-50, p.165); references use the short name. Course relationships that are
// not SysML keywords are dependencies named '<source> <link type> <target>' and tagged with semantic metadata
// (#derivesFrom, #affectedBy, ...), the library Derivation connection (#derivation) or the library Refinement
// (#refinement). Every dependency runs from the dependent element (client) to the element it depends on (supplier),
// S06 pp.50-51; the tag names the client's relation to the supplier (#affectedBy and #receivesFrom therefore run from
// the link's target to its source). See sysml/reference/README.md for the full mapping.
// FICTIONAL VALUES (teaching values, not real-world data): every number in this file comes from the AeroLink Data
// Sheet or the instructor baseline: 6 vertiports (3 hubs, 3 spokes), 12 aircraft (16 planned by DEC-001), 4 seats,
// 150 km/h cruise, 25 km design trip, 16 min block time, 20 min charge, 25 min hub turnaround, 16 h operating day,
// 20 % energy reserve, 65 dB(A) pad-edge limit, 15 min wait, 60 s assignment, 2 min no-go flag, 30 s / 60 s fire
// alarm, 90 % availability, 300 trips/day capacity, 12 chargers (6 high-power at hubs), TPM estimates 18 min /
// 63.5 dB(A) / 23 %, trade-study weights 0.40/0.30/0.16/0.14. TBD-01 (weather limits) and TBD-02 (grid limit)
// are left unvalued on purpose. Charger occupancy (A-007): 20 min on the charger per 25 min turnaround, i.e. 48
// charges per turnaround charger per 16 h day.

package 'AeroLink Reference Model' {
	doc /* AeroLink Urban Mobility instructor reference model, v0.4 full model (L12 / CP5). All values FICTIONAL (teaching values). */
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;
	private import ModelingMetadata::*;
	private import RequirementDerivation::*;
	private import VerificationCases::*;
	private import RiskMetadata::*;
	private import ParametersOfInterestMetadata::*;
	private import TradeStudies::*;
	// Semantic tags for course relationship types that are not SysML keywords (C.2 rule 4).
	metadata def <derivesFrom> DerivesFromLink {
		doc /* derives-from: the client is derived from the supplier (used where both ends are not requirements; requirement-to-requirement derivation uses the library #derivation connection). */
		:> annotatedElement : SysML::Dependency;
	}
	metadata def <affectedBy> AffectedByLink {
		doc /* affects, written from the dependent: for the course link X affects Y the dependency runs from Y (client) to X (supplier), because a change to X may require a change to Y (SysML v2.1 Beta 2, Part 1, 7.3: a change to a supplier may result in a change to a client). The dependency keeps the name 'X affects Y'. AROU items record affects through the elements their metadata is about. */
		:> annotatedElement : SysML::Dependency;
	}
	metadata def <receivesFrom> ReceivesFromLink {
		doc /* flows-to, written from the dependent: for the course link X flows-to Y the dependency runs from the consumer Y (client) to the producer X (supplier), where no item flow between ports exists (AI capabilities, decisions, logical sources). The dependency keeps the name 'X flows-to Y'. */
		:> annotatedElement : SysML::Dependency;
	}
	metadata def <satisfies> SatisfiesLink {
		doc /* satisfies (contribution): an interface or element whose type does not conform to the requirement subject contributes to satisfying it. The asserting `satisfy` is made by the element that conforms to the subject. */
		:> annotatedElement : SysML::Dependency;
	}
	metadata def <measures> MeasuresLink {
		doc /* measures: the client measure (MOE, MOP or TPM attribute) measures the supplier. */
		:> annotatedElement : SysML::Dependency;
	}
	metadata def <mitigates> MitigatesLink {
		doc /* mitigates: the client reduces the likelihood or consequence of the supplier risk. */
		:> annotatedElement : SysML::Dependency;
	}
	package Context {
		doc /* ENT and EXT elements: the system of interest and its context (L9 package Context). */
		part def <'ENT-001'> AeroLinkEnterprise {
			doc /* AeroLink Urban Mobility. The enterprise: the company and its partners (the vertiport operators, the electric utility, the aircraft manufacturer and the investors) that share one mission: on-demand electric air trips in one metropolitan region. Insurers, public transport, emergency response and the approving authorities sit in the extended enterprise. */
			attribute operatingDay : DurationValue = 16 [h];
			attribute vertiportCount : Natural = 6;
			// Quantities constrained by the stakeholder requirements (REQ-STK).
			attribute maxPadEdgeNoise : SoundPressureLevelValue { doc /* A-weighted LAmax at any pad edge. */ }
			attribute dispatchesBeyondWeatherLimits : Natural;
			attribute networkCapacity : Real { doc /* Trips per day across the network in the 16 h operating day. */ }
			attribute hubTurnaroundTime : DurationValue;
			attribute dispatchesWithOpenNoGoFault : Natural;
			attribute stepFreeVertiports : Natural;
			attribute responderAlertTime : DurationValue;
			attribute flightIntentAcceptedBeforeTakeOff : Boolean;
			attribute peakVertiportChargingPower : PowerValue;
			// Measures of effectiveness (MOE).
			#moe attribute <'MOE-001'> passengerWaitP90 : DurationValue { doc /* Passenger wait (90th percentile): Monthly 90th-percentile time from ride confirmation to boarding, across all vertiports. Unit: min; lower-is-better; threshold 15. */ }
			#moe attribute <'MOE-002'> dailyTripsServed : Real { doc /* Daily trips served: Revenue trips flown per operating day, network-wide, compared with trips requested. Unit: trips/day; higher-is-better; threshold 240. */ }
			#moe attribute <'MOE-003'> noiseComplianceRate : Real { doc /* Noise compliance rate: Share of take-offs and landings at or below 65 dBA LAmax at the pad edge. Unit: %; higher-is-better; threshold 100. Modelled as a fraction 0..1. */ }
			#moe attribute <'MOE-004'> dispatchesOutsideLimits : Natural { doc /* Dispatches outside approved limits: Number of flights dispatched outside approved weather, energy-reserve or airworthiness limits. Unit: count/quarter; lower-is-better; threshold 0. */ }
			#moe attribute <'MOE-005'> capitalForYear2Capacity : Real { doc /* Capital to meet the Year-2 capacity objective: Capital required over months 0-24 to add the capacity in a plan, in USD millions (course cost measure, handled explicitly per RB-6.2). Unit: USD M; lower-is-better. */ }
			#moe attribute <'MOE-006'> capacityRetainedAfterHubLoss : Real { doc /* Capacity retained after loss of one hub: Network trip capacity remaining when one hub vertiport is closed (weather or incident), as a share of full capacity. Unit: %; higher-is-better. Modelled as a fraction 0..1. */ }
		}
		part def ControlledAirspace {
			port intentIn : ~Physical::FlightIntentPort;
		}
		part def ElectricGrid {
			port supply : Physical::GridPowerPort;
		}
		part def WeatherSystem {
			port weatherOut : Physical::WeatherDataPort;
		}
		part def AircraftAndSparesSupply;
		part def PublicTransportNetwork;
		part def EmergencyResponseService {
			port alarmIn : ~Physical::FireAlarmPort;
		}
		part aeroLinkContext {
			doc /* Operating context: the AeroLink system of interest (Physical::aeroLink) and the six external systems. */
			ref part systemOfInterest :> Physical::aeroLink;
			part <'EXT-001'> controlledAirspace : ControlledAirspace { doc /* Controlled airspace (air traffic service). Provides airspace access and traffic integration. */ }
			part <'EXT-002'> electricGrid : ElectricGrid { doc /* Electric grid. Supplies power to vertiport chargers. */ }
			part <'EXT-003'> weather : WeatherSystem { doc /* Weather. Natural system constraining operations. */ }
			part <'EXT-004'> aircraftSupply : AircraftAndSparesSupply { doc /* Aircraft and spares supply. Supplies aircraft and parts; sets delivery lead time. */ }
			part <'EXT-005'> publicTransport : PublicTransportNetwork { doc /* Public transport network. Connects passengers to and from vertiports. */ }
			part <'EXT-006'> emergencyResponse : EmergencyResponseService { doc /* Emergency response service. Responds to incidents at vertiports and in flight. */ }
			// External interfaces (IF to EXT).
			interface <'IF-003'> operationsCentreANSP : Physical::FlightIntentExchange connect systemOfInterest.'PHY-004'.intentOut to 'EXT-001'.intentIn { doc /* Operations centre <-> ANSP (information): Flight intent submission and acceptance before take-off. Carries: route, departure time, acceptance. */ }
			interface <'IF-006'> chargerUtilityGrid : Physical::GridConnection connect 'EXT-002'.supply to systemOfInterest.'PHY-003'.gridInlet { doc /* Charger <-> utility grid (physical): Grid connection at each vertiport with an agreed power limit (TBD-02). Carries: electrical power. */ }
			interface <'IF-007'> fireAlarmEmergencyServices : Physical::FireAlarmLink connect systemOfInterest.'PHY-008'.alarmOut to 'EXT-006'.alarmIn { doc /* Fire alarm <-> emergency services (information): Automatic battery-fire alarm to the emergency services dispatch centre. Carries: alarm, pad location. */ }
			interface <'IF-011'> weatherServiceOperationsCentre : Physical::WeatherDataLink connect 'EXT-003'.weatherOut to systemOfInterest.'PHY-004'.weatherIn { doc /* Weather service <-> operations centre (information): Observed and forecast vertiport weather delivered to dispatch decision support. Carries: INFO-004. */ }
			// Item flows from external systems (flows-to).
			flow 'EXT-003 flows-to INFO-004 flows-to PHY-004' of Physical::'INFO-004' from 'EXT-003'.weatherOut.weather to systemOfInterest.'PHY-004'.weatherIn.weather;
		}
	}
	package Stakeholders {
		doc /* STK as part definitions; CON as concerns whose stakeholder declarations realise CON derives-from STK. */
		part def <'STK-001'> 'Passengers' { doc /* Safe, reliable and affordable door-to-door trips with predictable wait times. Category: customers; interest 5, influence 3 (1-5). */ }
		part def <'STK-002'> 'FAA' { doc /* Airworthiness and operational safety of the aircraft and the operation. Category: regulators; interest 4, influence 5 (1-5). */ }
		part def <'STK-003'> 'Investors' { doc /* Return on capital and a credible path to scale. Category: investors; interest 4, influence 5 (1-5). */ }
		part def <'STK-004'> 'Communities' { doc /* Noise, privacy, visual impact and equitable access near vertiports. Category: community; interest 4, influence 4 (1-5). */ }
		part def <'STK-005'> 'Vertiport Operators' { doc /* Pad throughput, charging capacity and safe ground operations. Category: infrastructure; interest 5, influence 4 (1-5). */ }
		part def <'STK-006'> 'Emergency Responders' { doc /* Incident response access and battery-fire procedures at vertiports. Category: safety; interest 3, influence 3 (1-5). */ }
		part def <'STK-007'> 'Air navigation service provider' { doc /* Safe integration of air-taxi traffic with other airspace users. Category: regulators; interest 4, influence 5 (1-5). */ }
		part def <'STK-008'> 'Pilots / remote operators' { doc /* Workload, training, duty time and automation trust. Category: workforce; interest 5, influence 3 (1-5). */ }
		part def <'STK-009'> 'Maintenance technicians' { doc /* Diagnostics access, battery handling safety, turnaround pressure. Category: workforce; interest 4, influence 2 (1-5). */ }
		part def <'STK-010'> 'Electric utility' { doc /* Peak-load management and grid connection cost at vertiports. Category: infrastructure; interest 3, influence 4 (1-5). */ }
		part def <'STK-011'> 'Aircraft manufacturer (OEM)' { doc /* Fleet orders, operating data and certification progress. Category: suppliers; interest 4, influence 4 (1-5). */ }
		part def <'STK-012'> 'Insurers' { doc /* Quantifiable operational risk and loss history. Category: investors; interest 3, influence 4 (1-5). */ }
		part def <'STK-013'> 'City planning authority' { doc /* Land use, zoning and integration with public transport. Category: regulators; interest 3, influence 5 (1-5). */ }
		part def <'STK-014'> 'Accessibility advocates' { doc /* Boarding access and service for passengers with disabilities. Category: community; interest 3, influence 2 (1-5). */ }
		concern <'CON-001'> 'Predictable waiting time' {
			doc /* Passengers judge the service by how long they wait between confirming a ride and boarding, and by whether that wait is predictable. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder passengers : 'STK-001';
		}
		concern <'CON-002'> 'Personal safety in flight' {
			doc /* Passengers must be confident that every flight is safe before they will use a new mode of transport. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder passengers : 'STK-001';
		}
		concern <'CON-003'> 'Affordable fare' {
			doc /* Passengers compare the fare with ride-hail and public transport for the same trip. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder passengers : 'STK-001';
		}
		concern <'CON-004'> 'Airworthiness and operational safety' {
			doc /* The FAA is concerned that aircraft and operations stay within approved safety limits at all times, including in adverse weather. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder faa : 'STK-002';
		}
		concern <'CON-005'> 'Return on capital and path to scale' {
			doc /* Investors are concerned that capital spent on aircraft and vertiports produces capacity that is actually used. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder investors : 'STK-003';
		}
		concern <'CON-006'> 'Pad throughput and charging capacity' {
			doc /* Vertiport operators are concerned that charging and turnaround, not demand, limit how many flights a pad can handle. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder vertiportOperators : 'STK-005';
		}
		concern <'CON-007'> 'Battery-fire response at vertiports' {
			doc /* Emergency responders are concerned about early warning, access and procedures for a lithium battery fire on a pad. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder emergencyResponders : 'STK-006';
		}
		concern <'CON-008'> 'Airspace integration' {
			doc /* The air navigation service provider is concerned that air-taxi traffic is known and separated from other airspace users. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder airNavigationServiceProvider : 'STK-007';
		}
		concern <'CON-009'> 'Operator workload and automation trust' {
			doc /* Pilots and remote operators are concerned about workload, duty time and how far they can trust automated decision aids. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder pilotsRemoteOperators : 'STK-008';
		}
		concern <'CON-010'> 'Turnaround pressure on maintenance' {
			doc /* Maintenance technicians are concerned that schedule pressure leads to aircraft being released without a clear condition picture. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder maintenanceTechnicians : 'STK-009';
		}
		concern <'CON-011'> 'Peak grid load' {
			doc /* The electric utility is concerned about simultaneous high-power charging exceeding the agreed connection capacity at a vertiport. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder electricUtility : 'STK-010';
		}
		concern <'CON-012'> 'Community noise' {
			doc /* Residents near vertiports are concerned about take-off and landing noise, how often it occurs and at what hours. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder communities : 'STK-004';
		}
		concern <'CON-013'> 'Step-free boarding access' {
			doc /* Accessibility advocates are concerned that passengers using wheelchairs can board and alight without being lifted. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder accessibilityAdvocates : 'STK-014';
		}
		concern <'CON-014'> 'Quantifiable operational risk' {
			doc /* Insurers are concerned that operational risk is measured and recorded so that premiums can be set on evidence. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder insurers : 'STK-012';
		}
		concern <'CON-015'> 'Fleet orders and delivery milestones' {
			doc /* The aircraft manufacturer is concerned that AeroLink's aircraft orders, delivery slots and payment milestones are kept as agreed in the purchase agreement, because they set its own production plan. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder aircraftManufacturer : 'STK-011';
		}
		concern <'CON-016'> 'Land use and zoning of vertiport sites' {
			doc /* The City planning authority is concerned that vertiport sites conform to zoning and land-use plans and connect to public transport, especially sites in residential districts. */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder cityPlanningAuthority : 'STK-013';
		}
	}
	package Needs {
		doc /* MGO (mission, goals, objectives) and NEED as requirements, CAP as action definitions (L3 / CP1). */
		requirement <'MGO-001'> 'Mission: safe, quiet on-demand urban air trips' {
			doc /* AeroLink provides safe, quiet, on-demand air trips between the six vertiports of one metropolitan region, at waits passengers find predictable and at a cost that lets the network grow. Level: mission. */
			subject enterprise : Context::AeroLinkEnterprise;
			frame Stakeholders::'CON-001';
			frame Stakeholders::'CON-004';
			frame Stakeholders::'CON-005';
			frame Stakeholders::'CON-012';
		}
		requirement <'MGO-002'> 'Goal: short, predictable waits' {
			doc /* Passengers board soon after they confirm a ride, and the wait they are quoted is the wait they get. Level: goal. */
			subject enterprise : Context::AeroLinkEnterprise;
			frame Stakeholders::'CON-001';
		}
		requirement <'MGO-003'> 'Goal: be a good neighbour' {
			doc /* Vertiport operations stay within what neighbouring communities have agreed to accept. Level: goal. */
			subject enterprise : Context::AeroLinkEnterprise;
			frame Stakeholders::'CON-012';
		}
		requirement <'MGO-004'> 'Goal: grow capacity in step with demand' {
			doc /* Capacity is added when and where demand needs it, without stranding capital in idle aircraft or chargers. Level: goal. */
			subject enterprise : Context::AeroLinkEnterprise;
			frame Stakeholders::'CON-005';
		}
		requirement <'MGO-005'> 'Objective: 90 % boarded within 15 min' {
			doc /* From month 6 onward, at least 90 % of passengers in each calendar month board within 15 min of confirming their ride. Level: objective. Measure (MOE): 90th-percentile wait; target 15 min; horizon: month 6 onward. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute maxWait : DurationValue = 15 [min];
			attribute minShareBoarded : Real = 0.90;
		}
		requirement <'MGO-006'> 'Objective: no pad-edge noise exceedance' {
			doc /* Zero take-off or landing events above 65 dBA at any vertiport pad edge in each quarter. Level: objective. Measure (MOE): take-off or landing events above 65 dBA LAmax at any pad edge; target 0 events per quarter (limit 65 dBA); horizon: each quarter from the start of service. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute noiseLimit : SoundPressureLevelValue = 65 [dB];
			attribute maxExceedancesPerQuarter : Natural = 0;
		}
		requirement <'MGO-007'> 'Objective: Year-2 capacity with headroom' {
			doc /* By month 24, serve the planning demand of 240 trips/day at a fleet utilisation of no more than 80 %, i.e. provide at least 300 trips/day of capacity. Level: objective. Measure (MOE): trips/day capacity; target 300 trips/day; horizon: month 24. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute targetCapacity : Real = 300 { doc /* trips/day */ }
			attribute planningDemand : Real = 240 { doc /* trips/day */ }
			attribute maxUtilisation : Real = 0.80;
		}
		requirement <'MGO-008'> 'Objective: zero dispatches outside limits' {
			doc /* Zero flights dispatched outside the approved weather, energy-reserve or airworthiness limits in each quarter. Level: objective. Measure (MOE): flights dispatched outside the approved weather, energy-reserve or airworthiness limits; target 0 dispatches per quarter; horizon: each quarter from the start of service. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute maxDispatchesOutsideLimitsPerQuarter : Natural = 0;
		}
		requirement <'MGO-009'> 'Goal: every flight within approved limits' {
			doc /* Every flight is planned, dispatched and flown within the approved weather, energy-reserve and airworthiness limits, whatever the schedule pressure. Level: goal. */
			subject enterprise : Context::AeroLinkEnterprise;
			frame Stakeholders::'CON-004';
		}
		requirement <'NEED-001'> 'Short, predictable wait to board' {
			doc /* Passengers need to board within a short and predictable time after confirming a ride, throughout operating hours. Conditions: Throughout the 16 h operating day, including peak hours. Rationale: The wait and its predictability decide whether passengers use the service again (CON-001, A-001). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder passengers : Stakeholders::'STK-001';
			frame Stakeholders::'CON-001';
		}
		requirement <'NEED-002'> 'Assurance of flight within safety limits' {
			doc /* The FAA needs assurance that every flight is conducted within the approved airworthiness, energy and weather limits, including when weather changes during the day. Conditions: For every flight, including when weather changes during the day. Rationale: The regulator must be assured that the operation, not only the aircraft, stays inside the approved envelope (CON-004). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder faa : Stakeholders::'STK-002';
			frame Stakeholders::'CON-004';
			frame Stakeholders::'CON-002';
		}
		requirement <'NEED-003'> 'Noise kept within the local agreement' {
			doc /* Communities near vertiports need take-off and landing noise kept within the limit agreed with the city, at every pad, at all operating hours. Conditions: At every pad, at all operating hours. Rationale: An exceedance puts the vertiport operating permit at risk and erodes community acceptance (CON-012). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder communities : Stakeholders::'STK-004';
			frame Stakeholders::'CON-012';
		}
		requirement <'NEED-004'> 'Pads not limited by turnaround' {
			doc /* Vertiport operators need arriving aircraft to be ready to depart again quickly enough that pad turnaround does not become the throughput limit. Conditions: At peak hours, at every hub vertiport. Rationale: How long an arriving aircraft occupies a pad sets how many departures the pad can support (CON-006). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder vertiportOperators : Stakeholders::'STK-005';
			frame Stakeholders::'CON-006';
		}
		requirement <'NEED-005'> 'Capacity that grows with demand' {
			doc /* Investors need service capacity to grow in step with demand so that capital is neither short when demand arrives nor idle when it does not. Conditions: Throughout the first three years of service, while demand grows. Rationale: Capital tied up in idle assets, or demand turned away for lack of them, erodes the return investors expect (CON-005). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder investors : Stakeholders::'STK-003';
			frame Stakeholders::'CON-005';
		}
		requirement <'NEED-006'> 'Early warning and access for a vertiport fire' {
			doc /* Emergency responders need early warning of, and safe access to, a battery fire at a vertiport. Conditions: At any hour of operation, at every vertiport. Rationale: Lithium battery fires escalate within minutes and need specialist equipment and a safe approach (CON-007). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder emergencyResponders : Stakeholders::'STK-006';
			frame Stakeholders::'CON-007';
		}
		requirement <'NEED-007'> 'Known aircraft condition before release' {
			doc /* Maintenance technicians need the condition of each aircraft to be known before it is released for a flight, regardless of schedule pressure. Conditions: At every release, regardless of schedule pressure. Rationale: Releasing an aircraft whose condition is unknown is the failure technicians most want to prevent (CON-010). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder maintenanceTechnicians : Stakeholders::'STK-009';
			frame Stakeholders::'CON-010';
		}
		requirement <'NEED-008'> 'Unassisted step-free travel' {
			doc /* Passengers who use wheelchairs need to board, travel and alight without being lifted or separated from their mobility aid. Conditions: At every vertiport, throughout operating hours. Rationale: Being lifted is unsafe and undignified and excludes passengers who travel with their own mobility aid (CON-013). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder accessibilityAdvocates : Stakeholders::'STK-014';
			frame Stakeholders::'CON-013';
		}
		requirement <'NEED-009'> 'Flight intent known to the ANSP' {
			doc /* The air navigation service provider needs each flight's intended route and time known before the aircraft enters controlled airspace. Conditions: Whenever a flight will enter controlled airspace. Rationale: The ANSP can separate air-taxi flights from other traffic only if it knows them in advance (CON-008). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder airNavigationServiceProvider : Stakeholders::'STK-007';
			frame Stakeholders::'CON-008';
		}
		requirement <'NEED-010'> 'Charging load within the grid connection' {
			doc /* The electric utility needs the power drawn by each vertiport to stay within the agreed connection capacity at all times. Conditions: At all times, including when several arriving aircraft charge together. Rationale: Exceeding the agreed connection trips protection or incurs penalty tariffs (CON-011). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder electricUtility : Stakeholders::'STK-010';
			frame Stakeholders::'CON-011';
		}
		requirement <'NEED-011'> 'Prompt notice and a way onward when a trip is disrupted' {
			doc /* Passengers need prompt notice whenever their trip is held, diverted or cancelled, and a usable alternative way to complete their journey. Conditions: Whenever a confirmed trip is held, diverted or cancelled, including during weather holds and region-wide suspensions. Rationale: A passenger left waiting without news or a way onward loses more time and trust than one told early and offered an alternative (CON-001; exposed by SCN-005 step 5). */
			subject enterprise : Context::AeroLinkEnterprise;
			stakeholder passengers : Stakeholders::'STK-001';
			frame Stakeholders::'CON-001';
		}
		action def <'CAP-001'> 'On-demand passenger transport' { doc /* Carry a booked party of 1-4 passengers between any two vertiports of the network on demand. */ }
		action def <'CAP-002'> 'Ride booking and dispatch' { doc /* Accept a ride request, match it to a dispatch-ready aircraft and release the flight (part of CAP-001). */ }
		action def <'CAP-003'> 'Fleet charging management' { doc /* Return arriving aircraft to a dispatch-ready energy state within the turnaround time at hub vertiports. */ }
		action def <'CAP-004'> 'Flight operations within safety limits' { doc /* Plan, coordinate and fly each flight within approved airworthiness, energy-reserve and airspace limits. */ }
		action def <'CAP-005'> 'Weather-aware operations' { doc /* Detect weather approaching limits and hold, divert or recover flights accordingly (part of CAP-004). */ }
		action def <'CAP-006'> 'Fleet health management' { doc /* Know the condition of each aircraft and its battery, and withhold unfit aircraft from dispatch. */ }
		action def <'CAP-007'> 'Noise-managed vertiport operations' { doc /* Operate take-offs and landings so that pad-edge noise stays within the local agreement. */ }
		action def <'CAP-008'> 'Capacity planning' { doc /* Forecast demand and plan fleet and charging capacity to meet it. */ }
		action def <'CAP-009'> 'Incident response support' { doc /* Detect vertiport incidents and give emergency responders warning and safe access. */ }
		action def <'CAP-010'> 'Charging power control' { doc /* Schedule and limit charging power so that each vertiport stays within its grid connection (part of CAP-003). */ }
	}
	package Requirements {
		doc /* REQ-STK (stakeholder) and REQ-SYS (system) requirements with subject, ID, statement and, where quantitative, a require constraint (L10 / CP4). Groups: stakeholderRequirements and systemRequirements. */
		metadata def RequirementAttributes {
			attribute level : String;
			attribute requirementType : String;
			attribute method : VerificationMethodKind;
			attribute criterion : String;
		}
		requirement <'REQ-STK-001'> 'Passenger wait to board' {
			doc /* The AeroLink service shall board at least 90 % of passengers in each calendar month within 15 min of their ride confirmation. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute maxWaitP90 : DurationValue = 15 [min];
			require constraint { enterprise.passengerWaitP90 <= maxWaitP90 }
			@RequirementAttributes { level = "stakeholder"; requirementType = "performance"; method = VerificationMethodKind::analyze; criterion = "90th-percentile confirmation-to-boarding time <= 15 min per calendar month"; }
			@Rationale { text = "Attraction to the service halves at a 15 min wait (A-001); controlling the 90th percentile protects the passengers most likely to churn, not just the average."; }
		}
		requirement <'REQ-STK-002'> 'Pad-edge noise limit' {
			doc /* The AeroLink service shall keep every take-off and landing at or below 65 dBA LAmax at the pad edge of each vertiport. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute noiseLimit : SoundPressureLevelValue = 65 [dB];
			require constraint { enterprise.maxPadEdgeNoise <= noiseLimit }
			@RequirementAttributes { level = "stakeholder"; requirementType = "constraint"; method = VerificationMethodKind::test; criterion = "LAmax <= 65 dBA at the pad edge for every movement"; }
			@Rationale { text = "The 65 dBA limit is the local agreement with the city; an exceedance puts the operating permit of the vertiport at risk."; }
		}
		requirement <'REQ-STK-003'> 'No dispatch outside weather limits' {
			doc /* The AeroLink service shall not dispatch a flight when the forecast at its departure or arrival vertiport exceeds the approved aircraft weather limits (TBD-01). */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute weatherLimits : Real[0..*] { doc /* TBD-01: approved crosswind, gust and visibility limits (U-001). */ }
			require constraint { enterprise.dispatchesBeyondWeatherLimits == 0 }
			@RequirementAttributes { level = "stakeholder"; requirementType = "functional"; method = VerificationMethodKind::demo; criterion = "Zero dispatches with a forecast beyond TBD-01 at either end (limits pending U-001)"; }
			@Rationale { text = "Weather beyond the approved limits removes the margin the certification basis assumes; the FAA needs assurance that the operation, not just the aircraft, respects those limits."; }
			@StatusInfo { status = StatusKind::tbd; owner = "Director of Flight Operations"; } // TBD-01, closed by U-001
		}
		requirement <'REQ-STK-004'> 'Network capacity by month 24' {
			doc /* The AeroLink service shall provide a capacity of at least 300 trips per day across the six-vertiport network within the 16 h operating day by month 24. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute minCapacity : Real = 300 { doc /* trips/day by month 24 */ }
			require constraint { enterprise.networkCapacity >= minCapacity }
			@RequirementAttributes { level = "stakeholder"; requirementType = "performance"; method = VerificationMethodKind::analyze; criterion = "Network capacity >= 300 trips/day by month 24"; }
			@Rationale { text = "Serving the 240 trips/day planning demand at no more than 80 % utilisation keeps the queue-driven wait near 10 min (Week 1 dynamics model); 240 / 0.8 = 300."; }
		}
		requirement <'REQ-STK-005'> 'Hub turnaround time' {
			doc /* The AeroLink service shall return an aircraft arriving at a hub vertiport to dispatch-ready status within 25 min of its arrival on the pad. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute maxTurnaround : DurationValue = 25 [min];
			require constraint { enterprise.hubTurnaroundTime <= maxTurnaround }
			@RequirementAttributes { level = "stakeholder"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "Pad arrival to dispatch-ready <= 25 min"; }
			@Rationale { text = "Turnaround time sets how many departures a pad can support; 25 min is the 20 min Data Sheet charge plus 5 min for rotor stop, safety check, connection and disconnection, with deplaning and boarding overlapping the charge."; }
		}
		requirement <'REQ-STK-006'> 'No dispatch with an open no-go fault' {
			doc /* The AeroLink service shall confirm that an aircraft has no open no-go fault before each dispatch. */
			subject enterprise : Context::AeroLinkEnterprise;
			require constraint { enterprise.dispatchesWithOpenNoGoFault == 0 }
			@RequirementAttributes { level = "stakeholder"; requirementType = "functional"; method = VerificationMethodKind::demo; criterion = "Dispatch blocked in 100 % of demonstrated cases with an open no-go fault"; }
			@Rationale { text = "Technicians need the aircraft condition to be known before release whatever the schedule pressure; a dispatch interlock removes the judgement call from the turnaround."; }
		}
		requirement <'REQ-STK-007'> 'Step-free boarding' {
			doc /* The AeroLink service shall allow a passenger using a wheelchair to board and alight at every vertiport without being lifted. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute vertiportsRequired : Natural = 6;
			require constraint { enterprise.stepFreeVertiports >= vertiportsRequired }
			@RequirementAttributes { level = "stakeholder"; requirementType = "constraint"; method = VerificationMethodKind::inspect; criterion = "Step-free route from terminal to cabin at all 6 vertiports"; }
			@Rationale { text = "Lifting a passenger is unsafe and undignified and excludes passengers who travel with their own mobility aid."; }
		}
		requirement <'REQ-STK-008'> 'Responder alert time' {
			doc /* The AeroLink service shall alert emergency responders to a battery fire on a vertiport pad within 60 s of detection. */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute maxAlertTime : DurationValue = 60 [s];
			require constraint { enterprise.responderAlertTime <= maxAlertTime }
			@RequirementAttributes { level = "stakeholder"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "Detection-to-responder-alert <= 60 s"; }
			@Rationale { text = "Lithium battery fires escalate within minutes; an early alert lets responders arrive with the right equipment."; }
		}
		requirement <'REQ-STK-009'> 'Flight intent to the ANSP' {
			doc /* The AeroLink service shall provide each flight's intended route and departure time to the air navigation service provider before take-off. */
			subject enterprise : Context::AeroLinkEnterprise;
			require constraint { enterprise.flightIntentAcceptedBeforeTakeOff }
			@RequirementAttributes { level = "stakeholder"; requirementType = "interface"; method = VerificationMethodKind::demo; criterion = "Intent accepted by the ANSP for 100 % of demonstrated departures before take-off"; }
			@Rationale { text = "The ANSP must know each flight before it enters controlled airspace to separate it from other traffic."; }
		}
		requirement <'REQ-STK-010'> 'Vertiport power within the grid connection' {
			doc /* The AeroLink service shall keep the total charging power drawn at each vertiport within the connection capacity agreed with the utility (TBD-02 kW). */
			subject enterprise : Context::AeroLinkEnterprise;
			attribute connectionLimit : PowerValue { doc /* TBD-02 kW, pending U-002. */ }
			require constraint { enterprise.peakVertiportChargingPower <= connectionLimit }
			@RequirementAttributes { level = "stakeholder"; requirementType = "constraint"; method = VerificationMethodKind::test; criterion = "Peak vertiport charging power <= TBD-02 kW (pending U-002)"; }
			@Rationale { text = "Exceeding the agreed connection trips protection or incurs penalty tariffs and erodes the relationship with the utility."; }
			@StatusInfo { status = StatusKind::tbd; owner = "Vertiport Infrastructure Manager"; } // TBD-02, closed by U-002
		}
		requirement <'REQ-SYS-001'> 'Charge to dispatch threshold in 20 min' {
			doc /* The charging system shall charge an aircraft from any landing state of charge at or above the 20 % reserve to the dispatch threshold within 20 min. */
			subject chargingSystem : Physical::ChargingSystems;
			attribute maxChargeTime : DurationValue = 20 [min];
			require constraint { chargingSystem.chargeTimeToDispatch <= maxChargeTime }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "Charge time from 20 % reserve to dispatch threshold <= 20 min"; }
			@Rationale { text = "The worst planned arrival state is the 20 % reserve that every flight plan protects (REQ-SYS-003); meeting 20 min from that state keeps the 25 min hub turnaround of REQ-STK-005 achievable. An aircraft that diverts or holds within the reserve can arrive below 20 %; its turnaround is not covered by this requirement and needs its own allowance (open point for the graduate memo)."; }
		}
		requirement <'REQ-SYS-002'> 'Aircraft pad-edge noise' {
			doc /* The eVTOL aircraft shall produce no more than 65 dBA LAmax at the pad edge during take-off and landing on the published vertiport procedures. */
			subject aircraft : Physical::EVTOLAircraft;
			attribute noiseLimit : SoundPressureLevelValue = 65 [dB];
			require constraint { aircraft.padEdgeNoise <= noiseLimit }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "LAmax <= 65 dBA at the pad edge, every measured movement"; }
			@Rationale { text = "The aircraft is the noise source; allocating the whole community limit to it keeps the vertiport free of noise-abatement infrastructure."; }
		}
		requirement <'REQ-SYS-003'> 'Planned landing energy reserve' {
			doc /* The flight planning function shall plan every flight so that the aircraft lands with at least 20 % of its usable battery energy remaining. */
			subject flightPlanning : Logical::FlightOperations;
			attribute minLandingEnergyFraction : Real = 0.20;
			require constraint { flightPlanning.plannedLandingEnergyFraction >= minLandingEnergyFraction }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::analyze; criterion = "Planned landing energy >= 20 % of usable energy, every flight plan"; }
			@Rationale { text = "The 20 % reserve (Data Sheet) covers a hold or a diversion to the nearest open vertiport in SCN-002 A1 and SCN-005 A1. It derives directly from CAP-004 because no stakeholder requirement carries the energy-planning obligation: the regulator's need (NEED-002) is met at service level by REQ-STK-003, and the reserve is the flight-planning function's own contribution to it."; }
		}
		requirement <'REQ-SYS-004'> 'Weather dispatch hold' {
			doc /* The operations system shall place a dispatch hold on any vertiport whose forecast wind or gust within the next 30 min exceeds the aircraft limit (TBD-01). */
			subject operationsSystem : Logical::DecisionSupport;
			attribute forecastHorizon : DurationValue = 30 [min];
			attribute windLimit : SpeedValue { doc /* TBD-01, pending U-001. */ }
			require constraint { operationsSystem.holdPlacedForEveryExceedance }
			@RequirementAttributes { level = "system"; requirementType = "functional"; method = VerificationMethodKind::demo; criterion = "Hold placed for every injected forecast above TBD-01 (pending U-001)"; }
			@Rationale { text = "A vertiport-level hold implements REQ-STK-003 before a flight is dispatched, rather than relying on each operator's judgement."; }
			@StatusInfo { status = StatusKind::tbd; owner = "Director of Flight Operations"; } // TBD-01, closed by U-001
		}
		requirement <'REQ-SYS-005'> 'Aircraft assignment time' {
			doc /* The scheduling function shall assign a dispatch-ready aircraft to at least 99 % of confirmed ride requests within 60 s of confirmation. */
			subject scheduling : Logical::Scheduling;
			attribute maxAssignmentLatency : DurationValue = 60 [s];
			require constraint { scheduling.assignmentLatencyP99 <= maxAssignmentLatency }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "Confirmation-to-assignment <= 60 s for at least 99 % of at least 200 requests in a replayed peak-hour request profile"; }
			@Rationale { text = "Assignment must be a negligible part of the 15 min wait budget (REQ-STK-001) so that the remaining time is set by aircraft and charger availability."; }
		}
		requirement <'REQ-SYS-006'> 'Fleet availability' {
			doc /* The fleet shall achieve an availability of at least 90 % of scheduled aircraft-hours in each calendar month. */
			subject fleet : Logical::FleetManagement;
			attribute minAvailability : Real = 0.90;
			require constraint { fleet.fleetAvailability >= minAvailability }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::analyze; criterion = "Available aircraft-hours / scheduled aircraft-hours >= 90 % per month"; }
			@Rationale { text = "The planning rate of 20 trips per aircraft per day assumes 90 % availability (43 min cycle); lower availability removes capacity needed for REQ-STK-004."; }
		}
		requirement <'REQ-SYS-007'> 'Block time for the design trip' {
			doc /* The eVTOL aircraft shall complete a 25 km vertiport-to-vertiport trip within 16 min block time in still air. */
			subject aircraft : Physical::EVTOLAircraft;
			attribute designTripDistance : LengthValue = 25 [km];
			attribute maxBlockTime : DurationValue = 16 [min];
			require constraint { aircraft.designTripBlockTime <= maxBlockTime }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "Block time <= 16 min for a 25 km trip, still air"; }
			@Rationale { text = "Block time drives the 43 min aircraft cycle and therefore the capacity of REQ-STK-004 (25 km at 150 km/h = 10 min cruise plus 6 min terminal phases; cycle = 16 min block + 25 min turnaround + 2 min positioning)."; }
		}
		requirement <'REQ-SYS-008'> 'No-go fault flag time' {
			doc /* The maintenance management function shall mark an aircraft unavailable for dispatch within 2 min of a no-go fault being reported. */
			subject maintenanceManagement : Logical::MaintenanceManagement;
			attribute maxFlagLatency : DurationValue = 2 [min];
			require constraint { maintenanceManagement.noGoFlagLatency <= maxFlagLatency }
			@RequirementAttributes { level = "system"; requirementType = "performance"; method = VerificationMethodKind::test; criterion = "Fault report to unavailable status <= 2 min"; }
			@Rationale { text = "Assignment (REQ-SYS-005) is not release: release follows boarding and the pre-departure check, which take at least 5 min after assignment (FICTIONAL). A 2 min flag therefore removes a faulted aircraft from the pool before it can be released; the REQ-STK-006 interlock also reads open fault reports directly at release, so the flag is not the only barrier."; }
		}
		requirement <'REQ-SYS-009'> 'Fire alarm transmission' {
			doc /* The vertiport fire detection system shall transmit a battery-fire alarm to the emergency services dispatch centre within 30 s of detection. */
			subject fireDetection : Physical::PadFireDetectionSystem;
			attribute maxTransmissionTime : DurationValue = 30 [s];
			require constraint { fireDetection.alarmTransmissionTime <= maxTransmissionTime }
			@RequirementAttributes { level = "system"; requirementType = "interface"; method = VerificationMethodKind::test; criterion = "Detection to receipt at the dispatch centre <= 30 s"; }
			@Rationale { text = "Transmission takes half of the 60 s alert budget of REQ-STK-008, leaving the rest for the dispatch centre to alert crews."; }
		}
		requirement <'REQ-SYS-010'> 'Vertiport charging power limit' {
			doc /* The charging system shall limit the combined power of all chargers at a vertiport to the configured connection limit (TBD-02 kW). */
			subject chargingSystem : Physical::ChargingSystems;
			attribute connectionLimit : PowerValue { doc /* TBD-02 kW, pending U-002. */ }
			require constraint { chargingSystem.peakVertiportChargingPower <= connectionLimit }
			@RequirementAttributes { level = "system"; requirementType = "constraint"; method = VerificationMethodKind::test; criterion = "Combined charger power <= configured limit under every tested load case (limit pending U-002)"; }
			@Rationale { text = "Enforcing the limit in the charging system, not by procedure, keeps REQ-STK-010 met when several aircraft arrive together."; }
			@StatusInfo { status = StatusKind::tbd; owner = "Vertiport Infrastructure Manager"; } // TBD-02, closed by U-002
		}
		requirement stakeholderRequirements {
			doc /* Requirement group: the ten stakeholder requirements. */
			subject enterprise : Context::AeroLinkEnterprise;
			require 'REQ-STK-001';
			require 'REQ-STK-002';
			require 'REQ-STK-003';
			require 'REQ-STK-004';
			require 'REQ-STK-005';
			require 'REQ-STK-006';
			require 'REQ-STK-007';
			require 'REQ-STK-008';
			require 'REQ-STK-009';
			require 'REQ-STK-010';
		}
		requirement systemRequirements {
			doc /* Requirement group: the ten system requirements. Each has its own subject, so the group has none. */
			require 'REQ-SYS-001';
			require 'REQ-SYS-002';
			require 'REQ-SYS-003';
			require 'REQ-SYS-004';
			require 'REQ-SYS-005';
			require 'REQ-SYS-006';
			require 'REQ-SYS-007';
			require 'REQ-SYS-008';
			require 'REQ-SYS-009';
			require 'REQ-SYS-010';
		}
	}
	package Logical {
		doc /* FN as action usages, LOG elements and AI capabilities as parts of the logical architecture; perform realises LOG/AI performs FN (L8 / CP3). */
		metadata def AIEnabledCapability {
			attribute inputs : String;
			attribute outputs : String;
			attribute humanOversight : String;
			attribute failureMode : String;
		}
		action <'FN-001'> 'Accept ride request' { doc /* Receive origin, destination and party size; quote fare and boarding-time estimate; confirm the booking. */ }
		action <'FN-002'> 'Match request to aircraft' { doc /* Select a dispatch-ready aircraft and time slot for a confirmed request. */ }
		action <'FN-003'> 'Plan flight' { doc /* Produce a route and energy plan that lands with at least the reserve. */ }
		action <'FN-004'> 'Assess dispatch weather' { doc /* Compare vertiport forecasts with the weather limits and place or lift dispatch holds. */ }
		action <'FN-005'> 'Fly passenger trip' { doc /* Take off, cruise, approach and land on the published procedures. */ }
		action <'FN-006'> 'Charge aircraft' { doc /* Restore battery energy to the dispatch threshold during the turnaround. */ }
		action <'FN-007'> 'Control vertiport charging power' { doc /* Share the vertiport connection limit among active charging sessions. */ }
		action <'FN-008'> 'Assess aircraft health' { doc /* Classify reported and predicted faults as go / no-go and set aircraft availability. */ }
		action <'FN-009'> 'Manage fleet availability' { doc /* Plan maintenance slots and spare aircraft so that scheduled aircraft-hours are met. */ }
		action <'FN-010'> 'Detect and report pad fire' { doc /* Detect a battery fire on a pad and alert emergency services. */ }
		action <'FN-011'> 'Dispatch aircraft' { doc /* Release an assigned aircraft for flight after the go / no-go interlock and weather-hold checks. */ }
		action <'FN-012'> 'Coordinate flight intent' { doc /* Exchange route and timing with the air navigation service provider before departure. */ }
		action <'FN-013'> 'Forecast demand' { doc /* Forecast trips per vertiport pair and hour for scheduling and capacity planning. */ }
		action <'FN-014'> 'Board and alight passengers' { doc /* Move passengers, including wheelchair users, between terminal and cabin. */ }
		part def FlightOperations {
			#mop attribute <'MOP-005'> plannedLandingEnergyFraction : Real { doc /* Landing energy remaining: Usable battery energy remaining at landing, as a share of usable energy. Unit: %; threshold 20; higher-is-better. Modelled as a fraction 0..1. */ }
		}
		part def FleetManagement {
			#mop attribute <'MOP-006'> fleetAvailability : Real { doc /* Fleet availability: Available aircraft-hours divided by scheduled aircraft-hours in a calendar month. Unit: %; threshold 90; higher-is-better. Modelled as a fraction 0..1. */ }
		}
		part def MaintenanceManagement {
			#mop attribute <'MOP-007'> noGoFlagLatency : DurationValue { doc /* No-go fault flag latency: Time from a no-go fault report to the aircraft being marked unavailable for dispatch. Unit: min; threshold 2; lower-is-better. */ }
		}
		part def CustomerServices;
		part def Scheduling {
			#mop attribute <'MOP-001'> assignmentLatencyP99 : DurationValue { doc /* Aircraft assignment latency: Time from ride confirmation to aircraft assignment (99th percentile). Unit: s; threshold 60; lower-is-better. */ }
		}
		part def DecisionSupport {
			attribute holdPlacedForEveryExceedance : Boolean;
		}
		part def VertiportOperations;
		part def AICapability;
		part logicalArchitecture {
			part <'LOG-001'> flightOperations : FlightOperations {
				doc /* Plans and conducts flights and coordinates with the ANSP. */
				attribute :>> plannedLandingEnergyFraction = 0.23; // current estimate (TPM-003, FICTIONAL)
				perform Logical::'FN-003';
				perform Logical::'FN-005';
				perform Logical::'FN-012';
			}
			part <'LOG-002'> fleetManagement : FleetManagement {
				doc /* Manages fleet energy, charging and availability. */
				perform Logical::'FN-006';
				perform Logical::'FN-007';
				perform Logical::'FN-009';
			}
			part <'LOG-003'> maintenanceManagement : MaintenanceManagement {
				doc /* Assesses aircraft health and controls release to service. */
				perform Logical::'FN-008';
			}
			part <'LOG-004'> customerServices : CustomerServices {
				doc /* Handles passenger booking, information and payment. */
				perform Logical::'FN-001';
			}
			part <'LOG-005'> scheduling : Scheduling {
				doc /* Assigns aircraft to requests and dispatches flights. */
				perform Logical::'FN-002';
				perform Logical::'FN-011';
			}
			part <'LOG-006'> decisionSupport : DecisionSupport {
				doc /* Provides weather assessment and demand forecasts to operational and planning decisions. */
				perform Logical::'FN-004';
				perform Logical::'FN-013';
			}
			part <'LOG-007'> vertiportOperations : VertiportOperations {
				doc /* Runs passenger flow and pad safety at the vertiports, including fire detection and responder alerting. */
				perform Logical::'FN-010';
				perform Logical::'FN-014';
			}
			part <'AI-001'> predictiveMaintenance : AICapability {
				doc /* Predicts component and battery degradation from maintenance and charge-session data so that faults are found before they ground an aircraft. */
				perform Logical::'FN-008';
				@AIEnabledCapability { inputs = "INFO-003 maintenance data incl. cell temperatures and capacity trends"; outputs = "Ranked list of aircraft and packs at risk, with predicted time to limit"; humanOversight = "A certifying technician decides every withdrawal; the model never releases an aircraft"; failureMode = "Missed prediction leaves the reactive FN-008 path as the safety net; false alarms cost availability (MOP-006)"; }
			}
			part <'AI-002'> demandForecasting : AICapability {
				doc /* Forecasts trips per vertiport pair and hour from booking history for scheduling and capacity planning. */
				perform Logical::'FN-013';
				@AIEnabledCapability { inputs = "INFO-001 passenger and booking history, calendar, weather outlook"; outputs = "Hourly demand forecast; Year-2 demand re-forecast (A-006)"; humanOversight = "Network planning reviews forecasts quarterly before they feed DEC-001"; failureMode = "Over-forecast strands capital; under-forecast repeats the Week 1 charging-limit (Limits to Growth) problem (R-001)"; }
			}
		}
	}
	package Physical {
		doc /* PHY part definitions and the physical architecture usage aeroLink (system of interest); ports, interfaces (IF) and item flows (INFO) from v0.2. */
		// Information items (INFO) and other items carried by interfaces.
		item def <'INFO-001'> 'Passenger Information' {
			doc /* Ride requests, party size, accessibility needs, confirmation and boarding timestamps. Producer: PHY-007 booking platform; PHY-002 boarding gates. Consumer: PHY-004 scheduling; AI-002. Decision supported: Which aircraft to assign to a request, and when (REQ-SYS-005); wait monitoring (MOE-001). */
			attribute partySize : Natural;
			attribute accessibilityNeed : Boolean;
			attribute confirmationTime : TimeValue;
			attribute boardingTime : TimeValue;
		}
		item def <'INFO-002'> 'Flight Data' {
			doc /* Flight plan, position, energy state, landing energy, and health and fault reports for each flight. Producer: PHY-001 aircraft. Consumer: PHY-004 flight following; PHY-005 maintenance (health and fault reports). Decision supported: Whether the next leg can be dispatched with the energy reserve (REQ-SYS-003). */
			attribute plannedLandingEnergyFraction : Real;
			attribute landingEnergyFraction : Real;
			attribute blockTime : DurationValue;
		}
		item def <'INFO-003'> 'Maintenance Data' {
			doc /* Fault reports, deferrals, work orders, release-to-service records and battery charge-session data. Producer: PHY-005 maintenance facility; PHY-003 charge-session records. Consumer: PHY-004 dispatch; AI-001. Decision supported: Release or withhold an aircraft (REQ-STK-006, REQ-SYS-008). Relay: PHY-003 > PHY-004 > PHY-005 over IF-010 and IF-012: charge-session records to AI-001 at the maintenance facility. */
			attribute noGoFaultOpen : Boolean;
			attribute cellTemperature : ThermodynamicTemperatureValue;
			attribute chargedEnergy : EnergyValue;
		}
		item def <'INFO-004'> 'Weather Data' {
			doc /* Observed and forecast wind, gust and visibility at each vertiport. Producer: EXT-003 weather (via weather service). Consumer: PHY-004 decision support. Decision supported: Place or lift a vertiport dispatch hold (REQ-SYS-004). */
			attribute windSpeed : SpeedValue;
			attribute gustSpeed : SpeedValue;
			attribute visibility : LengthValue;
		}
		item def <'INFO-005'> 'Financial Data' {
			doc /* Fare revenue, operating cost and capital spend by vertiport and aircraft. Producer: PHY-007 fare revenue; LOG-002 operating cost. Consumer: DEC-001 capacity investment. Decision supported: How much capacity to add and when (DEC-001). */
			attribute fareRevenue : Real { doc /* USD */ }
			attribute capitalSpend : Real { doc /* USD M */ }
		}
		item def PadLoads { attribute landingLoad : ForceValue; }
		item def ElectricalEnergy { attribute energy : EnergyValue; attribute power : PowerValue; }
		item def FlightIntent { attribute route : String; attribute departureTime : TimeValue; }
		item def WorkOrder { attribute aircraftId : String; attribute releaseToService : Boolean; }
		item def FireAlarm { attribute padLocation : String; }
		item def PadSlotAllocation { attribute slotStart : TimeValue; attribute slotLength : DurationValue; }
		// Port definitions (direction is from the producing side; the consuming side uses the conjugate ~).
		port def AircraftPadPort { out item loads : PadLoads; }
		port def ChargingPort { out item energy : ElectricalEnergy; }
		port def GridPowerPort { out item energy : ElectricalEnergy; }
		port def FlightDataPort { out item flightData : 'INFO-002'; }
		port def PassengerInfoPort { out item passengerInfo : 'INFO-001'; }
		port def MaintenanceDataPort { out item maintenanceData : 'INFO-003'; }
		port def WeatherDataPort { out item weather : 'INFO-004'; }
		port def FlightIntentPort { out item intent : FlightIntent; }
		port def WorkOrderPort { out item workOrder : WorkOrder; }
		port def FireAlarmPort { out item alarm : FireAlarm; }
		port def PadSlotPort { out item slots : PadSlotAllocation; }
		// Interface definitions; IF usages carry the course IDs.
		interface def AircraftPadInterface { end aircraftSide : AircraftPadPort; end padSide : ~AircraftPadPort; }
		interface def AircraftDatalink { end aircraftSide : FlightDataPort; end groundSide : ~FlightDataPort; }
		interface def FlightIntentExchange { end operatorSide : FlightIntentPort; end anspSide : ~FlightIntentPort; }
		interface def WorkOrderHandover { end operationsSide : WorkOrderPort; end maintenanceSide : ~WorkOrderPort; }
		interface def AircraftChargerPower { end chargerSide : ChargingPort; end aircraftSide : ~ChargingPort; }
		interface def GridConnection { end gridSide : GridPowerPort; end chargerSide : ~GridPowerPort; }
		interface def FireAlarmLink { end alarmSide : FireAlarmPort; end responderSide : ~FireAlarmPort; }
		interface def BookingInterface { end bookingSide : PassengerInfoPort; end operationsSide : ~PassengerInfoPort; }
		interface def PadSlotAgreement { end vertiportSide : PadSlotPort; end operationsSide : ~PadSlotPort; }
		interface def ChargeSessionDataLink { end chargerSide : MaintenanceDataPort; end operationsSide : ~MaintenanceDataPort; }
		interface def WeatherDataLink { end weatherSide : WeatherDataPort; end operationsSide : ~WeatherDataPort; }
		interface def MaintenanceDataLink { end maintenanceSide : MaintenanceDataPort; end operationsSide : ~MaintenanceDataPort; }
		interface def AircraftHealthDataLink { end aircraftSide : FlightDataPort; end maintenanceSide : ~FlightDataPort; }
		interface def VertiportDataLink { end vertiportSide : PassengerInfoPort; end operationsSide : ~PassengerInfoPort; }
		part def EVTOLAircraft {
			attribute seats : Natural = 4;
			attribute cruiseSpeed : SpeedValue = 150 [km/h];
			#mop attribute <'MOP-003'> designTripBlockTime : DurationValue { doc /* Block time for the 25 km design trip: Gate-to-gate time for a 25 km trip in still air. Unit: min; threshold 16; lower-is-better. */ }
			#mop attribute <'MOP-004'> padEdgeNoise : SoundPressureLevelValue { doc /* Pad-edge noise level: Maximum A-weighted sound level (LAmax) at the pad edge during take-off and landing. Unit: dBA; threshold 65; lower-is-better. */ }
			port padPort : AircraftPadPort;
			port chargeInlet : ~ChargingPort;
			port datalink : FlightDataPort;
			port healthDataOut : FlightDataPort;
		}
		part def VertiportNetwork {
			attribute sites : Natural = 6;
			attribute hubs : Natural = 3;
			attribute spokes : Natural = 3;
			attribute hubTurnaroundTime : DurationValue;
			attribute stepFreeRouteAtEverySite : Boolean;
			port padPort : ~AircraftPadPort;
			port boardingDataOut : PassengerInfoPort;
			port padSlots : PadSlotPort;
		}
		part def ChargingSystems {
			attribute installed : Natural = 12;
			attribute highPowerAtHubs : Natural = 6;
			attribute standardAtSpokes : Natural = 6;
			attribute chargesPerChargerPerDay : Natural = 48;
			attribute connectionLimit : PowerValue { doc /* TBD-02, pending U-002. */ }
			#mop attribute <'MOP-002'> chargeTimeToDispatch : DurationValue { doc /* Charge time to dispatch threshold: Time from charge start at the 20 % reserve state to the dispatch threshold. Unit: min; threshold 20; lower-is-better. */ }
			#mop attribute <'MOP-009'> peakVertiportChargingPower : PowerValue { doc /* Peak vertiport charging power: Highest 1-minute average of combined charger power at a vertiport in a day. Unit: kW; threshold TBD-02; lower-is-better. */ }
			port chargerOutlet : ChargingPort;
			port gridInlet : ~GridPowerPort;
			port sessionDataOut : MaintenanceDataPort;
		}
		part def OperationsCenter {
			attribute sites : Natural = 1;
			attribute hotStandby : Boolean = true; // DEC-002
			attribute operatingDay : DurationValue = 16 [h];
			port flightDataIn : ~FlightDataPort;
			port intentOut : FlightIntentPort;
			port workOrderOut : WorkOrderPort;
			port bookingIn : ~PassengerInfoPort;
			port boardingDataIn : ~PassengerInfoPort;
			port maintenanceDataIn : ~MaintenanceDataPort;
			port weatherIn : ~WeatherDataPort;
			port padSlotsIn : ~PadSlotPort;
			port chargeSessionIn : ~MaintenanceDataPort;
		}
		part def MaintenanceFacility {
			attribute sites : Natural = 1;
			attribute batteryWorkshop : Boolean = true;
			attribute faultReportToFlagTime : DurationValue;
			port flightDataIn : ~FlightDataPort;
			port workOrderIn : ~WorkOrderPort;
			port maintenanceDataOut : MaintenanceDataPort;
		}
		part def CommunicationsInfrastructure {
			attribute media : String = "datalink + ground network";
			attribute messageLatency : DurationValue;
		}
		part def PassengerBookingPlatform {
			attribute maxPartySize : Natural = 4;
			attribute requestToQuoteTime : DurationValue;
			port bookingOut : PassengerInfoPort;
		}
		part def PadFireDetectionSystem {
			attribute padsCovered : String = "all";
			#mop attribute <'MOP-008'> alarmTransmissionTime : DurationValue { doc /* Fire alarm transmission latency: Time from fire detection on a pad to receipt of the alarm at the emergency services dispatch centre. Unit: s; threshold 30; lower-is-better. */ }
			port alarmOut : FireAlarmPort;
		}
		part aeroLink : Context::AeroLinkEnterprise {
			doc /* The AeroLink system of interest: the physical architecture (S04 Lab 6 elements PHY-001..006 plus PHY-007, PHY-008). */
			part <'PHY-001'> aircraft : EVTOLAircraft[12] {
				doc /* eVTOL Aircraft. Four-seat electric vertical take-off and landing aircraft. */
				attribute :>> padEdgeNoise = 63.5 [dB]; // current estimate (TPM-002, FICTIONAL); baseline 12 aircraft, 16 planned (DEC-001)
				exhibit Behavior::aircraftOperatingStates;
			}
			part <'PHY-002'> vertiports : VertiportNetwork {
				doc /* Vertiports. Six vertiports: three hubs with turnaround charging and three spokes. */
			}
			part <'PHY-003'> chargingSystems : ChargingSystems {
				doc /* Charging Systems. Chargers at the vertiports: high-power turnaround chargers at hubs, standard chargers at spokes. */
				attribute :>> chargeTimeToDispatch = 18 [min]; // current estimate (TPM-001, FICTIONAL)
			}
			part <'PHY-004'> operationsCenter : OperationsCenter {
				doc /* Operations Center. Operations centre hosting scheduling, dispatch, flight following and decision support, with a hot standby. */
			}
			part <'PHY-005'> maintenanceFacility : MaintenanceFacility {
				doc /* Maintenance Facility. Maintenance facility with battery workshop and diagnostic tools. */
			}
			part <'PHY-006'> communications : CommunicationsInfrastructure {
				doc /* Communications Infrastructure. Air-ground datalink and ground network connecting aircraft, vertiports, chargers, the maintenance facility and the operations centre. It is the medium of the information interfaces IF-002, IF-010, IF-012, IF-013 and IF-014, not an end of any of them, so it has no interface of its own. */
			}
			part <'PHY-007'> bookingPlatform : PassengerBookingPlatform {
				doc /* Passenger booking platform. Mobile app and booking back end for requests, boarding passes and notifications. */
			}
			part <'PHY-008'> padFireDetection : PadFireDetectionSystem {
				doc /* Pad fire detection and alarm system. Thermal and flame detection at every pad with automatic alarm transmission. */
			}
			// Internal interfaces (IF).
			interface <'IF-001'> aircraftPad : AircraftPadInterface connect 'PHY-001'.padPort to 'PHY-002'.padPort { doc /* Aircraft <-> pad (physical): Landing loads, tie-down and pad markings for take-off and landing. Carries: mechanical loads, position. */ }
			interface <'IF-002'> aircraftOperationsCentreDatalink : AircraftDatalink connect 'PHY-001'.datalink to 'PHY-004'.flightDataIn { doc /* Aircraft <-> operations centre datalink (information): Flight following, energy state and health telemetry over the communications infrastructure (PHY-006). Carries: INFO-002. */ }
			interface <'IF-004'> operationsMaintenanceWorkOrderHandover : WorkOrderHandover connect 'PHY-004'.workOrderOut to 'PHY-005'.workOrderIn { doc /* Operations <-> maintenance work-order handover (organisational): Agreed procedure and responsibilities for withdrawing and returning aircraft to service. Carries: work orders, release to service. */ }
			interface <'IF-005'> aircraftChargerPower : AircraftChargerPower connect 'PHY-003'.chargerOutlet to 'PHY-001'.chargeInlet { doc /* Aircraft <-> charger power (physical): DC charging power and battery-management handshake. Carries: electrical energy, charge state. */ }
			interface <'IF-008'> bookingPlatformOperationsCentre : BookingInterface connect 'PHY-007'.bookingOut to 'PHY-004'.bookingIn { doc /* Booking platform <-> operations centre (information): Confirmed requests to scheduling; assignments and boarding times back to passengers. Carries: INFO-001. */ }
			interface <'IF-009'> vertiportOperatorAeroLinkPadSlotAgreement : PadSlotAgreement connect 'PHY-002'.padSlots to 'PHY-004'.padSlotsIn { doc /* Vertiport operator <-> AeroLink pad-slot agreement (organisational): Organisational agreement allocating pad slots and ground-handling duties at each vertiport. Carries: pad slots, duties. */ }
			interface <'IF-010'> chargerOperationsCentreData : ChargeSessionDataLink connect 'PHY-003'.sessionDataOut to 'PHY-004'.chargeSessionIn { doc /* Charger <-> operations centre data (information): Charge-session records and charge-complete status from the chargers to fleet energy management and dispatch, over the ground network (PHY-006). Carries: INFO-003 charge-session records, charge-complete status. */ }
			interface <'IF-012'> maintenanceOperationsCentreData : MaintenanceDataLink connect 'PHY-005'.maintenanceDataOut to 'PHY-004'.maintenanceDataIn { doc /* Maintenance <-> operations centre data (information): Go / no-go status, aircraft availability and release-to-service records from maintenance to dispatch within the 2 min of REQ-SYS-008, over the ground network (PHY-006); charge-session records relayed on to AI-001. IF-004 remains the agreed procedure. Carries: INFO-003 go / no-go and maintenance status, charge-session records relayed to AI-001. */ }
			interface <'IF-013'> aircraftMaintenanceHealthDataLink : AircraftHealthDataLink connect 'PHY-001'.healthDataOut to 'PHY-005'.flightDataIn { doc /* Aircraft <-> maintenance health data link (information): Health and fault reports from on-board monitoring to the maintenance diagnostic tools over the datalink (PHY-006), so that a no-go fault is flagged without depending on the dispatch platform (R-007). Carries: INFO-002 health and fault reports. */ }
			interface <'IF-014'> vertiportOperationsCentreData : VertiportDataLink connect 'PHY-002'.boardingDataOut to 'PHY-004'.boardingDataIn { doc /* Vertiport <-> operations centre data (information): Boarding timestamps and gate status from the vertiports to scheduling over the ground network (PHY-006). IF-009 remains the pad-slot agreement. Carries: INFO-001 boarding timestamps. */ }
			// Item flows of information (flows-to producer -> INFO -> consumer).
			flow 'PHY-007 flows-to INFO-001 flows-to PHY-004' of 'INFO-001' from 'PHY-007'.bookingOut.passengerInfo to 'PHY-004'.bookingIn.passengerInfo;
			flow 'PHY-002 flows-to INFO-001 flows-to PHY-004' of 'INFO-001' from 'PHY-002'.boardingDataOut.passengerInfo to 'PHY-004'.boardingDataIn.passengerInfo;
			flow 'PHY-001 flows-to INFO-002 flows-to PHY-004' of 'INFO-002' from 'PHY-001'.datalink.flightData to 'PHY-004'.flightDataIn.flightData;
			flow 'PHY-001 flows-to INFO-002 flows-to PHY-005' of 'INFO-002' from 'PHY-001'.healthDataOut.flightData to 'PHY-005'.flightDataIn.flightData;
			flow 'PHY-005 flows-to INFO-003 flows-to PHY-004' of 'INFO-003' from 'PHY-005'.maintenanceDataOut.maintenanceData to 'PHY-004'.maintenanceDataIn.maintenanceData;
			flow 'PHY-003 flows-to INFO-003 flows-to PHY-004' of 'INFO-003' from 'PHY-003'.sessionDataOut.maintenanceData to 'PHY-004'.chargeSessionIn.maintenanceData;
			// Behaviour performed by the system of interest.
			perform Behavior::'SCN-002';
		}
	}
	package Behavior {
		doc /* SCN as use cases (actors realise STK/EXT performs SCN); from v0.3 SCN-002 as an action flow and the aircraft operating states. */
		use case <'SCN-001'> 'Passenger Ride Request' {
			doc /* A passenger requests a ride and receives a confirmed booking with an assigned aircraft and boarding time. Kind: nominal (official S04 Lab 7 SCN-001). Trigger: A passenger asks for a ride between two vertiports. Actors: STK-001 (primary); Customer services agent. Preconditions: The passenger has an account; the request is made within the 16 h operating day; at least one aircraft in the network is dispatch-ready. Main flow: 1. STK-001: Enters the origin and destination vertiports and the party size (1-4). 2. AeroLink (system of interest): Checks weather status and capacity at both vertiports. 3. AeroLink (system of interest): Quotes the fare and an estimated boarding time. 4. STK-001: Confirms the booking. 5. AeroLink (system of interest): Assigns a dispatch-ready aircraft within 60 s of confirmation. 6. AeroLink (system of interest): Issues a boarding pass with the pad and the boarding time. Alternate flows: A1 (step 2): no aircraft can board the party within 15 min - Offer the next available slot or a waitlist. Rejoin at step 3. A2 (step 2): the destination vertiport is under a weather hold (SCN-005) - Offer the nearest open vertiport, or decline the request with the reason recorded. Scenario ends. A3 (step 4): the party includes a wheelchair user who asks for assistance - The customer services agent confirms the step-free route at both vertiports and completes the booking with the passenger. Rejoin at step 5. */
			subject enterprise : Context::AeroLinkEnterprise;
			actor passengers : Stakeholders::'STK-001'; // STK-001 performs SCN-001
			objective { doc /* End state: Success: Confirmed booking with an assigned aircraft and a boarding time. Failure/degraded: Request declined, with the reason recorded and an alternative offered. */ }
		}
		use case <'SCN-002'> 'Passenger Transport Mission' {
			doc /* Nominal flight: a booked party is flown 25 km between two vertiports and the aircraft is handed to charging. Kind: nominal (official S04 Lab 7 SCN-002). Trigger: The boarding time of a confirmed booking (SCN-001) is reached. Actors: STK-001 (primary); STK-008; EXT-001; STK-005. Preconditions: Booking confirmed; aircraft dispatch-ready (charged to the dispatch threshold, no open no-go fault); forecast weather within limits at both vertiports. Main flow: 1. AeroLink (system of interest): Plans the flight with at least 20 % usable energy at landing. 2. AeroLink (system of interest): Files the flight intent with the ANSP. 3. EXT-001: Accepts the flight intent. 4. STK-005: Boards the party step-free at the departure pad. 5. STK-008: Takes off within the pad-edge noise limit and cruises for about 10 min at 150 km/h. 6. STK-008: Approaches and lands at the destination pad. 7. STK-001: Deplane at the destination; the aircraft passes to charging (SCN-003). Alternate flows: A1 (step 6): the destination pad is occupied - Hold, or divert to the nearest open vertiport within the energy reserve. Rejoin at step 7. A2 (step 4): a passenger does not show - Depart on time with the remaining party. Rejoin at step 5. A3 (step 3): the ANSP does not accept the flight intent - Hold the departure and re-file; if no acceptance is given, cancel and re-accommodate the party. Scenario ends. */
			subject enterprise : Context::AeroLinkEnterprise;
			actor pilotsRemoteOperators : Stakeholders::'STK-008'; // STK-008 performs SCN-002
			objective { doc /* End state: Success: Passengers delivered; flight data logged; the aircraft on the destination pad with at least 20 % usable energy remaining. Failure/degraded: Flight not flown, or landed at an alternate vertiport, with the party re-accommodated and no flight outside limits. */ }
			// Action flow (v0.3), numbered as the SCN-002 main flow. Steps 1, 2, 4 and 5 are performances of the logical
			// functions they subset.
			attribute flightIntentAccepted : Boolean { doc /* Step 3: EXT-001 accepts the flight intent. */ }
			attribute allPassengersPresent : Boolean;
			attribute destinationPadFree : Boolean;
			attribute holdWithinReserve : Boolean { doc /* A hold keeps at least the 20 % landing reserve (REQ-SYS-003). */ }
			first start;
			then action planFlight :> Logical::'FN-003' { doc /* 1. Plan the flight with at least 20 % usable energy at landing. */ }
			then action fileFlightIntent :> Logical::'FN-012' { doc /* 2. File the flight intent with the ANSP (IF-003). */ }
			then decide intentCheck;
				if flightIntentAccepted then boardPassengers;
				else holdAndRefile;
			action holdAndRefile { doc /* A3 (step 3): the ANSP does not accept the flight intent; hold the departure and re-file; if no acceptance is given, cancel and re-accommodate the party. Scenario ends. */ }
			then done;
			action boardPassengers :> Logical::'FN-014' { doc /* 4. Board the party step-free at the departure pad. */ }
			then decide partyCheck;
				if allPassengersPresent then departureReady;
				else departWithRemainingParty;
			action departWithRemainingParty { doc /* A2 (step 4): a passenger does not show; depart on time with the remaining party. Rejoin at step 5. */ }
			then departureReady;
			merge departureReady;
			then action takeOff { doc /* 5. Take off within the pad-edge noise limit (REQ-SYS-002). */ }
			then action cruise :> Logical::'FN-005' { doc /* 5. Cruise for about 10 min at 150 km/h. */ }
			then merge approachAgain;
			then action approach { doc /* 6. Approach the destination pad. */ }
			then decide padCheck;
				if destinationPadFree then landAtDestination;
				if (not destinationPadFree) and holdWithinReserve then holdForPad;
				else divertToAlternate;
			action holdForPad { doc /* A1 (step 6): destination pad occupied; hold within the energy reserve. */ }
			then approachAgain;
			action divertToAlternate { doc /* A1 (step 6): divert to the nearest open vertiport within the energy reserve. Rejoin at step 7. */ }
			then arrived;
			action landAtDestination { doc /* 6. Land at the destination pad. */ }
			then arrived;
			merge arrived;
			then action deplanePassengers { doc /* 7. Passengers deplane at the destination. */ }
			then action handOverToCharging { doc /* 7. The aircraft passes to charging (SCN-003 Aircraft Charging). */ }
			then done;
		}
		use case <'SCN-003'> 'Aircraft Charging' {
			doc /* An arrived aircraft is charged to the dispatch threshold in 20 min and is dispatch-ready within the 25 min hub turnaround. Kind: charging (official S04 Lab 7 SCN-003). Trigger: An aircraft lands on a hub pad at the end of SCN-002. Actors: STK-005 (primary); Fleet controller; EXT-002. Preconditions: A turnaround charger is free; the vertiport power limit (TBD-02) is configured. Main flow: 1. STK-005: Connects the charger after rotor stop and the safety check. 2. AeroLink (system of interest): Sets charging power within the vertiport connection limit. 3. AeroLink (system of interest): Charges the battery to the dispatch threshold within 20 min while passengers deplane and board. 4. AeroLink (system of interest): Records the charge session (energy, cell temperatures). 5. STK-005: Disconnects the charger. 6. Fleet controller: Releases the aircraft as dispatch-ready. Alternate flows: A1 (step 1): both hub chargers are occupied - Queue the aircraft, or reposition it to another hub; scheduling re-times the next departure. Rejoin at step 1. A2 (step 2): EXT-002 signals a curtailment - Charge at reduced power for longer and notify scheduling of the later release. Rejoin at step 4. A3 (step 3): a cell over-temperature alarm sounds - Stop charging, isolate the aircraft and start the fire-response procedure. Scenario ends. */
			subject enterprise : Context::AeroLinkEnterprise;
			actor vertiportOperators : Stakeholders::'STK-005'; // STK-005 performs SCN-003
			objective { doc /* End state: Success: Aircraft dispatch-ready within the 25 min hub turnaround. Failure/degraded: Aircraft withdrawn from service, or released late, with the reason recorded. */ }
		}
		use case <'SCN-004'> 'Maintenance Event' {
			doc /* A fault is reported or predicted; the aircraft is withheld, repaired and returned to service. Kind: maintenance (official S04 Lab 7 SCN-004). Trigger: Aircraft health monitoring reports a fault, or predictive maintenance flags one. Actors: STK-009 (primary); Fleet controller; EXT-004. Preconditions: The aircraft is in service; maintenance records and the approved deferral rules are available. Main flow: 1. STK-009: Classifies the fault as go or no-go. 2. AeroLink (system of interest): Flags a no-go aircraft unavailable for dispatch within 2 min of the report. 3. Fleet controller: Reassigns the affected bookings to other aircraft. 4. STK-009: Moves the aircraft to the maintenance facility and repairs it. 5. STK-009: Signs the return-to-service record. 6. AeroLink (system of interest): Restores the aircraft's availability. Alternate flows: A1 (step 4): the part is not in stock - Order it from EXT-004; the aircraft stays out of service and the capacity plan is updated. Scenario ends. A2 (step 1): the fault is deferrable - Allow dispatch under a recorded deferral with its limits. Scenario ends. */
			subject enterprise : Context::AeroLinkEnterprise;
			actor maintenanceTechnicians : Stakeholders::'STK-009'; // STK-009 performs SCN-004
			objective { doc /* End state: Success: Aircraft returned to service with complete records. Failure/degraded: Aircraft out of service with an expected return date, or in service under a recorded deferral. */ }
		}
		use case <'SCN-005'> 'Weather Disruption' {
			doc /* Forecast weather approaches the aircraft limits at a vertiport; flights are held or diverted and the backlog is recovered. Kind: weather (official S04 Lab 7 SCN-005). Trigger: The forecast for a vertiport crosses a weather limit within the next 30 min (limits TBD-01, U-001). Actors: Operations centre duty manager (primary); STK-001; STK-008; EXT-001; EXT-003 (environment). Preconditions: Flights are scheduled and some are airborne; weather data are received for all six vertiports; alternates and the 20 % energy reserve policy are in force. Main flow: 1. AeroLink (system of interest): Flags vertiport V3 as approaching its weather limits and lists the affected departures, arrivals and airborne flights. 2. Operations centre duty manager: Declares a weather hold for V3: no departures to or from V3. 3. STK-008: Diverts each airborne flight bound for V3 to its planned alternate within the energy reserve. 4. EXT-001: Accepts the revised flight intents for the diverted flights. 5. AeroLink (system of interest): Notifies affected passengers of a new boarding time, an alternate vertiport or a refund. 6. STK-001: Each affected passenger accepts a new time or vertiport, or takes the refund. 7. Operations centre duty manager: Lifts the hold when the forecast has been back inside limits for 30 min; the backlog is re-timed. Alternate flows: A1 (step 3): conditions at the alternate also approach limits while the aircraft is airborne - Divert to the nearest open vertiport within the reserve; if none is reachable within the reserve, declare a priority landing with the ANSP. Rejoin at step 5. A2 (step 2): two or more vertiports reach limits (region-wide event) - Suspend all departures network-wide; land airborne flights at the nearest open vertiport; offer passengers public transport (EXT-005). Scenario ends. A3 (step 7): the hold lasts longer than 2 h - Cancel the remaining bookings to V3 for the day and refund; reposition aircraft for the next morning. Scenario ends. */
			subject enterprise : Context::AeroLinkEnterprise;
			actor controlledAirspace : Context::ControlledAirspace; // EXT-001 performs SCN-005
			objective { doc /* End state: Success: All aircraft on the ground or safely diverted; no flight dispatched outside limits; the backlog flown within the day. Failure/degraded: Service at V3 suspended for the day with every affected passenger re-accommodated or refunded and no flight outside limits. */ }
		}
		// Aircraft operating states (v0.3), exhibited by Physical::aeroLink.'PHY-001'.
		attribute def ChargerConnected;
		attribute def DispatchThresholdReached;
		attribute def DispatchRelease;
		attribute def LandedOnPad;
		attribute def NoGoFaultReported;
		attribute def CellOverTemperature;
		attribute def ReturnedToService;
		state def AircraftOperatingStates {
			doc /* Operating states of one eVTOL aircraft over a turnaround cycle (SCN-002, SCN-003, SCN-004). */
			attribute noGoFaultOpen : Boolean;
			first start then onPad;
			state onPad { doc /* On a vertiport pad after landing; passengers deplane. */ }
			state charging { doc /* Connected to a charger (IF-005); FN-006 Charge aircraft. */ do Logical::'FN-006'; }
			state dispatchReady { doc /* Charged to the dispatch threshold with no open no-go fault. */ }
			state inFlight { doc /* FN-005 Fly passenger trip. */ do Logical::'FN-005'; }
			state outOfService { doc /* Withheld from dispatch; FN-008 Assess aircraft health (SCN-004). */ entry Logical::'FN-008'; }
			transition connectCharger first onPad accept ChargerConnected then charging;
			transition chargeComplete first charging accept DispatchThresholdReached then dispatchReady;
			transition dispatch first dispatchReady accept DispatchRelease if not noGoFaultOpen then inFlight;
			transition land first inFlight accept LandedOnPad then onPad;
			transition overTemperature first charging accept CellOverTemperature then outOfService;
			transition faultBeforeDispatch first dispatchReady accept NoGoFaultReported then outOfService;
			transition faultOnPad first onPad accept NoGoFaultReported then outOfService;
			transition returnToService first outOfService accept ReturnedToService then onPad;
		}
		state aircraftOperatingStates : AircraftOperatingStates;
	}
	package Verification {
		doc /* VER as verification cases: method (VerificationMethod metadata), objective with verify, and a verdict computed from the recorded results (pass / fail / inconclusive; error is a procedural verdict recorded by the test conductor) (L12 / CP5). */
		verification <'VER-001'> 'Turnaround charge-time test' {
			doc /* Subject: PHY-003 with PHY-001 (IF-005). Level: system. Environment: Hub vertiport, ambient 0-35 C. Success criterion: All 30 charges from 20 % (+0/-1 %) state of charge reach the dispatch threshold in <= 20.0 min. Verdict logic: pass: all 30 charges <= 20.0 min; fail: any charge > 20.0 min; inconclusive: fewer than 30 valid charges, or start state of charge outside tolerance; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject testCharger : Physical::ChargingSystems;
			objective {
				doc /* Show that a hub charger restores an aircraft from the 20 % reserve to the dispatch threshold within 20 min. */
				verify Requirements::'REQ-SYS-001';
			}
			attribute validCharges : Natural;
			attribute maxMeasuredChargeTime : DurationValue;
			return verdict : VerdictKind = if validCharges < 30 ? VerdictKind::inconclusive else PassIf(maxMeasuredChargeTime <= Requirements::'REQ-SYS-001'.maxChargeTime);
		}
		verification <'VER-002'> 'Pad-edge noise measurement' {
			doc /* Subject: PHY-001. Level: system. Environment: Each vertiport, wind <= 10 kt, calibrated class 1 sound level meters at the pad edge. Success criterion: Every one of 50 measured movements <= 65.0 dBA LAmax. Verdict logic: pass: all 50 movements <= 65.0 dBA; fail: any movement > 65.0 dBA; inconclusive: background noise within 10 dB of the event, or fewer than 50 valid movements; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject testAircraft : Physical::EVTOLAircraft;
			objective {
				doc /* Measure aircraft LAmax at the pad edge for take-offs and landings on the published procedures. */
				verify Requirements::'REQ-SYS-002';
			}
			attribute validMovements : Natural;
			attribute maxMeasuredLAmax : SoundPressureLevelValue;
			return verdict : VerdictKind = if validMovements < 50 ? VerdictKind::inconclusive else PassIf(maxMeasuredLAmax <= Requirements::'REQ-SYS-002'.noiseLimit);
		}
		verification <'VER-003'> 'Landing energy reserve analysis' {
			doc /* Subject: LOG-001 flight planning with PHY-001 energy model. Level: system. Environment: Model-based: all vertiport pairs, headwinds to the planning limit, end-of-life battery capacity. Success criterion: Minimum planned landing energy >= 20 % for every vertiport pair and wind case. Verdict logic: pass: all cases >= 20 %; fail: any case < 20 %; inconclusive: energy model not validated against flight data (INFO-002); error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::analyze; }
			subject flightPlanningModel : Logical::FlightOperations;
			objective {
				doc /* Show by energy analysis that the flight planning function never produces a plan landing below 20 % usable energy. */
				verify Requirements::'REQ-SYS-003';
			}
			attribute energyModelValidated : Boolean;
			attribute minPlannedLandingEnergy : Real;
			return verdict : VerdictKind = if not energyModelValidated ? VerdictKind::inconclusive else PassIf(minPlannedLandingEnergy >= Requirements::'REQ-SYS-003'.minLandingEnergyFraction);
		}
		verification <'VER-004'> 'Weather dispatch-hold demonstration' {
			doc /* Subject: LOG-006 on PHY-004. Level: system. Environment: Operations centre with recorded and injected forecasts; limit TBD-01 set to a placeholder until U-001 closes. Success criterion: Holds placed for all 20 injected exceedances and for none of 20 in-limit forecasts. Verdict logic: pass: 20 of 20 holds and 0 false holds; fail: any missed hold; inconclusive: TBD-01 not yet set to the approved limit (verdict re-run when U-001 closes); error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::demo; }
			subject operationsSystem : Logical::DecisionSupport;
			objective {
				doc /* Demonstrate that injected forecasts above the weather limit place a dispatch hold on the affected vertiport. */
				verify Requirements::'REQ-SYS-004';
			}
			attribute approvedLimitSet : Boolean = false; // TBD-01 open until U-001 closes
			attribute holdsPlaced : Natural;
			attribute falseHolds : Natural;
			return verdict : VerdictKind = if not approvedLimitSet ? VerdictKind::inconclusive else PassIf(holdsPlaced == 20 and falseHolds == 0);
		}
		verification <'VER-005'> 'Aircraft assignment latency test' {
			doc /* Subject: LOG-005 on PHY-004 with PHY-007. Level: subsystem. Environment: Operations platform with a replayed peak-hour request profile. Success criterion: 99th percentile of 200 assignments <= 60 s. Verdict logic: pass: 99th percentile <= 60 s; fail: 99th percentile > 60 s; inconclusive: fewer than 200 assignments or no dispatch-ready aircraft in the replay; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject schedulingPlatform : Logical::Scheduling;
			objective {
				doc /* Show that confirmed requests are assigned a dispatch-ready aircraft within 60 s. */
				verify Requirements::'REQ-SYS-005';
			}
			attribute assignmentsMade : Natural;
			attribute assignmentLatencyP99 : DurationValue;
			return verdict : VerdictKind = if assignmentsMade < 200 ? VerdictKind::inconclusive else PassIf(assignmentLatencyP99 <= Requirements::'REQ-SYS-005'.maxAssignmentLatency);
		}
		verification <'VER-006'> 'Fleet availability analysis' {
			doc /* Subject: LOG-002 with LOG-003 (fleet). Level: system. Environment: First 3 months of operation, maintenance data (INFO-003). Success criterion: Monthly availability >= 90 % in each of 3 consecutive months. Verdict logic: pass: all 3 months >= 90 %; fail: any month < 90 %; inconclusive: records incomplete for any month; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::analyze; }
			subject fleet : Logical::FleetManagement;
			objective {
				doc /* Show from maintenance records that available aircraft-hours are at least 90 % of scheduled aircraft-hours. */
				verify Requirements::'REQ-SYS-006';
			}
			attribute recordsComplete : Boolean;
			attribute minMonthlyAvailability : Real;
			return verdict : VerdictKind = if not recordsComplete ? VerdictKind::inconclusive else PassIf(minMonthlyAvailability >= Requirements::'REQ-SYS-006'.minAvailability);
		}
		verification <'VER-007'> 'Design-trip block-time flight test' {
			doc /* Subject: PHY-001. Level: system. Environment: Flight test between two vertiports 25 km apart; corrected to still air. Success criterion: Mean corrected block time of 10 flights <= 16.0 min and no flight > 17.0 min. Verdict logic: pass: both conditions met; fail: either condition not met; inconclusive: wind correction > 2 min on any flight; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject testAircraft : Physical::EVTOLAircraft;
			objective {
				doc /* Show that the aircraft flies the 25 km design trip within 16 min block time. */
				verify Requirements::'REQ-SYS-007';
			}
			attribute maxWindCorrection : DurationValue;
			attribute meanBlockTime : DurationValue;
			attribute maxBlockTime : DurationValue;
			return verdict : VerdictKind = if maxWindCorrection > 2 [min] ? VerdictKind::inconclusive else PassIf(meanBlockTime <= 16 [min] and maxBlockTime <= 17 [min]);
		}
		verification <'VER-008'> 'No-go fault flag test' {
			doc /* Subject: LOG-003 on PHY-005 and PHY-004. Level: subsystem. Environment: Integration test bench with injected fault reports. Success criterion: All 20 injected no-go faults set the aircraft unavailable in <= 2 min and the dispatch interlock blocks release. Verdict logic: pass: 20 of 20 within 2 min and blocked; fail: any late flag or any release; inconclusive: fault injection not acknowledged by the bench; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject maintenanceManagement : Logical::MaintenanceManagement;
			objective {
				doc /* Show that a reported no-go fault makes the aircraft unavailable for dispatch within 2 min. */
				verify Requirements::'REQ-SYS-008';
			}
			attribute injectionsAcknowledged : Boolean;
			attribute faultsFlaggedInTime : Natural;
			attribute releases : Natural;
			return verdict : VerdictKind = if not injectionsAcknowledged ? VerdictKind::inconclusive else PassIf(faultsFlaggedInTime == 20 and releases == 0);
		}
		verification <'VER-009'> 'Fire alarm transmission test' {
			doc /* Subject: PHY-008 with IF-007. Level: system. Environment: Each vertiport, with the dispatch centre on a test line. Success criterion: All 10 test alarms received in <= 30 s with the correct pad location. Verdict logic: pass: 10 of 10 <= 30 s and correct location; fail: any alarm > 30 s or wrong location; inconclusive: test line unavailable during a trial; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject fireDetection : Physical::PadFireDetectionSystem;
			objective {
				doc /* Show that a pad fire alarm reaches the emergency services dispatch centre within 30 s. */
				verify Requirements::'REQ-SYS-009';
			}
			attribute testLineAvailable : Boolean;
			attribute alarmsInTimeWithCorrectLocation : Natural;
			return verdict : VerdictKind = if not testLineAvailable ? VerdictKind::inconclusive else PassIf(alarmsInTimeWithCorrectLocation == 10);
		}
		verification <'VER-010'> 'Vertiport power-limit test' {
			doc /* Subject: PHY-003 with IF-006. Level: subsystem. Environment: Hub vertiport with two aircraft arriving together; limit set to TBD-02 placeholder. Success criterion: 1-minute average combined power <= configured limit in all load cases. Verdict logic: pass: all load cases within limit; fail: any 1-minute average above the limit; inconclusive: limit not yet agreed (U-002); re-run with the signed value; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::test; }
			subject testCharger : Physical::ChargingSystems;
			objective {
				doc /* Show that combined charger power at a vertiport never exceeds the configured connection limit. */
				verify Requirements::'REQ-SYS-010';
			}
			attribute limitAgreed : Boolean = false; // TBD-02 open until U-002 closes
			attribute loadCasesWithinLimit : Boolean;
			return verdict : VerdictKind = if not limitAgreed ? VerdictKind::inconclusive else PassIf(loadCasesWithinLimit);
		}
		verification <'VER-011'> 'Step-free boarding inspection' {
			doc /* Subject: PHY-002 with PHY-001 cabin door. Level: system. Environment: All 6 vertiports. Success criterion: A step-free route exists at 6 of 6 vertiports. Verdict logic: pass: 6 of 6 vertiports; fail: any vertiport without a step-free route; inconclusive: a vertiport not accessible for inspection; error: the procedure or instrumentation was not executed as planned (repeat the run). */
			@VerificationMethod { kind = VerificationMethodKind::inspect; }
			subject enterprise : Context::AeroLinkEnterprise;
			objective {
				doc /* Inspect every vertiport for a step-free route from terminal to cabin for a passenger using a wheelchair. */
				verify Requirements::'REQ-STK-007';
			}
			attribute vertiportsInspected : Natural;
			attribute vertiportsStepFree : Natural;
			return verdict : VerdictKind = if vertiportsInspected < 6 ? VerdictKind::inconclusive else PassIf(vertiportsStepFree == 6);
		}
	}
	package AROU {
		doc /* Assumptions, risks, opportunities and unknowns as named metadata annotations; the elements each item is about realise AROU affects X. Risks specialise the library RiskMetadata::Risk (probability = likelihood / 5, impact = consequence / 5). */
		enum def HandlingKind { avoid; mitigate; transfer; 'accept'; }
		metadata def AssumptionItem { attribute owner : String; attribute validation : String; }
		metadata def CourseRisk :> Risk {
			doc /* A course risk (condition-if-then statement) rated on the course 5 x 5 scale. */
			attribute likelihood : Natural;
			attribute consequence : Natural;
			attribute owner : String;
			attribute handling : HandlingKind;
			attribute treatment : String;
			attribute trigger : String;
		}
		metadata def OpportunityItem { attribute likelihood : Natural; attribute benefit : Natural; attribute owner : String; attribute plannedAction : String; }
		metadata def UnknownItem { attribute tbd : String; attribute owner : String; attribute resolution : String; attribute needBy : String; }
		metadata <'A-001'> 'Passenger wait tolerance is 15 min' : AssumptionItem about
			Stakeholders::'CON-001',
			Needs::'MGO-005',
			Requirements::'REQ-STK-001' {
			doc /* Passenger attraction to the service halves when the typical wait reaches 15 min (the Week 1 dynamics model parameter). Waits above this drive churn. */
			owner = "Head of Customer Experience"; validation = "Compare with booking-abandonment data in the first 3 months of operation (MOE-001).";
		}
		metadata <'A-002'> 'Turnaround charging is concentrated at 3 hub vertiports' : AssumptionItem about
			Stakeholders::'CON-006',
			Requirements::'REQ-STK-005',
			Analysis::'ALT-001' {
			doc /* Of the 6 vertiports (2 chargers each, Data Sheet), 3 hubs carry turnaround charging with high-power chargers; the 6 chargers at the 3 spoke vertiports are standard units used for overnight and opportunity top-up. The effective turnaround charging pool is therefore 6 chargers, which is the charger count used by the Week 1 dynamics model. */
			owner = "Network Planning Manager"; validation = "Confirm against the vertiport charger specification before the Week 7 trade study.";
		}
		metadata <'A-003'> 'High-power charger maturity is TRL 6' : AssumptionItem about
			Analysis::'TECH-001' {
			doc /* The charger supplier has demonstrated a prototype at an operating vertiport (relevant environment). To be confirmed by the supplier test report. */
			owner = "Vertiport Infrastructure Manager"; validation = "Supplier test report before charger order";
		}
		metadata <'A-004'> 'Battery cell maturity is TRL 5' : AssumptionItem about
			Analysis::'TECH-002' {
			doc /* The cell supplier has validated the cell in a relevant environment (pack-level cycling at fast-charge rates). To be confirmed by cycle-test data. */
			owner = "Fleet Engineering Lead"; validation = "Cycle-test data at 20 cycles/day equivalent before fleet order";
		}
		metadata <'A-005'> 'Detect-and-avoid maturity is TRL 4' : AssumptionItem about
			Analysis::'TECH-003' {
			doc /* Detect-and-avoid components have been validated in a laboratory environment only. To be confirmed before the autonomy increment is planned. */
			owner = "Director of Flight Operations"; validation = "Review of the developer's laboratory reports before Week 14 evolution planning";
		}
		metadata <'A-006'> 'Year-2 planning demand is 240 trips/day' : AssumptionItem about
			Analysis::'DEC-001',
			Analysis::'CRIT-001' {
			doc /* Demand at month 24 is planned at 240 trips/day, equal to the baseline capacity; demand is assumed independent of the alternative chosen. */
			owner = "Network Planning Manager"; validation = "Re-forecast quarterly with AI-002 demand forecasting";
		}
		metadata <'A-007'> 'A turnaround charger is occupied 20 min per turnaround' : AssumptionItem about
			Stakeholders::'CON-006',
			Needs::'CAP-003' {
			doc /* The 25 min hub turnaround (REQ-STK-005) is 5 min of rotor stop, safety check and charger connection and disconnection plus 20 min of charging (REQ-SYS-001), with deplaning and boarding overlapping the charge (the Week 4 derivation). Each hub has two pads per turnaround charger, and the charger is switched to the other pad during the 5 min of pad work, so it delivers one 20 min charge per turnaround and up to 48 charges in the 16 h operating day (960 min / 20 min). This is the convention used by the Week 1 dynamics model, the Week 3 gap analysis and the Week 7 trade study; 25 min per charge (one charger per pad, held for the whole turnaround) is a sensitivity case. */
			owner = "Network Planning Manager"; validation = "Confirm by a turnaround time-and-motion trial at a hub before the Week 7 trade study; if a hub cannot provide two pads per turnaround charger, re-run the capacity figures at 25 min (38.4 charges per charger per day).";
		}
		metadata <'A-008'> 'Public-transport fallback is available during weather holds' : AssumptionItem about
			Behavior::'SCN-005' {
			doc /* When a weather hold or a region-wide suspension stops flights (SCN-005 A2), the public transport network (EXT-005) can carry the affected passengers onward from the vertiports concerned within the operating day. No agreement with the transport authority confirms this yet. */
			owner = "Head of Partnerships"; validation = "Agree a disruption-transfer arrangement with the transport authority covering every vertiport and the full operating day before entry into service.";
		}
		metadata <'R-001'> 'Charging capacity lags fleet growth' : CourseRisk about
			Stakeholders::'CON-001',
			Stakeholders::'CON-006',
			Needs::'CAP-003',
			Requirements::'REQ-STK-005',
			Requirements::'REQ-STK-001',
			Requirements::'REQ-STK-004',
			Physical::aeroLink::'PHY-003' {
			doc /* Condition: the capital plan adds aircraft when utilisation is high but holds the number of turnaround chargers fixed. If fleet growth outpaces turnaround charging capacity, then aircraft queue for chargers, the 90th-percentile passenger wait rises above 15 min and riders churn (the Week 1 Limits-to-Growth structure: the charging limit; it would become Growth and Underinvestment only if stalled growth were used to justify withholding charger investment). */
			totalRisk = new RiskLevel(probability = 0.6, impact = 0.8);
			likelihood = 3; consequence = 4; handling = HandlingKind::mitigate;
			owner = "Network Planning Manager";
			treatment = "Tie every aircraft order to a charging-capacity check; decided in DEC-001 (ALT-004 adds hub chargers with aircraft).";
			trigger = "Charger queue time above 5 min on 3 consecutive days";
		}
		metadata <'R-002'> 'Battery capacity fade under fast charging' : CourseRisk about
			Requirements::'REQ-SYS-003',
			Analysis::'TECH-002',
			Measures::'TPM-003',
			Needs::'CAP-006',
			Physical::aeroLink::'PHY-001' {
			doc /* Condition: cells are fast-charged about 20 times per aircraft per day and their fade rate at this duty is known only from assumed supplier data (A-004). If usable capacity fades by more than 10 % before the planned pack replacement, then the 20 % landing reserve cannot be held on the 25 km design trip and flights must be shortened or cancelled. */
			totalRisk = new RiskLevel(probability = 0.6, impact = 0.8);
			likelihood = 3; consequence = 4; handling = HandlingKind::mitigate;
			owner = "Fleet Engineering Lead";
			treatment = "Track TPM-003 monthly; sample-test packs; predictive maintenance (AI-001) schedules pack replacement before the reserve is threatened.";
			trigger = "TPM-003 margin below 1 percentage point";
		}
		metadata <'R-003'> 'Pad-edge noise above the agreed limit' : CourseRisk about
			Requirements::'REQ-SYS-002',
			Requirements::'REQ-STK-002',
			Measures::'TPM-002',
			Physical::aeroLink::'PHY-001' {
			doc /* Condition: the aircraft noise estimate (63.5 dBA, TPM-002) comes from prediction only. If measured pad-edge noise exceeds 65 dBA, then the local agreement is breached and the city may restrict operating hours at the affected vertiport. */
			totalRisk = new RiskLevel(probability = 0.4, impact = 1.0);
			likelihood = 2; consequence = 5; handling = HandlingKind::mitigate;
			owner = "Community Relations Manager";
			treatment = "Early pad-edge measurement campaign (VER-002) before revenue service; steeper approach and departure procedures held in reserve.";
			trigger = "Any measured movement above 64 dBA";
		}
		metadata <'R-004'> 'Weather limits lower than planned' : CourseRisk about
			Requirements::'REQ-SYS-004',
			Requirements::'REQ-STK-004',
			Behavior::'SCN-005',
			Logical::logicalArchitecture::'LOG-006' {
			doc /* Condition: the aircraft weather limits are unpublished (U-001). If the approved limits are lower than planned, then weather holds will exceed the planned 5 % of operating hours and delivered capacity falls below REQ-STK-004. */
			totalRisk = new RiskLevel(probability = 0.6, impact = 0.8);
			likelihood = 3; consequence = 4; handling = HandlingKind::transfer;
			owner = "Director of Flight Operations";
			treatment = "Aircraft purchase contract carries a performance guarantee on the weather envelope with compensation per lost operating hour.";
			trigger = "OEM draft flight manual limits below the planning values";
		}
		metadata <'R-005'> 'Grid connection below hub charging demand' : CourseRisk about
			Requirements::'REQ-SYS-010',
			Requirements::'REQ-STK-005',
			Analysis::'TECH-001',
			Analysis::'ALT-004',
			Physical::aeroLink::'PHY-003' {
			doc /* Condition: connection capacity at the hub vertiports is not yet agreed (U-002). If a hub connection is limited below the demand of its two high-power chargers, then simultaneous charging is curtailed and turnaround exceeds 25 min. */
			totalRisk = new RiskLevel(probability = 0.4, impact = 0.8);
			likelihood = 2; consequence = 4; handling = HandlingKind::avoid;
			owner = "Vertiport Infrastructure Manager";
			treatment = "Select hub sites only where the utility confirms capacity for two high-power chargers before the site is committed.";
			trigger = "Utility response to the connection request";
		}
		metadata <'R-006'> 'Detect-and-avoid not mature for autonomy' : CourseRisk about
			Analysis::'TECH-003',
			Needs::'CAP-004' {
			doc /* Condition: detect-and-avoid is at TRL 4 (A-005). If it does not reach TRL 6 before the autonomy increment is planned, then remote or autonomous operations are delayed and operator workload stays at the piloted baseline. */
			totalRisk = new RiskLevel(probability = 0.6, impact = 0.4);
			likelihood = 3; consequence = 2; handling = HandlingKind::'accept';
			owner = "Director of Flight Operations";
			treatment = "Accepted: the baseline operation is piloted and does not depend on TECH-003; reviewed at the Week 14 evolution decision.";
			trigger = "TRL review at evolution planning";
		}
		metadata <'R-007'> 'Dispatch platform outage' : CourseRisk about
			Requirements::'REQ-SYS-005',
			Needs::'CAP-002',
			Physical::aeroLink::'PHY-004',
			Logical::logicalArchitecture::'LOG-005' {
			doc /* Condition: booking, scheduling and dispatch run on one operations platform. If that platform fails during operating hours, then no new rides can be assigned and passenger waits exceed 15 min network-wide within minutes. */
			totalRisk = new RiskLevel(probability = 0.4, impact = 0.8);
			likelihood = 2; consequence = 4; handling = HandlingKind::mitigate;
			owner = "Head of Operations Technology";
			treatment = "Hot-standby platform with automatic failover (DEC-002); manual dispatch procedure for failover periods.";
			trigger = "Platform health alarm or failover event";
		}
		metadata <'R-008'> 'Battery thermal runaway during charging' : CourseRisk about
			Requirements::'REQ-SYS-001',
			Behavior::'SCN-003',
			Needs::'CAP-009',
			Physical::aeroLink::'PHY-003',
			Physical::aeroLink::'PHY-002' {
			doc /* Condition: aircraft batteries are charged at high power on hub pads next to passengers and other aircraft. If a cell enters thermal runaway during charging, then a fire can spread on the pad, injure people and close the vertiport. */
			totalRisk = new RiskLevel(probability = 0.4, impact = 1.0);
			likelihood = 2; consequence = 5; handling = HandlingKind::mitigate;
			owner = "Vertiport Safety Manager";
			treatment = "Cell-temperature monitoring stops charging (SCN-003 A3); pad fire detection alerts responders within 60 s (REQ-STK-008, REQ-SYS-009); pad separation and suppression.";
			trigger = "Cell over-temperature alarm";
		}
		metadata <'O-001'> 'Integrated public-transport ticketing' : OpportunityItem about
			Stakeholders::'CON-005' {
			doc /* If AeroLink trips can be booked within the regional public-transport journey planner, first-and-last-mile friction falls and demand may grow faster than the planning forecast. */
			likelihood = 3; benefit = 3; owner = "Head of Partnerships";
			plannedAction = "Open data-sharing talks with the transport authority; evaluate in the Year-2 capacity plan.";
		}
		metadata <'O-002'> 'Overnight charger capacity for ground fleets' : OpportunityItem about
			Analysis::'TECH-001',
			Analysis::'DEC-001' {
			doc /* Hub chargers are idle for about 8 h each night. If they can be leased to ground electric-vehicle fleets overnight, then charger capital is recovered faster, improving the case for adding hub chargers. */
			likelihood = 2; benefit = 2; owner = "Head of Partnerships";
			plannedAction = "Assess demand from municipal and taxi fleets; feeds the cost case of DEC-001.";
		}
		metadata <'U-001'> 'Aircraft weather limits not yet published' : UnknownItem about
			Stakeholders::'CON-004',
			Behavior::'SCN-005',
			Needs::'CAP-005',
			Requirements::'REQ-STK-003',
			Requirements::'REQ-SYS-004' {
			doc /* The OEM has not published the approved crosswind, gust and visibility limits for the aircraft. Weather-hold thresholds in requirements are held as TBD-01 until they are known. */
			tbd = "TBD-01"; owner = "Director of Flight Operations"; resolution = "Obtain limits from the OEM flight manual draft"; needBy = "Before CP2 requirements baseline (Week 6)";
		}
		metadata <'U-002'> 'Vertiport grid connection limit not agreed' : UnknownItem about
			Requirements::'REQ-STK-010',
			Requirements::'REQ-SYS-010',
			Needs::'CAP-010',
			Analysis::'DEC-001' {
			doc /* The utility has not confirmed the connection capacity at each vertiport. The charging power limit is held as TBD-02 until the connection agreements are signed. */
			tbd = "TBD-02"; owner = "Vertiport Infrastructure Manager"; resolution = "Connection agreement with the utility for each vertiport"; needBy = "Before the Week 7 trade study";
		}
	}
	package Measures {
		doc /* Technical performance measures (TPM). MOE attributes are owned by Context::AeroLinkEnterprise and MOP attributes by the logical or physical definition whose value they measure; #measures dependencies record what each measure measures. */
		metadata def TechnicalPerformanceMeasure { attribute basis : String; }
		attribute <'TPM-001'> 'Charge time to dispatch threshold' {
			doc /* Charge time from 20 % reserve to the dispatch threshold, tracked through charger and battery design maturity. Unit: min; lower-is-better. */
			attribute threshold : DurationValue = 20 [min];
			attribute objectiveValue : DurationValue = 15 [min];
			attribute currentEstimate : DurationValue = 18 [min];
			attribute margin : DurationValue = 2 [min];
			@TechnicalPerformanceMeasure { basis = "Supplier charge-curve analysis (FICTIONAL estimate)"; }
		}
		attribute <'TPM-002'> 'Pad-edge noise' {
			doc /* Aircraft LAmax at the pad edge on the published procedures, tracked through aircraft and procedure design. Unit: dBA; lower-is-better. */
			attribute threshold : SoundPressureLevelValue = 65 [dB];
			attribute objectiveValue : SoundPressureLevelValue = 62 [dB];
			attribute currentEstimate : SoundPressureLevelValue = 63.5 [dB];
			attribute margin : SoundPressureLevelValue = 1.5 [dB];
			@TechnicalPerformanceMeasure { basis = "Noise prediction analysis; no measurement yet (FICTIONAL estimate)"; }
		}
		attribute <'TPM-003'> 'Landing energy reserve on the design trip' {
			doc /* Usable energy remaining after the 25 km design trip, tracked through battery capacity and fade estimates. Unit: %; higher-is-better. Values are fractions of usable energy. */
			attribute threshold : Real = 0.20;
			attribute objectiveValue : Real = 0.25;
			attribute currentEstimate : Real = 0.23;
			attribute margin : Real = 0.03;
			@TechnicalPerformanceMeasure { basis = "Energy analysis with end-of-life cell capacity (FICTIONAL estimate)"; }
		}
	}
	package Analysis {
		doc /* TECH as part definitions with TRL; ALT as part usages; CRIT as value-function calculations; DEC-001 as a TradeStudy analysis that selects the alternative with the maximum weighted value (Week 7, S04 Lab 11). */
		part def <'TECH-001'> 'High-power charging' {
			doc /* Hub chargers that restore the battery from the 20 % reserve to the dispatch threshold in 20 min. Benefit: sets the 25 min turnaround and the charger-limited capacity. Limitations: high grid demand at hubs (CON-011) and cell heating during charge. Evidence: Assumption A-003 (no supplier test report in the course sources). Related risk: R-005 (external grid-connection dependency; at TRL 6 there is no maturity risk). */
			attribute trl : Natural = 6;
			attribute trlMeaning : String = "Prototype demonstration in a relevant environment";
		}
		part def <'TECH-002'> 'Battery cell technology' {
			doc /* High-energy lithium-ion cells sized for a 25 km trip with a 20 % reserve at 20 fast-charge cycles per aircraft per day. Benefit: range and turnaround. Limitations: capacity fade under fast charging, thermal-runaway hazard. Evidence: Assumption A-004 (cell supplier data assumed; not available in the course sources). */
			attribute trl : Natural = 5;
			attribute trlMeaning : String = "Component validation in a relevant environment";
		}
		part def <'TECH-003'> 'Detect-and-avoid and autonomy enablers' {
			doc /* Onboard sensing and decision functions that detect and avoid other traffic, enabling remote or autonomous operation (Week 14 evolution). Benefit: lower operator workload and crew cost. Limitations: certification basis and operator trust (CON-009). Evidence: Assumption A-005 (laboratory results assumed; no flight evidence in the course sources). */
			attribute trl : Natural = 4;
			attribute trlMeaning : String = "Component validation in a laboratory environment";
		}
		part def CapacityAlternative {
			attribute aircraft : Natural;
			attribute turnaroundChargers : Natural;
			attribute sites : Natural;
			attribute capacityTripsPerDay : Real;
			attribute waitAtYear2Demand : Real { doc /* CRIT-001 raw score, min */ }
			attribute capitalCost : Real { doc /* CRIT-002 raw score, USD M */ }
			attribute capacityRetained : Real { doc /* CRIT-003 raw score, % */ }
			attribute peakMovements : Real { doc /* CRIT-004 raw score, movements/h */ }
		}
		part <'ALT-001'> baseline : CapacityAlternative {
			doc /* Baseline: no added capacity (the baseline alternative). Keep 12 aircraft and 6 vertiports (3 hubs with 2 turnaround chargers each). Capacity min(240, 288) = 240 trips/day: fleet-limited; fails REQ-STK-004. */
			attribute :>> aircraft = 12; attribute :>> turnaroundChargers = 6; attribute :>> sites = 6; attribute :>> capacityTripsPerDay = 240;
			attribute :>> waitAtYear2Demand = 66.7; attribute :>> capitalCost = 0; attribute :>> capacityRetained = 80; attribute :>> peakMovements = 8;
		}
		part <'ALT-002'> additionalAircraftOnly : CapacityAlternative {
			doc /* Additional aircraft only. Buy 6 aircraft (18 in total) and keep the charging network. Capacity min(360, 288) = 288 trips/day: becomes charger-limited (R-001); fails REQ-STK-004. */
			attribute :>> aircraft = 18; attribute :>> turnaroundChargers = 6; attribute :>> sites = 6; attribute :>> capacityTripsPerDay = 288;
			attribute :>> waitAtYear2Demand = 12; attribute :>> capitalCost = 18; attribute :>> capacityRetained = 66.7; attribute :>> peakMovements = 8;
		}
		part <'ALT-003'> additionalVertiportOnly : CapacityAlternative {
			doc /* Additional vertiport only. Build a seventh vertiport as a fourth hub with 2 turnaround chargers; keep 12 aircraft. Capacity min(240, 384) = 240 trips/day: still fleet-limited; fails REQ-STK-004, but spreads movements and adds a hub. */
			attribute :>> aircraft = 12; attribute :>> turnaroundChargers = 8; attribute :>> sites = 7; attribute :>> capacityTripsPerDay = 240;
			attribute :>> waitAtYear2Demand = 66.7; attribute :>> capitalCost = 6; attribute :>> capacityRetained = 100; attribute :>> peakMovements = 6.86;
		}
		part <'ALT-004'> balanced : CapacityAlternative {
			doc /* Balanced: aircraft plus hub charging. Buy 4 aircraft (16 in total) and upgrade the 2 chargers at one spoke vertiport to high-power units, making it a fourth hub (TECH-001). Capacity min(320, 384) = 320 trips/day: meets REQ-STK-004. */
			attribute :>> aircraft = 16; attribute :>> turnaroundChargers = 8; attribute :>> sites = 6; attribute :>> capacityTripsPerDay = 320;
			attribute :>> waitAtYear2Demand = 8; attribute :>> capitalCost = 12.8; attribute :>> capacityRetained = 90; attribute :>> peakMovements = 8;
		}
		calc def <'CRIT-001'> 'Wait at Year-2 demand' {
			doc /* Typical passenger wait at 240 trips/day, from the Week 1 dynamics approximation; a proxy for MOE-001. Value function: linear: v = 1 at 5 min, v = 0 at 60 min or more. Swing points 100, weight 0.4. Swinging from a 60 min to a 5 min wait was ranked the most valuable swing: it decides whether passengers stay (A-001). */
			in x : Real;
			return value : Real = if x >= 60.0 ? 0.0 else if x <= 5.0 ? 1.0 else (60.0 - x) / 55.0;
		}
		calc def <'CRIT-002'> 'Capital cost' {
			doc /* Capital required over months 0-24 to implement the alternative (MOE-005). Value function: linear: v = 1 at USD 0 M, v = 0 at USD 20 M. Swing points 75, weight 0.3. Investors (STK-003) rank avoiding USD 20 M of spend second: three quarters of the value of the wait swing. */
			in x : Real;
			return value : Real = if x >= 20.0 ? 0.0 else if x <= 0.0 ? 1.0 else 1.0 - x / 20.0;
		}
		calc def <'CRIT-003'> 'Capacity retained after loss of a hub' {
			doc /* Share of network capacity kept when one hub vertiport closes (MOE-006). Value function: linear: v = 0 at 50 %, v = 1 at 100 %. Swing points 40, weight 0.16. Hub closures for weather are expected a few days per month (SCN-005); valued at 40 % of the wait swing. */
			in x : Real;
			return value : Real = if x <= 50.0 ? 0.0 else if x >= 100.0 ? 1.0 else (x - 50.0) / 50.0;
		}
		calc def <'CRIT-004'> 'Community noise exposure' {
			doc /* Peak-hour take-offs and landings at the busiest vertiport (MOE-003). Value function: linear: v = 1 at 5 movements/h, v = 0 at 10 movements/h. Swing points 35, weight 0.14. Each movement already meets 65 dBA (REQ-STK-002); exposure frequency matters to communities (CON-012) but less than service. */
			in x : Real;
			return value : Real = if x >= 10.0 ? 0.0 else if x <= 5.0 ? 1.0 else (10.0 - x) / 5.0;
		}
		analysis <'DEC-001'> 'Year-2 capacity: add aircraft with hub charging' : TradeStudy {
			doc /* Recommend ALT-004: buy 4 aircraft and convert one spoke vertiport into a fourth hub with high-power chargers. It is the only alternative that meets REQ-STK-004 (320 >= 300 trips/day) and scores 0.670 against 0.489 for the next best. Adding aircraft alone (ALT-002) moves the bottleneck to charging, and adding a vertiport alone (ALT-003) leaves the network fleet-limited. Decision: How should AeroLink provide the Year-2 capacity objective (S04 Lab 11: additional aircraft vs additional vertiports)? Scores: ALT-004 0.670; ALT-002 0.489; ALT-003 0.458; ALT-001 0.452. Sensitivity: Cost weight above 0.478 (base 0.30) makes the baseline rank first; wait weight below 0.226 (base 0.40) makes ALT-003 rank first. Both changes amount to abandoning MGO-007. Conditions: Valid while the board weights capital below 0.48, Year-2 demand is near 240 trips/day (A-006) and the spoke site connection supports two high-power chargers (U-002, R-005). Residual risk: R-001 reduced but not removed; R-005 at the converted hub; R-002 rises with more cycles on high-power chargers. Would change if: The demand forecast falls to 192 trips/day or less (MGO-007's 80 % rule would then re-derive REQ-STK-004 as 240 trips/day, which the baseline already provides), the board weights capital above 0.478, or the connection limit (TBD-02) prevents a fourth hub. Aircraft unit cost alone cannot reverse the ranking at base weights: ALT-004 still scores 0.562 with zero cost value. */
			subject : CapacityAlternative = ('ALT-001', 'ALT-002', 'ALT-003', 'ALT-004');
			attribute waitWeight : Real = 0.40;
			attribute capitalWeight : Real = 0.30;
			attribute resilienceWeight : Real = 0.16;
			attribute noiseWeight : Real = 0.14;
			objective : MaximizeObjective;
			calc :>> evaluationFunction {
				in part alt :>> alternative : CapacityAlternative;
				return :>> result : Real = waitWeight * 'CRIT-001'(alt.waitAtYear2Demand) + capitalWeight * 'CRIT-002'(alt.capitalCost)
					+ resilienceWeight * 'CRIT-003'(alt.capacityRetained) + noiseWeight * 'CRIT-004'(alt.peakMovements);
			}
			return part :>> selectedAlternative : CapacityAlternative;
			@Rationale { text = "Recommended ALT-004: ALT-004 0.670; ALT-002 0.489; ALT-003 0.458; ALT-001 0.452; reversal if the capital weight exceeds 0.478."; }
		}
		analysis <'DEC-002'> 'One operations platform with hot standby' {
			doc /* Host scheduling and dispatch on one operations platform with an automatic hot standby, rather than distributing dispatch to vertiports. Alternatives considered: Distributed dispatch at each vertiport; single platform without standby; single platform with hot standby. */
			@Rationale { text = "A single platform gives one network-wide assignment (needed for REQ-SYS-005); the standby removes its single point of failure (R-007)."; }
		}
	}
	package Traceability {
		doc /* Course relationships that are realised as separate SysML relationships, each named <source> <link type> <target>: #derivation connections, #derivesFrom / #refinement / #affectedBy / #mitigates / #measures / #receivesFrom / #satisfies dependencies (each from the dependent element), satisfy and allocate. Relationships realised inside element bodies (stakeholder, frame, actor, perform, verify, item flows, AROU metadata about) are listed in README.md. */
		// derives-from (97)
		#derivation connection 'MGO-002 derives-from MGO-001' {
			end #original ::> Needs::'MGO-001';
			end #derive ::> Needs::'MGO-002';
		}
		#derivation connection 'MGO-003 derives-from MGO-001' {
			end #original ::> Needs::'MGO-001';
			end #derive ::> Needs::'MGO-003';
		}
		#derivation connection 'MGO-004 derives-from MGO-001' {
			end #original ::> Needs::'MGO-001';
			end #derive ::> Needs::'MGO-004';
		}
		#derivation connection 'MGO-005 derives-from MGO-002' {
			end #original ::> Needs::'MGO-002';
			end #derive ::> Needs::'MGO-005';
		}
		#derivation connection 'MGO-006 derives-from MGO-003' {
			end #original ::> Needs::'MGO-003';
			end #derive ::> Needs::'MGO-006';
		}
		#derivation connection 'MGO-007 derives-from MGO-004' {
			end #original ::> Needs::'MGO-004';
			end #derive ::> Needs::'MGO-007';
		}
		#derivation connection 'MGO-009 derives-from MGO-001' {
			end #original ::> Needs::'MGO-001';
			end #derive ::> Needs::'MGO-009';
		}
		#derivation connection 'MGO-008 derives-from MGO-009' {
			end #original ::> Needs::'MGO-009';
			end #derive ::> Needs::'MGO-008';
		}
		#derivesFrom dependency 'CAP-001 derives-from NEED-001' from Needs::'CAP-001' to Needs::'NEED-001';
		#derivesFrom dependency 'CAP-001 derives-from NEED-008' from Needs::'CAP-001' to Needs::'NEED-008';
		#derivesFrom dependency 'CAP-002 derives-from NEED-001' from Needs::'CAP-002' to Needs::'NEED-001';
		#derivesFrom dependency 'CAP-003 derives-from NEED-004' from Needs::'CAP-003' to Needs::'NEED-004';
		#derivesFrom dependency 'CAP-004 derives-from NEED-002' from Needs::'CAP-004' to Needs::'NEED-002';
		#derivesFrom dependency 'CAP-004 derives-from NEED-009' from Needs::'CAP-004' to Needs::'NEED-009';
		#derivesFrom dependency 'CAP-005 derives-from NEED-002' from Needs::'CAP-005' to Needs::'NEED-002';
		#derivesFrom dependency 'CAP-005 derives-from NEED-011' from Needs::'CAP-005' to Needs::'NEED-011';
		#derivesFrom dependency 'CAP-006 derives-from NEED-007' from Needs::'CAP-006' to Needs::'NEED-007';
		#derivesFrom dependency 'CAP-006 derives-from NEED-002' from Needs::'CAP-006' to Needs::'NEED-002';
		#derivesFrom dependency 'CAP-007 derives-from NEED-003' from Needs::'CAP-007' to Needs::'NEED-003';
		#derivesFrom dependency 'CAP-008 derives-from NEED-005' from Needs::'CAP-008' to Needs::'NEED-005';
		#derivesFrom dependency 'CAP-009 derives-from NEED-006' from Needs::'CAP-009' to Needs::'NEED-006';
		#derivesFrom dependency 'CAP-010 derives-from NEED-010' from Needs::'CAP-010' to Needs::'NEED-010';
		#derivesFrom dependency 'CAP-010 derives-from NEED-004' from Needs::'CAP-010' to Needs::'NEED-004';
		#derivesFrom dependency 'SCN-001 derives-from CAP-002' from Behavior::'SCN-001' to Needs::'CAP-002';
		#derivesFrom dependency 'SCN-002 derives-from CAP-001' from Behavior::'SCN-002' to Needs::'CAP-001';
		#derivesFrom dependency 'SCN-002 derives-from CAP-004' from Behavior::'SCN-002' to Needs::'CAP-004';
		#derivesFrom dependency 'SCN-003 derives-from CAP-003' from Behavior::'SCN-003' to Needs::'CAP-003';
		#derivesFrom dependency 'SCN-004 derives-from CAP-006' from Behavior::'SCN-004' to Needs::'CAP-006';
		#derivesFrom dependency 'SCN-005 derives-from CAP-005' from Behavior::'SCN-005' to Needs::'CAP-005';
		#derivation connection 'REQ-STK-001 derives-from NEED-001' {
			end #original ::> Needs::'NEED-001';
			end #derive ::> Requirements::'REQ-STK-001';
		}
		#derivesFrom dependency 'REQ-STK-001 derives-from CAP-001' from Requirements::'REQ-STK-001' to Needs::'CAP-001';
		#derivation connection 'REQ-STK-002 derives-from NEED-003' {
			end #original ::> Needs::'NEED-003';
			end #derive ::> Requirements::'REQ-STK-002';
		}
		#derivesFrom dependency 'REQ-STK-002 derives-from CAP-007' from Requirements::'REQ-STK-002' to Needs::'CAP-007';
		#derivation connection 'REQ-STK-003 derives-from NEED-002' {
			end #original ::> Needs::'NEED-002';
			end #derive ::> Requirements::'REQ-STK-003';
		}
		#derivesFrom dependency 'REQ-STK-003 derives-from CAP-005' from Requirements::'REQ-STK-003' to Needs::'CAP-005';
		#derivation connection 'REQ-STK-004 derives-from NEED-005' {
			end #original ::> Needs::'NEED-005';
			end #derive ::> Requirements::'REQ-STK-004';
		}
		#derivesFrom dependency 'REQ-STK-004 derives-from CAP-008' from Requirements::'REQ-STK-004' to Needs::'CAP-008';
		#derivation connection 'REQ-STK-005 derives-from NEED-004' {
			end #original ::> Needs::'NEED-004';
			end #derive ::> Requirements::'REQ-STK-005';
		}
		#derivesFrom dependency 'REQ-STK-005 derives-from CAP-003' from Requirements::'REQ-STK-005' to Needs::'CAP-003';
		#derivation connection 'REQ-STK-006 derives-from NEED-007' {
			end #original ::> Needs::'NEED-007';
			end #derive ::> Requirements::'REQ-STK-006';
		}
		#derivesFrom dependency 'REQ-STK-006 derives-from CAP-006' from Requirements::'REQ-STK-006' to Needs::'CAP-006';
		#derivation connection 'REQ-STK-007 derives-from NEED-008' {
			end #original ::> Needs::'NEED-008';
			end #derive ::> Requirements::'REQ-STK-007';
		}
		#derivesFrom dependency 'REQ-STK-007 derives-from CAP-001' from Requirements::'REQ-STK-007' to Needs::'CAP-001';
		#derivation connection 'REQ-STK-008 derives-from NEED-006' {
			end #original ::> Needs::'NEED-006';
			end #derive ::> Requirements::'REQ-STK-008';
		}
		#derivesFrom dependency 'REQ-STK-008 derives-from CAP-009' from Requirements::'REQ-STK-008' to Needs::'CAP-009';
		#derivation connection 'REQ-STK-009 derives-from NEED-009' {
			end #original ::> Needs::'NEED-009';
			end #derive ::> Requirements::'REQ-STK-009';
		}
		#derivesFrom dependency 'REQ-STK-009 derives-from CAP-004' from Requirements::'REQ-STK-009' to Needs::'CAP-004';
		#derivation connection 'REQ-STK-010 derives-from NEED-010' {
			end #original ::> Needs::'NEED-010';
			end #derive ::> Requirements::'REQ-STK-010';
		}
		#derivesFrom dependency 'REQ-STK-010 derives-from CAP-010' from Requirements::'REQ-STK-010' to Needs::'CAP-010';
		#derivation connection 'REQ-SYS-001 derives-from REQ-STK-005' {
			end #original ::> Requirements::'REQ-STK-005';
			end #derive ::> Requirements::'REQ-SYS-001';
		}
		#derivation connection 'REQ-SYS-002 derives-from REQ-STK-002' {
			end #original ::> Requirements::'REQ-STK-002';
			end #derive ::> Requirements::'REQ-SYS-002';
		}
		#derivesFrom dependency 'REQ-SYS-003 derives-from CAP-004' from Requirements::'REQ-SYS-003' to Needs::'CAP-004';
		#derivation connection 'REQ-SYS-004 derives-from REQ-STK-003' {
			end #original ::> Requirements::'REQ-STK-003';
			end #derive ::> Requirements::'REQ-SYS-004';
		}
		#derivation connection 'REQ-SYS-005 derives-from REQ-STK-001' {
			end #original ::> Requirements::'REQ-STK-001';
			end #derive ::> Requirements::'REQ-SYS-005';
		}
		#derivesFrom dependency 'REQ-SYS-005 derives-from CAP-002' from Requirements::'REQ-SYS-005' to Needs::'CAP-002';
		#derivation connection 'REQ-SYS-006 derives-from REQ-STK-004' {
			end #original ::> Requirements::'REQ-STK-004';
			end #derive ::> Requirements::'REQ-SYS-006';
		}
		#derivation connection 'REQ-SYS-007 derives-from REQ-STK-004' {
			end #original ::> Requirements::'REQ-STK-004';
			end #derive ::> Requirements::'REQ-SYS-007';
		}
		#derivation connection 'REQ-SYS-008 derives-from REQ-STK-006' {
			end #original ::> Requirements::'REQ-STK-006';
			end #derive ::> Requirements::'REQ-SYS-008';
		}
		#derivation connection 'REQ-SYS-009 derives-from REQ-STK-008' {
			end #original ::> Requirements::'REQ-STK-008';
			end #derive ::> Requirements::'REQ-SYS-009';
		}
		#derivation connection 'REQ-SYS-010 derives-from REQ-STK-010' {
			end #original ::> Requirements::'REQ-STK-010';
			end #derive ::> Requirements::'REQ-SYS-010';
		}
		#derivesFrom dependency 'TPM-001 derives-from MOP-002' from Measures::'TPM-001' to Physical::ChargingSystems::'MOP-002';
		#derivesFrom dependency 'TPM-002 derives-from MOP-004' from Measures::'TPM-002' to Physical::EVTOLAircraft::'MOP-004';
		#derivesFrom dependency 'TPM-003 derives-from MOP-005' from Measures::'TPM-003' to Logical::FlightOperations::'MOP-005';
		#derivesFrom dependency 'CRIT-001 derives-from MOE-001' from Analysis::'CRIT-001' to Context::AeroLinkEnterprise::'MOE-001';
		#derivesFrom dependency 'CRIT-002 derives-from MOE-005' from Analysis::'CRIT-002' to Context::AeroLinkEnterprise::'MOE-005';
		#derivesFrom dependency 'CRIT-003 derives-from MOE-006' from Analysis::'CRIT-003' to Context::AeroLinkEnterprise::'MOE-006';
		#derivesFrom dependency 'CRIT-004 derives-from MOE-003' from Analysis::'CRIT-004' to Context::AeroLinkEnterprise::'MOE-003';
		#derivesFrom dependency 'FN-001 derives-from CAP-002' from Logical::'FN-001' to Needs::'CAP-002';
		#derivesFrom dependency 'FN-002 derives-from CAP-002' from Logical::'FN-002' to Needs::'CAP-002';
		#derivesFrom dependency 'FN-003 derives-from CAP-004' from Logical::'FN-003' to Needs::'CAP-004';
		#derivesFrom dependency 'FN-004 derives-from CAP-005' from Logical::'FN-004' to Needs::'CAP-005';
		#derivesFrom dependency 'FN-005 derives-from CAP-001' from Logical::'FN-005' to Needs::'CAP-001';
		#derivesFrom dependency 'FN-005 derives-from CAP-007' from Logical::'FN-005' to Needs::'CAP-007';
		#derivesFrom dependency 'FN-006 derives-from CAP-003' from Logical::'FN-006' to Needs::'CAP-003';
		#derivesFrom dependency 'FN-007 derives-from CAP-010' from Logical::'FN-007' to Needs::'CAP-010';
		#derivesFrom dependency 'FN-008 derives-from CAP-006' from Logical::'FN-008' to Needs::'CAP-006';
		#derivesFrom dependency 'FN-009 derives-from CAP-008' from Logical::'FN-009' to Needs::'CAP-008';
		#derivesFrom dependency 'FN-009 derives-from CAP-006' from Logical::'FN-009' to Needs::'CAP-006';
		#derivesFrom dependency 'FN-010 derives-from CAP-009' from Logical::'FN-010' to Needs::'CAP-009';
		#derivesFrom dependency 'FN-011 derives-from CAP-002' from Logical::'FN-011' to Needs::'CAP-002';
		#derivesFrom dependency 'FN-011 derives-from CAP-004' from Logical::'FN-011' to Needs::'CAP-004';
		#derivesFrom dependency 'FN-012 derives-from CAP-004' from Logical::'FN-012' to Needs::'CAP-004';
		#derivesFrom dependency 'FN-013 derives-from CAP-008' from Logical::'FN-013' to Needs::'CAP-008';
		#derivesFrom dependency 'FN-014 derives-from CAP-001' from Logical::'FN-014' to Needs::'CAP-001';
		#derivesFrom dependency 'FN-001 derives-from SCN-001' from Logical::'FN-001' to Behavior::'SCN-001';
		#derivesFrom dependency 'FN-002 derives-from SCN-001' from Logical::'FN-002' to Behavior::'SCN-001';
		#derivesFrom dependency 'FN-003 derives-from SCN-002' from Logical::'FN-003' to Behavior::'SCN-002';
		#derivesFrom dependency 'FN-004 derives-from SCN-005' from Logical::'FN-004' to Behavior::'SCN-005';
		#derivesFrom dependency 'FN-005 derives-from SCN-002' from Logical::'FN-005' to Behavior::'SCN-002';
		#derivesFrom dependency 'FN-006 derives-from SCN-003' from Logical::'FN-006' to Behavior::'SCN-003';
		#derivesFrom dependency 'FN-007 derives-from SCN-003' from Logical::'FN-007' to Behavior::'SCN-003';
		#derivesFrom dependency 'FN-008 derives-from SCN-004' from Logical::'FN-008' to Behavior::'SCN-004';
		#derivesFrom dependency 'FN-009 derives-from SCN-004' from Logical::'FN-009' to Behavior::'SCN-004';
		#derivesFrom dependency 'FN-010 derives-from SCN-003' from Logical::'FN-010' to Behavior::'SCN-003';
		#derivesFrom dependency 'FN-011 derives-from SCN-002' from Logical::'FN-011' to Behavior::'SCN-002';
		#derivesFrom dependency 'FN-012 derives-from SCN-002' from Logical::'FN-012' to Behavior::'SCN-002';
		#derivesFrom dependency 'FN-014 derives-from SCN-002' from Logical::'FN-014' to Behavior::'SCN-002';
		// refines (3)
		#refinement dependency 'CAP-002 refines CAP-001' from Needs::'CAP-002' to Needs::'CAP-001';
		#refinement dependency 'CAP-005 refines CAP-004' from Needs::'CAP-005' to Needs::'CAP-004';
		#refinement dependency 'CAP-010 refines CAP-003' from Needs::'CAP-010' to Needs::'CAP-003';
		// satisfies (15)
		satisfy Requirements::'REQ-SYS-001' by Physical::aeroLink.'PHY-003';
		#satisfies dependency 'IF-005 satisfies REQ-SYS-001' from Physical::aeroLink::'IF-005' to Requirements::'REQ-SYS-001';
		satisfy Requirements::'REQ-SYS-002' by Physical::aeroLink.'PHY-001';
		satisfy Requirements::'REQ-SYS-003' by Logical::logicalArchitecture.'LOG-001';
		satisfy Requirements::'REQ-SYS-004' by Logical::logicalArchitecture.'LOG-006';
		satisfy Requirements::'REQ-SYS-005' by Logical::logicalArchitecture.'LOG-005';
		satisfy Requirements::'REQ-SYS-006' by Logical::logicalArchitecture.'LOG-002';
		satisfy Requirements::'REQ-SYS-007' by Physical::aeroLink.'PHY-001';
		satisfy Requirements::'REQ-SYS-008' by Logical::logicalArchitecture.'LOG-003';
		satisfy Requirements::'REQ-SYS-009' by Physical::aeroLink.'PHY-008';
		#satisfies dependency 'IF-007 satisfies REQ-SYS-009' from Context::aeroLinkContext::'IF-007' to Requirements::'REQ-SYS-009';
		satisfy Requirements::'REQ-SYS-010' by Physical::aeroLink.'PHY-003';
		#satisfies dependency 'IF-006 satisfies REQ-SYS-010' from Context::aeroLinkContext::'IF-006' to Requirements::'REQ-SYS-010';
		#satisfies dependency 'IF-003 satisfies REQ-STK-009' from Context::aeroLinkContext::'IF-003' to Requirements::'REQ-STK-009';
		#satisfies dependency 'PHY-002 satisfies REQ-STK-007' from Physical::aeroLink::'PHY-002' to Requirements::'REQ-STK-007';
		// allocated-to (41)
		allocation 'FN-001 allocated-to PHY-007' allocate Logical::'FN-001' to Physical::aeroLink.'PHY-007';
		allocation 'FN-002 allocated-to PHY-004' allocate Logical::'FN-002' to Physical::aeroLink.'PHY-004';
		allocation 'FN-003 allocated-to PHY-004' allocate Logical::'FN-003' to Physical::aeroLink.'PHY-004';
		allocation 'FN-004 allocated-to PHY-004' allocate Logical::'FN-004' to Physical::aeroLink.'PHY-004';
		allocation 'FN-005 allocated-to PHY-001' allocate Logical::'FN-005' to Physical::aeroLink.'PHY-001';
		allocation 'FN-006 allocated-to PHY-003' allocate Logical::'FN-006' to Physical::aeroLink.'PHY-003';
		allocation 'FN-007 allocated-to PHY-003' allocate Logical::'FN-007' to Physical::aeroLink.'PHY-003';
		allocation 'FN-008 allocated-to PHY-005' allocate Logical::'FN-008' to Physical::aeroLink.'PHY-005';
		allocation 'FN-009 allocated-to PHY-004' allocate Logical::'FN-009' to Physical::aeroLink.'PHY-004';
		allocation 'FN-010 allocated-to PHY-008' allocate Logical::'FN-010' to Physical::aeroLink.'PHY-008';
		allocation 'FN-011 allocated-to PHY-004' allocate Logical::'FN-011' to Physical::aeroLink.'PHY-004';
		allocation 'FN-012 allocated-to PHY-004' allocate Logical::'FN-012' to Physical::aeroLink.'PHY-004';
		allocation 'FN-013 allocated-to PHY-004' allocate Logical::'FN-013' to Physical::aeroLink.'PHY-004';
		allocation 'FN-014 allocated-to PHY-002' allocate Logical::'FN-014' to Physical::aeroLink.'PHY-002';
		allocation 'LOG-001 allocated-to PHY-001' allocate Logical::logicalArchitecture.'LOG-001' to Physical::aeroLink.'PHY-001';
		allocation 'LOG-001 allocated-to PHY-004' allocate Logical::logicalArchitecture.'LOG-001' to Physical::aeroLink.'PHY-004';
		allocation 'LOG-002 allocated-to PHY-003' allocate Logical::logicalArchitecture.'LOG-002' to Physical::aeroLink.'PHY-003';
		allocation 'LOG-002 allocated-to PHY-004' allocate Logical::logicalArchitecture.'LOG-002' to Physical::aeroLink.'PHY-004';
		allocation 'LOG-003 allocated-to PHY-005' allocate Logical::logicalArchitecture.'LOG-003' to Physical::aeroLink.'PHY-005';
		allocation 'LOG-004 allocated-to PHY-007' allocate Logical::logicalArchitecture.'LOG-004' to Physical::aeroLink.'PHY-007';
		allocation 'LOG-004 allocated-to PHY-004' allocate Logical::logicalArchitecture.'LOG-004' to Physical::aeroLink.'PHY-004';
		allocation 'LOG-005 allocated-to PHY-004' allocate Logical::logicalArchitecture.'LOG-005' to Physical::aeroLink.'PHY-004';
		allocation 'LOG-006 allocated-to PHY-004' allocate Logical::logicalArchitecture.'LOG-006' to Physical::aeroLink.'PHY-004';
		allocation 'LOG-007 allocated-to PHY-002' allocate Logical::logicalArchitecture.'LOG-007' to Physical::aeroLink.'PHY-002';
		allocation 'LOG-007 allocated-to PHY-008' allocate Logical::logicalArchitecture.'LOG-007' to Physical::aeroLink.'PHY-008';
		allocation 'REQ-SYS-001 allocated-to FN-006' allocate Requirements::'REQ-SYS-001' to Logical::'FN-006';
		allocation 'REQ-SYS-002 allocated-to FN-005' allocate Requirements::'REQ-SYS-002' to Logical::'FN-005';
		allocation 'REQ-SYS-003 allocated-to FN-003' allocate Requirements::'REQ-SYS-003' to Logical::'FN-003';
		allocation 'REQ-SYS-004 allocated-to FN-004' allocate Requirements::'REQ-SYS-004' to Logical::'FN-004';
		allocation 'REQ-SYS-005 allocated-to FN-002' allocate Requirements::'REQ-SYS-005' to Logical::'FN-002';
		allocation 'REQ-SYS-006 allocated-to FN-009' allocate Requirements::'REQ-SYS-006' to Logical::'FN-009';
		allocation 'REQ-SYS-007 allocated-to FN-005' allocate Requirements::'REQ-SYS-007' to Logical::'FN-005';
		allocation 'REQ-SYS-008 allocated-to FN-008' allocate Requirements::'REQ-SYS-008' to Logical::'FN-008';
		allocation 'REQ-SYS-009 allocated-to FN-010' allocate Requirements::'REQ-SYS-009' to Logical::'FN-010';
		allocation 'REQ-SYS-010 allocated-to FN-007' allocate Requirements::'REQ-SYS-010' to Logical::'FN-007';
		allocation 'REQ-STK-001 allocated-to FN-001' allocate Requirements::'REQ-STK-001' to Logical::'FN-001';
		allocation 'REQ-STK-006 allocated-to FN-011' allocate Requirements::'REQ-STK-006' to Logical::'FN-011';
		allocation 'REQ-STK-007 allocated-to FN-014' allocate Requirements::'REQ-STK-007' to Logical::'FN-014';
		allocation 'REQ-STK-009 allocated-to FN-012' allocate Requirements::'REQ-STK-009' to Logical::'FN-012';
		allocation 'AI-001 allocated-to PHY-005' allocate Logical::logicalArchitecture.'AI-001' to Physical::aeroLink.'PHY-005';
		allocation 'AI-002 allocated-to PHY-004' allocate Logical::logicalArchitecture.'AI-002' to Physical::aeroLink.'PHY-004';
		// flows-to (7)
		#receivesFrom dependency 'INFO-001 flows-to AI-002' from Logical::logicalArchitecture::'AI-002' to Physical::'INFO-001';
		#receivesFrom dependency 'INFO-003 flows-to AI-001' from Logical::logicalArchitecture::'AI-001' to Physical::'INFO-003';
		#receivesFrom dependency 'PHY-007 flows-to INFO-005' from Physical::'INFO-005' to Physical::aeroLink::'PHY-007';
		#receivesFrom dependency 'LOG-002 flows-to INFO-005' from Physical::'INFO-005' to Logical::logicalArchitecture::'LOG-002';
		#receivesFrom dependency 'INFO-005 flows-to DEC-001' from Analysis::'DEC-001' to Physical::'INFO-005';
		#receivesFrom dependency 'AI-001 flows-to PHY-005' from Physical::aeroLink::'PHY-005' to Logical::logicalArchitecture::'AI-001';
		#receivesFrom dependency 'AI-002 flows-to DEC-001' from Analysis::'DEC-001' to Logical::logicalArchitecture::'AI-002';
		// measures (41)
		#measures dependency 'MOE-001 measures NEED-001' from Context::AeroLinkEnterprise::'MOE-001' to Needs::'NEED-001';
		#measures dependency 'MOE-001 measures CAP-001' from Context::AeroLinkEnterprise::'MOE-001' to Needs::'CAP-001';
		#measures dependency 'MOE-001 measures MGO-005' from Context::AeroLinkEnterprise::'MOE-001' to Needs::'MGO-005';
		#measures dependency 'MOE-002 measures NEED-005' from Context::AeroLinkEnterprise::'MOE-002' to Needs::'NEED-005';
		#measures dependency 'MOE-002 measures CAP-008' from Context::AeroLinkEnterprise::'MOE-002' to Needs::'CAP-008';
		#measures dependency 'MOE-002 measures MGO-007' from Context::AeroLinkEnterprise::'MOE-002' to Needs::'MGO-007';
		#measures dependency 'MOE-003 measures NEED-003' from Context::AeroLinkEnterprise::'MOE-003' to Needs::'NEED-003';
		#measures dependency 'MOE-003 measures CAP-007' from Context::AeroLinkEnterprise::'MOE-003' to Needs::'CAP-007';
		#measures dependency 'MOE-003 measures MGO-006' from Context::AeroLinkEnterprise::'MOE-003' to Needs::'MGO-006';
		#measures dependency 'MOE-004 measures NEED-002' from Context::AeroLinkEnterprise::'MOE-004' to Needs::'NEED-002';
		#measures dependency 'MOE-004 measures CAP-004' from Context::AeroLinkEnterprise::'MOE-004' to Needs::'CAP-004';
		#measures dependency 'MOE-004 measures CAP-005' from Context::AeroLinkEnterprise::'MOE-004' to Needs::'CAP-005';
		#measures dependency 'MOE-004 measures MGO-008' from Context::AeroLinkEnterprise::'MOE-004' to Needs::'MGO-008';
		#measures dependency 'MOE-005 measures NEED-005' from Context::AeroLinkEnterprise::'MOE-005' to Needs::'NEED-005';
		#measures dependency 'MOE-005 measures MGO-004' from Context::AeroLinkEnterprise::'MOE-005' to Needs::'MGO-004';
		#measures dependency 'MOE-006 measures NEED-001' from Context::AeroLinkEnterprise::'MOE-006' to Needs::'NEED-001';
		#measures dependency 'MOE-006 measures CAP-005' from Context::AeroLinkEnterprise::'MOE-006' to Needs::'CAP-005';
		#measures dependency 'MOP-001 measures MOE-001' from Logical::Scheduling::'MOP-001' to Context::AeroLinkEnterprise::'MOE-001';
		#measures dependency 'MOP-001 measures REQ-SYS-005' from Logical::Scheduling::'MOP-001' to Requirements::'REQ-SYS-005';
		#measures dependency 'MOP-002 measures MOE-001' from Physical::ChargingSystems::'MOP-002' to Context::AeroLinkEnterprise::'MOE-001';
		#measures dependency 'MOP-002 measures REQ-SYS-001' from Physical::ChargingSystems::'MOP-002' to Requirements::'REQ-SYS-001';
		#measures dependency 'MOP-002 measures REQ-STK-005' from Physical::ChargingSystems::'MOP-002' to Requirements::'REQ-STK-005';
		#measures dependency 'MOP-003 measures MOE-002' from Physical::EVTOLAircraft::'MOP-003' to Context::AeroLinkEnterprise::'MOE-002';
		#measures dependency 'MOP-003 measures REQ-SYS-007' from Physical::EVTOLAircraft::'MOP-003' to Requirements::'REQ-SYS-007';
		#measures dependency 'MOP-004 measures MOE-003' from Physical::EVTOLAircraft::'MOP-004' to Context::AeroLinkEnterprise::'MOE-003';
		#measures dependency 'MOP-004 measures REQ-SYS-002' from Physical::EVTOLAircraft::'MOP-004' to Requirements::'REQ-SYS-002';
		#measures dependency 'MOP-004 measures REQ-STK-002' from Physical::EVTOLAircraft::'MOP-004' to Requirements::'REQ-STK-002';
		#measures dependency 'MOP-005 measures MOE-004' from Logical::FlightOperations::'MOP-005' to Context::AeroLinkEnterprise::'MOE-004';
		#measures dependency 'MOP-005 measures REQ-SYS-003' from Logical::FlightOperations::'MOP-005' to Requirements::'REQ-SYS-003';
		#measures dependency 'MOP-006 measures MOE-002' from Logical::FleetManagement::'MOP-006' to Context::AeroLinkEnterprise::'MOE-002';
		#measures dependency 'MOP-006 measures REQ-SYS-006' from Logical::FleetManagement::'MOP-006' to Requirements::'REQ-SYS-006';
		#measures dependency 'MOP-007 measures MOE-004' from Logical::MaintenanceManagement::'MOP-007' to Context::AeroLinkEnterprise::'MOE-004';
		#measures dependency 'MOP-007 measures REQ-SYS-008' from Logical::MaintenanceManagement::'MOP-007' to Requirements::'REQ-SYS-008';
		#measures dependency 'MOP-008 measures MOE-004' from Physical::PadFireDetectionSystem::'MOP-008' to Context::AeroLinkEnterprise::'MOE-004';
		#measures dependency 'MOP-008 measures REQ-SYS-009' from Physical::PadFireDetectionSystem::'MOP-008' to Requirements::'REQ-SYS-009';
		#measures dependency 'MOP-008 measures REQ-STK-008' from Physical::PadFireDetectionSystem::'MOP-008' to Requirements::'REQ-STK-008';
		#measures dependency 'MOP-009 measures MOE-002' from Physical::ChargingSystems::'MOP-009' to Context::AeroLinkEnterprise::'MOE-002';
		#measures dependency 'MOP-009 measures REQ-SYS-010' from Physical::ChargingSystems::'MOP-009' to Requirements::'REQ-SYS-010';
		#measures dependency 'TPM-001 measures REQ-SYS-001' from Measures::'TPM-001' to Requirements::'REQ-SYS-001';
		#measures dependency 'TPM-002 measures REQ-SYS-002' from Measures::'TPM-002' to Requirements::'REQ-SYS-002';
		#measures dependency 'TPM-003 measures REQ-SYS-003' from Measures::'TPM-003' to Requirements::'REQ-SYS-003';
		// mitigates (12)
		#mitigates dependency 'TECH-001 mitigates R-001' from Analysis::'TECH-001' to AROU::'R-001';
		#mitigates dependency 'REQ-SYS-009 mitigates R-008' from Requirements::'REQ-SYS-009' to AROU::'R-008';
		#mitigates dependency 'REQ-STK-008 mitigates R-008' from Requirements::'REQ-STK-008' to AROU::'R-008';
		#mitigates dependency 'REQ-SYS-010 mitigates R-005' from Requirements::'REQ-SYS-010' to AROU::'R-005';
		#mitigates dependency 'DEC-001 mitigates R-001' from Analysis::'DEC-001' to AROU::'R-001';
		#mitigates dependency 'PHY-008 mitigates R-008' from Physical::aeroLink::'PHY-008' to AROU::'R-008';
		#mitigates dependency 'LOG-003 mitigates R-002' from Logical::logicalArchitecture::'LOG-003' to AROU::'R-002';
		#mitigates dependency 'AI-001 mitigates R-002' from Logical::logicalArchitecture::'AI-001' to AROU::'R-002';
		#mitigates dependency 'AI-002 mitigates R-001' from Logical::logicalArchitecture::'AI-002' to AROU::'R-001';
		#mitigates dependency 'DEC-002 mitigates R-007' from Analysis::'DEC-002' to AROU::'R-007';
		#mitigates dependency 'VER-002 mitigates R-003' from Verification::'VER-002' to AROU::'R-003';
		#mitigates dependency 'VER-010 mitigates R-005' from Verification::'VER-010' to AROU::'R-005';
		// affects (13)
		#affectedBy dependency 'EXT-003 affects SCN-005' from Behavior::'SCN-005' to Context::aeroLinkContext::'EXT-003';
		#affectedBy dependency 'TECH-001 affects REQ-SYS-001' from Requirements::'REQ-SYS-001' to Analysis::'TECH-001';
		#affectedBy dependency 'TECH-001 affects CAP-003' from Needs::'CAP-003' to Analysis::'TECH-001';
		#affectedBy dependency 'TECH-002 affects REQ-SYS-003' from Requirements::'REQ-SYS-003' to Analysis::'TECH-002';
		#affectedBy dependency 'TECH-002 affects REQ-SYS-007' from Requirements::'REQ-SYS-007' to Analysis::'TECH-002';
		#affectedBy dependency 'TECH-003 affects CAP-004' from Needs::'CAP-004' to Analysis::'TECH-003';
		#affectedBy dependency 'DEC-001 affects ALT-004' from Analysis::'ALT-004' to Analysis::'DEC-001';
		#affectedBy dependency 'DEC-001 affects REQ-STK-004' from Requirements::'REQ-STK-004' to Analysis::'DEC-001';
		#affectedBy dependency 'TECH-001 affects ALT-004' from Analysis::'ALT-004' to Analysis::'TECH-001';
		#affectedBy dependency 'DEC-002 affects PHY-004' from Physical::aeroLink::'PHY-004' to Analysis::'DEC-002';
		#affectedBy dependency 'TECH-001 affects PHY-003' from Physical::aeroLink::'PHY-003' to Analysis::'TECH-001';
		#affectedBy dependency 'TECH-002 affects PHY-001' from Physical::aeroLink::'PHY-001' to Analysis::'TECH-002';
		#affectedBy dependency 'TECH-003 affects PHY-001' from Physical::aeroLink::'PHY-001' to Analysis::'TECH-003';
	}
}

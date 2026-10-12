// AeroLink Urban Mobility: instructor reference SysML v2 model, v0.1 skeleton (L9).
// Generated from the instructor reference baseline (learning-studio/src/model/reference/week*.ts) and checked
// with the OMG SysML v2 Pilot Implementation release 2026-08 (kernel 0.62.0) via `npm run content:sysml`.
// Content at this level: L9 package structure; ENT, EXT, STK, CON, MGO, NEED, CAP, SCN (use cases) and 8 PHY part definitions / usages with typed attributes.
// Conventions (LABORATORY_AND_CAPSTONE_PLAN.md C.2): course IDs are short names written as quoted unrestricted
// names in the form <'ID'> (S06 p.49-50, p.165); references use the short name. Course relationships that are
// not SysML keywords are dependencies named '<source> <link type> <target>' and tagged with semantic metadata
// (#derivesFrom, #affects, ...), the library Derivation connection (#derivation) or the library Refinement
// (#refinement). See sysml/reference/README.md for the full mapping.
// FICTIONAL VALUES (teaching values, not real-world data): every number in this file comes from the AeroLink Data
// Sheet or the instructor baseline: 6 vertiports (3 hubs, 3 spokes), 12 aircraft (16 planned by DEC-001), 4 seats,
// 150 km/h cruise, 25 km design trip, 16 min block time, 20 min charge, 25 min hub turnaround, 16 h operating day,
// 20 % energy reserve, 65 dB(A) pad-edge limit, 15 min wait, 60 s assignment, 2 min no-go flag, 30 s / 60 s fire
// alarm, 90 % availability, 300 trips/day capacity, 12 chargers (6 high-power at hubs), TPM estimates 18 min /
// 63.5 dB(A) / 23 %, trade-study weights 0.40/0.30/0.16/0.14. TBD-01 (weather limits) and TBD-02 (grid limit)
// are left unvalued on purpose. Charger occupancy (A-007): 20 min on the charger per 25 min turnaround, i.e. 48
// charges per turnaround charger per 16 h day.

package 'AeroLink Reference Model' {
	doc /* AeroLink Urban Mobility instructor reference model, v0.1 skeleton (L9). All values FICTIONAL (teaching values). */
	private import ISQ::*;
	private import SI::*;
	private import ScalarValues::*;
	private import ModelingMetadata::*;
	private import RequirementDerivation::*;
	// Semantic tags for course relationship types that are not SysML keywords (C.2 rule 4).
	metadata def <derivesFrom> DerivesFromLink {
		doc /* derives-from: the client is derived from the supplier (used where both ends are not requirements; requirement-to-requirement derivation uses the library #derivation connection). */
		:> annotatedElement : SysML::Dependency;
	}
	metadata def <affects> AffectsLink {
		doc /* affects: the client (technology, decision or external system) affects the supplier. AROU items record affects through the elements their metadata is about. */
		:> annotatedElement : SysML::Dependency;
	}
	package Context {
		doc /* ENT and EXT elements: the system of interest and its context (L9 package Context). */
		part def <'ENT-001'> AeroLinkEnterprise {
			doc /* AeroLink Urban Mobility service enterprise. Fleet, vertiports and chargers, operations centre and passenger demand, bounded for the question of passenger waiting time. */
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
			attribute passengerWaitP90 : DurationValue;
			attribute dailyTripsServed : Real;
			attribute noiseComplianceRate : Real;
			attribute dispatchesOutsideLimits : Natural;
			attribute capitalForYear2Capacity : Real;
			attribute capacityRetainedAfterHubLoss : Real;
		}
		part def AirNavigationServiceProvider;
		part def ElectricUtilityGrid;
		part def WeatherSystem;
		part def AircraftManufacturer;
		part def PublicTransportNetwork;
		part def EmergencyServices;
		part aeroLinkContext {
			doc /* Operating context: the AeroLink system of interest (Physical::aeroLink) and the six external systems. */
			ref part systemOfInterest :> Physical::aeroLink;
			part <'EXT-001'> ansp : AirNavigationServiceProvider { doc /* Air navigation service provider. Provides airspace access and traffic integration. */ }
			part <'EXT-002'> utilityGrid : ElectricUtilityGrid { doc /* Electric utility grid. Supplies power to vertiport chargers. */ }
			part <'EXT-003'> weather : WeatherSystem { doc /* Weather. Natural system constraining operations. */ }
			part <'EXT-004'> oem : AircraftManufacturer { doc /* Aircraft manufacturer (OEM). Supplies aircraft and parts; sets delivery lead time. */ }
			part <'EXT-005'> publicTransport : PublicTransportNetwork { doc /* Public transport network. Connects passengers to and from vertiports. */ }
			part <'EXT-006'> emergencyServices : EmergencyServices { doc /* Emergency services. Respond to incidents at vertiports and in flight. */ }
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
		concern <'CON-015'> 'Fleet delivery and certification progress' {
			doc /* The aircraft manufacturer is concerned that AeroLink's orders, operating data and certification milestones arrive as planned, because delivery slots and certification progress set its own production plan. */
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
		doc /* Populated in v0.2 (CP2 requirements set carried into the model). */
	}
	package Logical {
		doc /* FN as action usages, LOG elements and AI capabilities as parts of the logical architecture; perform realises LOG/AI performs FN (L8 / CP3). */
		// Populated in v0.2 (CP3 logical architecture).
	}
	package Physical {
		doc /* PHY part definitions and the physical architecture usage aeroLink (system of interest); ports, interfaces (IF) and item flows (INFO) from v0.2. */
		part def EVTOLAircraft {
			attribute seats : Natural = 4;
			attribute cruiseSpeed : SpeedValue = 150 [km/h];
			attribute designTripBlockTime : DurationValue;
			attribute padEdgeNoise : SoundPressureLevelValue;
		}
		part def VertiportNetwork {
			attribute sites : Natural = 6;
			attribute hubs : Natural = 3;
			attribute spokes : Natural = 3;
			attribute hubTurnaroundTime : DurationValue;
			attribute stepFreeRouteAtEverySite : Boolean;
		}
		part def ChargingSystems {
			attribute installed : Natural = 12;
			attribute highPowerAtHubs : Natural = 6;
			attribute standardAtSpokes : Natural = 6;
			attribute chargesPerChargerPerDay : Natural = 48;
			attribute connectionLimit : PowerValue { doc /* TBD-02, pending U-002. */ }
			attribute chargeTimeToDispatch : DurationValue;
			attribute peakVertiportChargingPower : PowerValue;
		}
		part def OperationsCenter {
			attribute sites : Natural = 1;
			attribute hotStandby : Boolean = true; // DEC-002
			attribute operatingDay : DurationValue = 16 [h];
		}
		part def MaintenanceFacility {
			attribute sites : Natural = 1;
			attribute batteryWorkshop : Boolean = true;
			attribute faultReportToFlagTime : DurationValue;
		}
		part def CommunicationsInfrastructure {
			attribute media : String = "datalink + ground network";
			attribute messageLatency : DurationValue;
		}
		part def PassengerBookingPlatform {
			attribute maxPartySize : Natural = 4;
			attribute requestToQuoteTime : DurationValue;
		}
		part def PadFireDetectionSystem {
			attribute padsCovered : String = "all";
			attribute alarmTransmissionTime : DurationValue;
		}
		part aeroLink : Context::AeroLinkEnterprise {
			doc /* The AeroLink system of interest: the physical architecture (S04 Lab 6 elements PHY-001..006 plus PHY-007, PHY-008). */
			part <'PHY-001'> aircraft : EVTOLAircraft[12] {
				doc /* eVTOL Aircraft. Four-seat electric vertical take-off and landing aircraft. */
				attribute :>> padEdgeNoise = 63.5 [dB]; // current estimate (TPM-002, FICTIONAL); baseline 12 aircraft, 16 planned (DEC-001)
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
			actor airNavigationServiceProvider : Context::AirNavigationServiceProvider; // EXT-001 performs SCN-005
			objective { doc /* End state: Success: All aircraft on the ground or safely diverted; no flight dispatched outside limits; the backlog flown within the day. Failure/degraded: Service at V3 suspended for the day with every affected passenger re-accommodated or refunded and no flight outside limits. */ }
		}
	}
	package Verification {
		doc /* VER as verification cases: method (VerificationMethod metadata), objective with verify, and a verdict computed from the recorded results (pass / fail / inconclusive; error is a procedural verdict recorded by the test conductor) (L12 / CP5). */
		// Populated in v0.4 (CP5 verification).
	}
	package AROU {
		doc /* Assumptions, risks, opportunities and unknowns as named metadata annotations; the elements each item is about realise AROU affects X. Risks specialise the library RiskMetadata::Risk (probability = likelihood / 5, impact = consequence / 5). */
		// Populated in v0.4 (AROU v2, CP2 content carried into the model at CP5).
	}
	package Traceability {
		doc /* Course relationships that are realised as separate SysML relationships, each named <source> <link type> <target>: #derivation connections, #derivesFrom / #refinement / #affects / #mitigates / #measures / #flowsTo / #satisfies dependencies, satisfy and allocate. Relationships realised inside element bodies (stakeholder, frame, actor, perform, verify, item flows, AROU metadata about) are listed in README.md. */
		// derives-from (29)
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
		// refines (3)
		#refinement dependency 'CAP-002 refines CAP-001' from Needs::'CAP-002' to Needs::'CAP-001';
		#refinement dependency 'CAP-005 refines CAP-004' from Needs::'CAP-005' to Needs::'CAP-004';
		#refinement dependency 'CAP-010 refines CAP-003' from Needs::'CAP-010' to Needs::'CAP-003';
		// affects (1)
		#affects dependency 'EXT-003 affects SCN-005' from Context::aeroLinkContext::'EXT-003' to Behavior::'SCN-005';
	}
}

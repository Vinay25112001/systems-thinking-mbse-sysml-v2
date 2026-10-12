// The instructor reference model's realisation of the 20 AeroLink requirements (sysml/reference/
// aerolink_v02_req_structure.sysml, validated with the course-designated checker), written as translator fields.
// Used only in tests (AUTHORING_GUIDE §7 rule 4: the reference must pass the activity's own checks) and as the
// instructor answer key. The test also checks that every subject and constraint string occurs in the v0.2 file,
// so that a change to the reference model cannot silently diverge from this table. Values FICTIONAL.
import type { Translation } from './translator'

type Row = { subject: string; param?: [string, string, string]; constraint: string }

export const REFERENCE_ROWS: Record<string, Row> = {
  'REQ-STK-001': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['maxWaitP90', 'DurationValue', '15 [min]'], constraint: 'enterprise.passengerWaitP90 <= maxWaitP90' },
  'REQ-STK-002': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['noiseLimit', 'SoundPressureLevelValue', '65 [dB]'], constraint: 'enterprise.maxPadEdgeNoise <= noiseLimit' },
  'REQ-STK-003': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['weatherLimits', 'Real[0..*]', ''], constraint: 'enterprise.dispatchesBeyondWeatherLimits == 0' },
  'REQ-STK-004': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['minCapacity', 'Real', '300'], constraint: 'enterprise.networkCapacity >= minCapacity' },
  'REQ-STK-005': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['maxTurnaround', 'DurationValue', '25 [min]'], constraint: 'enterprise.hubTurnaroundTime <= maxTurnaround' },
  'REQ-STK-006': { subject: 'enterprise : Context::AeroLinkEnterprise', constraint: 'enterprise.dispatchesWithOpenNoGoFault == 0' },
  'REQ-STK-007': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['vertiportsRequired', 'Natural', '6'], constraint: 'enterprise.stepFreeVertiports >= vertiportsRequired' },
  'REQ-STK-008': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['maxAlertTime', 'DurationValue', '60 [s]'], constraint: 'enterprise.responderAlertTime <= maxAlertTime' },
  'REQ-STK-009': { subject: 'enterprise : Context::AeroLinkEnterprise', constraint: 'enterprise.flightIntentAcceptedBeforeTakeOff' },
  'REQ-STK-010': { subject: 'enterprise : Context::AeroLinkEnterprise', param: ['connectionLimit', 'PowerValue', ''], constraint: 'enterprise.peakVertiportChargingPower <= connectionLimit' },
  'REQ-SYS-001': { subject: 'chargingSystem : Physical::ChargingSystems', param: ['maxChargeTime', 'DurationValue', '20 [min]'], constraint: 'chargingSystem.chargeTimeToDispatch <= maxChargeTime' },
  'REQ-SYS-002': { subject: 'aircraft : Physical::EVTOLAircraft', param: ['noiseLimit', 'SoundPressureLevelValue', '65 [dB]'], constraint: 'aircraft.padEdgeNoise <= noiseLimit' },
  'REQ-SYS-003': { subject: 'flightPlanning : Logical::FlightOperations', param: ['minLandingEnergyFraction', 'Real', '0.20'], constraint: 'flightPlanning.plannedLandingEnergyFraction >= minLandingEnergyFraction' },
  'REQ-SYS-004': { subject: 'operationsSystem : Logical::DecisionSupport', param: ['forecastHorizon', 'DurationValue', '30 [min]'], constraint: 'operationsSystem.holdPlacedForEveryExceedance' },
  'REQ-SYS-005': { subject: 'scheduling : Logical::Scheduling', param: ['maxAssignmentLatency', 'DurationValue', '60 [s]'], constraint: 'scheduling.assignmentLatencyP99 <= maxAssignmentLatency' },
  'REQ-SYS-006': { subject: 'fleet : Logical::FleetManagement', param: ['minAvailability', 'Real', '0.90'], constraint: 'fleet.fleetAvailability >= minAvailability' },
  'REQ-SYS-007': { subject: 'aircraft : Physical::EVTOLAircraft', param: ['maxBlockTime', 'DurationValue', '16 [min]'], constraint: 'aircraft.designTripBlockTime <= maxBlockTime' },
  'REQ-SYS-008': { subject: 'maintenanceManagement : Logical::MaintenanceManagement', param: ['maxFlagLatency', 'DurationValue', '2 [min]'], constraint: 'maintenanceManagement.noGoFlagLatency <= maxFlagLatency' },
  'REQ-SYS-009': { subject: 'fireDetection : Physical::PadFireDetectionSystem', param: ['maxTransmissionTime', 'DurationValue', '30 [s]'], constraint: 'fireDetection.alarmTransmissionTime <= maxTransmissionTime' },
  'REQ-SYS-010': { subject: 'chargingSystem : Physical::ChargingSystems', param: ['connectionLimit', 'PowerValue', ''], constraint: 'chargingSystem.peakVertiportChargingPower <= connectionLimit' },
}

/** The reference realisation of one requirement as translator fields (name and statement from the workspace element). */
export function referenceTranslation(id: string, name: string, text: string): Translation {
  const r = REFERENCE_ROWS[id]
  const [subjectName, subjectType] = r.subject.split(' : ')
  return {
    shortName: `<'${id}'>`,
    declaredName: `'${name}'`,
    docText: text,
    subjectName,
    subjectType,
    paramName: r.param?.[0] ?? '',
    paramType: r.param?.[1] ?? '',
    paramValue: r.param?.[2] ?? '',
    constraint: r.constraint,
  }
}

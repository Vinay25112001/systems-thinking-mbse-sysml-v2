// Lecture figure registry: a lecture slide or lesson names a figure by id; this table maps the id to the React SVG
// component that draws it. The same components draw the Learn-stage figures, the web slide viewer, the reader and the
// PNGs embedded in the generated .pptx (rendered at #/figure/:id), so a figure is designed once for every output.
// Only static drawings belong here: an interactive figure (e.g. BoundaryLayers, which has its own controls) cannot be
// captured as one PNG. Adding a figure: docs/lectures/PIPELINE.md, "Adding a figure".
import { createElement, type ComponentType, type ReactElement } from 'react'
import { CapacityCrossover, ControlRings, LifeCycleAgents } from './EngineeringFigures'
import { EnterpriseScopeFigure, NeedAnatomyFigure, NeedChainFigure, RegisterRowFigure, StakeholderSourcesFigure, TeamCharterFigure, WeekPathFigure } from './StakeholderFigures'
import { ControlHierarchy, DownAndUp, JamFigure, LessThanSum, LoopPair, OpenSystemFigure } from './SystemFigures'
// --- week01 session2 ---
import { AdjudicationFigure, CharterOwnersFigure, MethodsWhyFigure, ConcernLadderFigure, CoverageMatrixFigure, DraftToNeedFigure, ElicitationMatrixFigure, InfluenceSupportFigure, IntegratedSetFigure, NeedAnatomyLevelFigure, NeedAttributesFigure, NeedsCatalogFigure, NeedVsRequirementFigure, OneNeedManyFigure, PitchCardFigure, RecordPartsFigure, RelationshipMapFigure, SevenDaysFigure, TraceLanesFigure, ValidationVFigure, WeakRegisterFigure, WhyLadderFigure } from './LectureWeek1S2'
// --- end week01 session2 ---
// --- week01 session1 ---
import { AerolinkNetworkFigure, ApprovalGatesFigure, BmaSndFigure, BoundaryAnatomyFigure, CharterTuckmanFigure, CommPathsFigure, ContextLayersFigure, ContextRolesFigure, ControlInfluenceFigure, EnterpriseNestingFigure, ExitPrepFigure, InfluenceMapsFigure, IptStructureFigure, LifeCycleFigure, LifecycleSweepFigure, MethodVennFigure, MissingStakeholderFigure, ProcessStripFigure, SoiEnablingFigure, StakeholderScopeFigure, ThreeScopesFigure, TwoPhasesFigure, VertiportSceneFigure } from './LectureWeek1S1'
// --- end week01 session1 ---

// --- week02 ---
import { ActorsThreadsFigure, AnswerFigure, BeforeAfterFigure, CapabilityGapsFigure, CapabilityTreeFigure, ChainBudgetFigure, ConopsLevelsFigure, ConopsTimelineFigure, ConopsTocFigure, CoverageGridFigure, DiscoveriesFigure, DrivingQuestionFigure, FcbLadderFigure, MirrorFigure, NeedsScenariosMatrixFigure, Ov1StoryboardFigure, ProcessInputsFigure, ReviewScn001Figure, ScenarioCardFigure, Scn005SwimlaneFigure, StaircaseFigure, WeekBandFigure } from './LectureWeek2S1'
import { BridgeFigure, CharacteristicsFigure, ClinicCardFigure, CritiqueTableFigure, MeasuresLinksFigure, MeasuresPyramidFigure, MethodsFigure, NegativeTbdFigure, NoiseSplitFigure, OrphanChildlessFigure, RecordPartsW2Figure, ReqAnatomyFigure, SevenDaysW2Figure, TraceMatrixFigure, TwoChainsFigure, TypesGridFigure, VvGridFigure, ZoomLevelsFigure } from './LectureWeek2S2'
// --- end week02 ---
// --- week03 ---
import { WEEK3_S1_FIGURES } from './LectureWeek3S1'
import { WEEK3_S2_FIGURES } from './LectureWeek3S2'
// --- end week03 ---
// --- week04 ---
import { WEEK4_S1_FIGURES } from './LectureWeek4S1'
import { WEEK4_S2_FIGURES } from './LectureWeek4S2'
// --- end week04 ---
// --- week05 ---
import { WEEK5_S1_FIGURES, WEEK5_S2_FIGURES } from './lectureWeek5Figures'
// --- end week05 ---
// --- week08 ---
import { CodeListing } from './LectureWeek8Code'
import { WEEK8_LISTING_FIGURES } from './listingRows'
import { WEEK8_S1_FIGURES, WEEK8_S2_FIGURES } from './lectureWeek8Figures'
// --- end week08 ---

export type FigureEntry = {
  /** Default title (a slide or lesson gives its own caption). */
  title: string
  render: (alt: string) => ReactElement
}

const plain = (title: string, C: ComponentType<{ alt: string }>): FigureEntry => ({ title, render: (alt) => createElement(C, { alt }) })

export const FIGURE_REGISTRY: Readonly<Record<string, FigureEntry>> = {
  'open-system': { title: 'System of interest and its context', render: (alt) => createElement(OpenSystemFigure, { alt, showState: false }) },
  'week-path': plain('The week’s path', WeekPathFigure),
  'team-charter': plain('Team charter', TeamCharterFigure),
  'enterprise-scope': plain('Enterprise, organization and system of interest', EnterpriseScopeFigure),
  'stakeholder-sources': plain('Three sources of stakeholders', StakeholderSourcesFigure),
  'register-row': plain('One stakeholder register row', RegisterRowFigure),
  'need-chain': plain('From stakeholder to need', NeedChainFigure),
  'need-anatomy': plain('Anatomy of a need statement', NeedAnatomyFigure),
  jam: plain('Traffic jam as emergent behavior', JamFigure),
  'down-and-up': plain('Looking down and looking up', DownAndUp),
  'less-than-sum': plain('A whole can be less than the sum of its parts', LessThanSum),
  'loop-pair': plain('Reinforcing and balancing loops', LoopPair),
  'capacity-crossover': { title: 'Capacity crossover', render: (alt) => createElement(CapacityCrossover, { alt, revealed: true }) },
  'life-cycle-agents': plain('Life-cycle agents', LifeCycleAgents),
  'control-rings': plain('Control rings', ControlRings),
  'control-hierarchy': plain('Control hierarchy', ControlHierarchy),
  // --- week01 session2 ---
  'w1s2-influence-support': plain('AeroLink stakeholders by influence and support', InfluenceSupportFigure),
  'w1s2-concern-ladder': plain('From a generic to a specific concern', ConcernLadderFigure),
  'w1s2-relationship-map': plain('AeroLink stakeholder relationships', RelationshipMapFigure),
  'w1s2-need-vs-requirement': plain('Needs versus requirements', NeedVsRequirementFigure),
  'w1s2-integrated-set': plain('The integrated set of needs', IntegratedSetFigure),
  'w1s2-one-need-many': plain('One need, several requirements', OneNeedManyFigure),
  'w1s2-validation-v': plain('The needs survive to validation', ValidationVFigure),
  'w1s2-need-attributes': plain('Three layers of need quality', NeedAttributesFigure),
  'w1s2-need-anatomy': plain('Anatomy of a need and the level problem', NeedAnatomyLevelFigure),
  'w1s2-elicitation-matrix': plain('Choosing elicitation techniques', ElicitationMatrixFigure),
  'w1s2-why-ladder': plain('Asking why to find the real need', WhyLadderFigure),
  'w1s2-adjudication': plain('Conflict and adjudication', AdjudicationFigure),
  'w1s2-needs-catalog': plain('The corrected AeroLink reference needs', NeedsCatalogFigure),
  'w1s2-coverage-matrix': plain('Coverage audit: stakeholders by needs', CoverageMatrixFigure),
  'w1s2-trace-lanes': plain('From Week 1 IDs to Week 2 and Week 8', TraceLanesFigure),
  'w1s2-pitch-card': plain('Enterprise pitch card', PitchCardFigure),
  'w1s2-seven-days': plain('The next seven days', SevenDaysFigure),
  'w1s2-weak-register': plain('A weak register line, annotated', WeakRegisterFigure),
  'w1s2-draft-to-need': plain('From interview draft to NEED-010', DraftToNeedFigure),
  'w1s2-record-parts': plain('The Week 1 Team Record', RecordPartsFigure),
  'w1s2-charter-owners': plain('Charter roles and ID owners', CharterOwnersFigure),
  'w1s2-methods-why': plain('Why each method, and what it feeds', MethodsWhyFigure),
  // --- end week01 session2 ---
  // --- week01 session1 ---
  'w1s1-two-phases': plain('One enterprise, two representations', TwoPhasesFigure),
  'w1s1-soi-enabling': plain('System of interest, enabling systems and external systems', SoiEnablingFigure),
  'w1s1-enterprise-nesting': plain('Organization, enterprise and extended enterprise', EnterpriseNestingFigure),
  'w1s1-three-scopes': plain('Three candidate systems of interest for one question', ThreeScopesFigure),
  'w1s1-boundary-anatomy': plain('Anatomy of a boundary', BoundaryAnatomyFigure),
  'w1s1-context-layers': plain('The structure of a system context', ContextLayersFigure),
  'w1s1-control-influence': plain('Control, influence and what influences us', ControlInfluenceFigure),
  'w1s1-life-cycle': plain('Life-cycle stages and decision gates', LifeCycleFigure),
  'w1s1-process-strip': plain('ISO/IEC/IEEE 15288:2015 technical processes', ProcessStripFigure),
  'w1s1-bma-snd': plain('Business or Mission Analysis feeds Stakeholder Needs Definition', BmaSndFigure),
  'w1s1-ipt-structure': plain('Integrated product teams', IptStructureFigure),
  'w1s1-comm-paths': plain('Communication paths in a team', CommPathsFigure),
  'w1s1-charter-tuckman': plain('Team charter and team development', CharterTuckmanFigure),
  'w1s1-lifecycle-sweep': plain('The life-cycle stakeholder sweep', LifecycleSweepFigure),
  'w1s1-approval-gates': plain('Approving authorities', ApprovalGatesFigure),
  'w1s1-influence-maps': plain('Two stakeholder maps', InfluenceMapsFigure),
  'w1s1-vertiport-scene': plain('A new vertiport beside a residential district', VertiportSceneFigure),
  'w1s1-aerolink-network': plain('AeroLink: six vertiports in one region', AerolinkNetworkFigure),
  'w1s1-stakeholder-scope': plain('Who counts as a stakeholder', StakeholderScopeFigure),
  'w1s1-missing-stakeholder': plain('Why a missing stakeholder is a validation failure', MissingStakeholderFigure),
  'w1s1-context-roles': plain('Methods 2 and 3: from the context, and by role class', ContextRolesFigure),
  'w1s1-method-venn': plain('Which method finds whom', MethodVennFigure),
  'w1s1-exit-prep': plain('Exit and hand-off to Session 2', ExitPrepFigure),
  // --- end week01 session1 ---
  // --- week02 ---
  'w2s1-week-band': plain('The Week 2 additions to the Team Record', WeekBandFigure),
  'w2s1-driving-question': plain('Straight to “shall”?', DrivingQuestionFigure),
  'w2s1-process-inputs': plain('System Requirements Definition and its inputs', ProcessInputsFigure),
  'w2s1-mirror': plain('Need or requirement?', MirrorFigure),
  'w2s1-conops-timeline': plain('The ConOps as a living document', ConopsTimelineFigure),
  'w2s1-conops-levels': plain('Concept of operations and operational concept', ConopsLevelsFigure),
  'w2s1-conops-toc': plain('What a ConOps contains, and what each part is for', ConopsTocFigure),
  'w2s1-before-after': plain('Writing in the user’s language', BeforeAfterFigure),
  'w2s1-ov1-storyboard': plain('The AeroLink ConOps at a glance', Ov1StoryboardFigure),
  'w2s1-actors-threads': plain('Use case, actors and threads', ActorsThreadsFigure),
  'w2s1-scenario-card': plain('The course scenario template', ScenarioCardFigure),
  'w2s1-coverage-grid': plain('Which scenarios: coverage across the life cycle', CoverageGridFigure),
  'w2s1-review-scn001': plain('Reviewing a scenario', ReviewScn001Figure),
  'w2s1-scn005-swimlane': plain('SCN-005 Weather Disruption', Scn005SwimlaneFigure),
  'w2s1-discoveries': plain('What writing SCN-005 exposed', DiscoveriesFigure),
  'w2s1-needs-scenarios-matrix': plain('Do the scenarios exercise the needs?', NeedsScenariosMatrixFigure),
  'w2s1-feature-capability-benefit': plain('Feature, capability, benefit', FcbLadderFigure),
  'w2s1-capability-tree': plain('The AeroLink capability tree', CapabilityTreeFigure),
  'w2s1-capability-gaps': plain('What the capability tree does not yet cover', CapabilityGapsFigure),
  'w2s1-staircase': plain('Need, stakeholder requirement, system requirement', StaircaseFigure),
  'w2s1-chain-budget': plain('One chain end to end, with its time budget', ChainBudgetFigure),
  'w2s1-answer': plain('Answering the driving question', AnswerFigure),
  'w2s2-req-anatomy': plain('Anatomy of a requirement and its attributes', ReqAnatomyFigure),
  'w2s2-characteristics': plain('Characteristics of good requirements', CharacteristicsFigure),
  'w2s2-types-grid': plain('Requirement types and categories', TypesGridFigure),
  'w2s2-zoom': plain('Level and white space', ZoomLevelsFigure),
  'w2s2-negative-tbd': plain('A negative, a TBD and the positive rewrite', NegativeTbdFigure),
  'w2s2-methods': plain('A verification method for every requirement', MethodsFigure),
  'w2s2-two-chains': plain('Two chains and the reasoning in the rationale', TwoChainsFigure),
  'w2s2-noise-split': plain('The corrected noise need reaches the requirements', NoiseSplitFigure),
  'w2s2-critique-table': plain('Critique and rewrite', CritiqueTableFigure),
  'w2s2-orphan-childless': plain('Orphans and childless parents', OrphanChildlessFigure),
  'w2s2-trace-matrix': plain('Auditing the AeroLink trace', TraceMatrixFigure),
  'w2s2-vv-grid': plain('Requirement verification and validation', VvGridFigure),
  'w2s2-measures-pyramid': plain('Objectives, MOEs and MOPs', MeasuresPyramidFigure),
  'w2s2-measures-links': plain('The AeroLink measures, linked', MeasuresLinksFigure),
  'w2s2-bridge': plain('Where Week 2 goes next', BridgeFigure),
  'w2s2-record-parts': plain('The Week 2 additions to the Team Record', RecordPartsW2Figure),
  'w2s2-clinic-card': plain('The scenario clinic card', ClinicCardFigure),
  'w2s2-seven-days': plain('The next seven days', SevenDaysW2Figure),
  // --- end week02 ---
  // --- week03 ---
  ...Object.fromEntries(Object.entries({ ...WEEK3_S1_FIGURES, ...WEEK3_S2_FIGURES }).map(([id, f]): [string, FigureEntry] => [id, plain(f.title, f.C)])),
  // --- end week03 ---
  // --- week04 ---
  ...Object.fromEntries(Object.entries({ ...WEEK4_S1_FIGURES, ...WEEK4_S2_FIGURES }).map(([id, f]): [string, FigureEntry] => [id, plain(f.title, f.C)])),
  // --- end week04 ---
  // --- week05 ---
  ...Object.fromEntries(Object.entries({ ...WEEK5_S1_FIGURES, ...WEEK5_S2_FIGURES }).map(([id, f]): [string, FigureEntry] => [id, plain(f.title, f.C)])),
  // --- end week05 ---
  // --- week08 ---
  // listings: one generic code figure per validated SysML excerpt (src/content/lectures/week08/listings.ts)
  ...Object.fromEntries(Object.entries(WEEK8_LISTING_FIGURES).map(([id, key]): [string, FigureEntry] => [id, { title: 'SysML v2 listing', render: (alt) => createElement(CodeListing, { id: key, alt }) }])),
  ...Object.fromEntries(Object.entries({ ...WEEK8_S1_FIGURES, ...WEEK8_S2_FIGURES }).map(([id, f]): [string, FigureEntry] => [id, plain(f.title, f.C)])),
  // --- end week08 ---
}

export const isRegisteredFigure = (id: string): boolean => Object.prototype.hasOwnProperty.call(FIGURE_REGISTRY, id)

export const registeredFigureIds = (): string[] => Object.keys(FIGURE_REGISTRY)

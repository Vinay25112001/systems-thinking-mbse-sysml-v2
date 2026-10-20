# Week 4 individual applied exercise: the case brief (CityCycle bike share)

> Instructor copy of the brief released on the LMS for the Week 4 individual applied exercise (about 35 minutes, open
> book). Written 2026-10-19 for review finding Mo5 (Week 4 review). Review status: new-pending-review. The case is
> FICTIONAL and is not AeroLink. The task and the level descriptors are on the Assessment page (`src/week4/Assessment.tsx`);
> this file holds only the case the students work on, followed by short marking notes for the instructor.

## The case (give this part to students)

**CityCycle** is a fictional city bike-share scheme. It has 60 docking stations with 900 bicycles, a fleet of four
rebalancing vans with their drivers, a mobile app for riders, and a small control room where a duty supervisor watches
the network. Each station reports how many bicycles and free docks it has. When a station is full or empty, a van moves
bicycles from where there are too many to where there are too few. A rebalancing planner (software that may use machine
learning) proposes van routes for the next two hours.

### Stakeholders and their concerns

| ID | Stakeholder | Concern |
|---|---|---|
| CC-STK-1 | Riders | Finding a bicycle at the start of a trip and a free dock at the end |
| CC-STK-2 | Van drivers | A shift that ends on time, without driving back and forth between the same stations |
| CC-STK-3 | City transport department (funder) | Evidence each quarter that the scheme serves every district, not only the center |
| CC-STK-4 | Station maintenance contractor | Knowing which docks are broken before a rider reports them |

### Two operating scenarios

**S1 Rider takes a trip.**
1. The rider opens the app and asks for the nearest station with a bicycle.
2. The app shows stations with bicycles and the walking time to each.
3. The rider unlocks a bicycle at the station with the app.
4. The rider rides to another station and docks the bicycle.
5. The station confirms the return; the app ends the trip and charges the fare.

Alternate 4a: the destination station is full. The app shows the nearest station with a free dock and gives the rider
15 extra minutes free of charge.

**S2 The network is rebalanced during the morning peak.**
1. The stations report their bicycle and dock counts every minute.
2. The planner proposes van routes for the next two hours.
3. The duty supervisor accepts, changes or rejects each proposed route.
4. Each driver receives the accepted route on a tablet in the van.
5. The driver moves bicycles between stations and confirms each stop.
6. A dock that fails to lock is reported by the station and a repair job is sent to the contractor.

### Capabilities

| ID | Capability |
|---|---|
| CC-CAP-1 | Provide a bicycle and a dock when riders need them |
| CC-CAP-2 | Keep the stations in balance across the network |
| CC-CAP-3 | Charge riders correctly for each trip |
| CC-CAP-4 | Keep docks and bicycles in working order |
| CC-CAP-5 | Report service by district to the funder |

### Requirements

| ID | Requirement |
|---|---|
| CC-REQ-1 | During 07:00–10:00, no station shall be empty or full for more than 15 minutes at a time. |
| CC-REQ-2 | The app shall show the bicycle and dock count of each station no more than 2 minutes old. |
| CC-REQ-3 | A trip shall be charged within 5 minutes of the return being confirmed. |
| CC-REQ-4 | A dock that fails to lock shall be reported to the maintenance contractor within 10 minutes. |
| CC-REQ-5 | Each van route shall fit within the driver’s shift, including the drive back to the depot. |
| CC-REQ-6 | The quarterly report shall give trips started and ended in each of the city’s districts. |

## Marking notes (instructor only, not for students)

These notes illustrate the descriptors; other answers that meet a descriptor score the same.

- **Views.** For example: the riders’ concern needs an operational or information view (“Will a rider find a bicycle
  and a dock within the peak?”); the funder’s concern an information view (“Does every district get service, quarter by
  quarter?”); the contractor’s concern a physical or information view (“Which docks fail, where, and how fast is each
  repaired?”).
- **Functions.** Walking S2 gives functions such as Report station counts, Propose van routes, Approve routes (a human
  operation: the duty supervisor), Send route to van, Move bicycles between stations, Report dock fault. Step 6 exposes a
  function the capability list hides: Dispatch repair job (CC-CAP-4, CC-REQ-4).
- **Allocation.** Report station counts → a station-monitoring logical element → the docking stations (environment: it
  must work at each station); Propose van routes → planning → the control-room software (centralized control: one view
  of the whole network); Move bicycles → distribution → vans with drivers (transformation: only the vans move bicycles).
- **Information.** Station counts: data = bicycle and dock counts per minute; information = which stations will be empty
  or full in the next hour; producer = the stations; consumer = the control room (the planner and the supervisor); decision
  = which van goes where, and when. Dock fault reports: producer = the station; consumer = the contractor (an external
  system), who decides which repair to do first. An answer that names the app as the consumer of the counts with the
  decision “where to rebalance” mixes up the consumer and the decider (Developing).
- **AI oversight.** The duty supervisor decides every route; the planner may not send a route to a van on its own. A
  failure mode: a route that looks efficient but breaks CC-REQ-5 (the shift ends late), or a shift in demand (a new
  station, an event) that the planner’s history does not cover.

# Week 5 individual applied exercise: the case brief (Ridgeline Mountain Resort)

> Instructor copy of the brief released on the LMS for the Week 5 individual applied exercise (about 35 minutes, open
> book). Written 2026-10-19 for review finding Mo3 (Week 5 review). Review status: new-pending-review. The case is
> FICTIONAL and is not AeroLink; no Week 5 quiz item uses a ski-resort setting. The four tasks and the level descriptors
> are on the Assessment page (`src/week5/Assessment.tsx`); this file holds the case the students work on, then the marking
> notes for the instructor.

## The case (give this part to students)

**Ridgeline Mountain Resort** is a fictional ski resort run by Ridgeline Resorts Ltd. It has two chairlifts, a
snowmaking plant, ticket gates at the lift bases with a ticketing app for guests, lift operators at every lift station,
and a ski patrol. The resort buys power from the regional electric utility. Injured guests who cannot be brought down by
the patrol are handed to the county mountain-rescue service.

### Elements (all owned by Ridgeline Resorts Ltd unless stated)

| ID | Element | Notes |
|---|---|---|
| RR-E1 | North chairlift, with its lift control system | Bottom and top stations; the control system stops the lift on any safety fault |
| RR-E2 | South chairlift, with its lift control system | Same design as the north lift |
| RR-E3 | Snowmaking plant | Pumps, compressors and snow guns on the lower slopes; draws the most power on the site |
| RR-E4 | Ticket gates and the ticketing app | Gates at each lift base read guest passes; guests buy passes in the app |
| RR-E5 | Lift operators | Staff at the bottom and top station of each lift |
| RR-E6 | Ski patrol | Patrollers on the slopes, and a patrol hut at the top of the north lift |
| RR-E7 | Resort operations desk | A duty manager and the resort's central software in the base lodge |

### External parties

| ID | External party | Notes |
|---|---|---|
| RR-X1 | Regional electric utility | Supplies power to the whole resort under a supply agreement |
| RR-X2 | County mountain-rescue service | A public agency; takes over casualties the patrol cannot bring down |
| RR-X3 | Payment processor | Takes guests' card payments for the app |
| RR-X4 | Avalanche forecast service | A public forecast the resort reads but never sends anything to |

### Exchanges described by the resort

1. Each lift's top station sends its safety-circuit status to the bottom station's control system over a **licensed
   radio link** (the cable run on the north lift was damaged last winter and replaced by radio on both lifts).
2. Lift operators and patrollers talk on **hand-held radios**; the operations desk listens on the same channel.
3. The ticket gates send each pass read to the operations desk over the resort's **fibre network**.
4. The app sends payments to the payment processor over the **public internet**.
5. The utility supplies **electrical power** to the lifts and the snowmaking plant; snowmaking must stop when the utility
   signals a peak-demand event, which it does by an **automated message to the operations desk**.
6. The patrol hands a casualty, with a written casualty report, to mountain rescue at an agreed meeting point, under a
   **mutual-aid agreement** between the resort and the county.
7. The operations desk reads the avalanche forecast from the forecast service's public web page each morning.

### Two requirements

| ID | Requirement |
|---|---|
| RR-REQ-1 | A lift shall stop within 2 s of its top station reporting an open safety circuit. |
| RR-REQ-2 | The resort shall stop snowmaking within 10 min of a peak-demand event signaled by the utility. |

### The change for task 4

A new national lift-safety standard requires the top-station safety-circuit status to be sent at least every 200 ms
(today: every second) and each message to carry a sequence number.

## Marking notes (instructor only; do not release)

These notes describe what a 4 (Exemplary) answer contains and the most common errors. The criteria and descriptors are
on the Assessment page; score each criterion 1–4 (16 points in all, the same scale as the graduate coupling task).

**Task 1, Breakdown (criterion "Breakdown").**
- A 4 has five to seven elements of mixed kinds: hardware (lifts, snowmaking), software (operations software, app),
  people (lift operators, ski patrol), and a procedure is a good sign (the mutual-aid handover). Each responsibility is a
  verb and an object ("Stops the lift on a safety fault"), not the name repeated.
- Common error: listing only equipment and leaving the operators and the patrol out as "users". They are system
  elements (Session 1, "System element and component").
- Merging the two lifts into one element "Chairlifts" is acceptable if the student says the two are identical; splitting
  them is also fine.

**Task 2, N² chart (criterion "N² chart").**
- Diagonal: the student's components, then RR-X1 to RR-X4.
- Expected interfaces (about eight, depending on the breakdown): safety-circuit link inside each lift (an internal
  information interface, or two if the lift is broken into stations); operator and patrol voice radio (information);
  gates to operations desk (information); app to payment processor (information, external); power from the utility
  (physical, external); peak-demand message from the utility to the desk (information, external); the mutual-aid
  agreement (organizational, external) and the casualty handover with its report (physical and information, external).
- The degree sum must equal twice the interface count.
- **The empty row is RR-X4.** The forecast service sends nothing: the desk reads a public web page. The best answer
  either records an information interface "forecast service → operations desk over the public internet" (one way) or
  states why it has none. Either is a 4 if it is argued; an empty row left unanswered is a 3 at best.

**Task 3, Interface definitions and requirement (criterion "Interface definitions and requirement").**
- Any two interfaces, one external. The most instructive pair is the **top-station safety-circuit radio link** and the
  **utility peak-demand message**.
- The radio link is the point of the exercise: both ends are Ridgeline's and inside one lift, yet it **crosses a trust
  boundary because its medium is radio**, which anyone with a transmitter can reach (the fifth reason of the course
  rule; R54 p.331). A 4 names protection such as "authenticate the top station; sequence-number every message; reject
  stale or out-of-order messages". Its degraded mode is **fail safe**: no valid status within the timeout stops the lift.
  A student who says "internal, so no protection" has missed the hidden external interface: score the criterion at most
  2.
- The utility message crosses because the end is external and the owners differ. Protection: authenticate the utility.
  Degraded mode: if no message can be received, the desk follows the utility's published peak hours by hand (a manual
  procedure).
- Short answers are complete answers: "Fail safe" is a full degraded mode and "Power only" a full reason for no
  protection on the power interface. Do not mark down for brevity.
- Requirement: the three steps should be visible (the boundary and the two ends; what crosses and over what; then the
  statement). Example for the external peak-demand message: "The operations desk shall acknowledge each peak-demand
  message from the utility over IF-x within 60 s", method test, criterion "acknowledgement within 60 s for every message
  in a 30-message test", parent RR-REQ-2. RR-REQ-1 and RR-REQ-2 are given as parents to trace to; restating RR-REQ-1 as
  the answer is a 2 (it is not written by the three steps and names no interface).

**Task 4, Change traced (criterion "Change traced").**
- The change is to the safety-circuit interface of each lift. Its ends are the top and bottom stations (or the lift
  element), so the candidates are every interface in that element's row and column: the power supply (more frequent
  radio messages do not change power: not reached), the operator radios (only if the same radio channel is shared:
  a good answer asks), the gates link (not reached).
- Reached: the radio link itself (new rate and sequence numbers), the lift control system's timeout (the fail-safe
  stop now triggers on a shorter gap), and RR-REQ-1's verification.
- Who decides: Ridgeline's engineering owner of both ends, because both ends have one owner; the radio licensing
  authority only if the higher rate needs a new licence. A student who sends it to an ICWG with the utility has not read
  the owners.

**Timing check.** The four tasks were sized at about 6 + 10 + 13 + 6 minutes; the student page shows the same split.

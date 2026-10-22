// Week 10 driving question and its answer: a dispatch decision for a hospital patient-transfer service (FICTIONAL, not
// AeroLink). Package GuardGap is the flow students vote on: three guarded branches and no else. Package GuardsCovered is
// the corrected flow: the guards cover every score and else takes what remains. Both pass the course checker; only a
// reviewer can see that the first leaves a score of 3 with no possible successor.
package 'W10 Guard Gap' {
	private import ScalarValues::*;
	package GuardGap {
		action def PatientTransferDispatch {
			attribute triageScore : Integer;
			first start;
			then action receiveRequest;
			then decide triage;
				if triageScore >= 8 then dispatchCritical;
				if triageScore >= 4 and triageScore < 8 then dispatchUrgent;
				if triageScore < 3 then scheduleRoutine;
			action dispatchCritical;
			then done;
			action dispatchUrgent;
			then done;
			action scheduleRoutine;
			then done;
		}
	}
	package GuardsCovered {
		action def PatientTransferDispatch {
			attribute triageScore : Integer;
			first start;
			then action receiveRequest;
			then decide triage;
				if triageScore >= 8 then dispatchCritical;
				if triageScore >= 4 and triageScore < 8 then dispatchUrgent;
				else scheduleRoutine;
			action dispatchCritical;
			then done;
			action dispatchUrgent;
			then done;
			action scheduleRoutine;
			then done;
		}
	}
}

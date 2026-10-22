// Week 10, fork and join on AeroLink (FICTIONAL; proposed teaching content, instructor to confirm): the turnaround of
// SCN-003, where the Week 2 ConOps says the battery is charged "while passengers deplane and board" (step 3). Charging
// and boarding run concurrently after the charger is connected; the aircraft is released only when both are complete.
package 'W10 Turnaround Fork' {
	action def Turnaround {
		doc /* SCN-003 steps 1 to 6, with the next party boarding while the aircraft charges. */
		first start;
		then action connectCharger { doc /* 1. The vertiport operator connects the charger. */ }
		then fork chargeAndBoard;
			then chargeToThreshold;
			then boardNextParty;
		action chargeToThreshold { doc /* 2-3. Charge to the dispatch threshold within the connection limit. */ }
		then bothDone;
		action boardNextParty { doc /* The next party boards while the aircraft charges. */ }
		then bothDone;
		join bothDone;
		then action disconnectCharger { doc /* 5. The vertiport operator disconnects the charger. */ }
		then action releaseAsDispatchReady { doc /* 6. The fleet controller releases the aircraft. */ }
		then done;
	}
}

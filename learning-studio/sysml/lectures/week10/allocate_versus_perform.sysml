// Week 10, two ways to say that a logical element is responsible for a function (FICTIONAL, neutral example): Scheduling
// performs the matching function; the allocation states the same responsibility as a mapping from the function to the
// element. The course writes perform in the logical architecture and keeps allocate for requirements to functions in
// Week 10 and for logical to physical in Week 11.
package 'W10 Allocate and Perform' {
	package Logical {
		action matchRequest { doc /* Select an aircraft and a time slot for a confirmed request. */ }
		part def Scheduling;
		part scheduling : Scheduling {
			perform matchRequest;
		}
		allocate matchRequest to scheduling;
	}
}

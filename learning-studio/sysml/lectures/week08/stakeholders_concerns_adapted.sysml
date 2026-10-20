// Week 8, Session 2: stakeholders and concerns as language elements. Adapted from the textual-notation training deck
// (slide 115, Release 2026-08, CC BY 4.0, Model Driven Solutions): the deck declares part def 'Systems Engineer' but
// types a stakeholder as 'systems engineer'; this version uses one spelling so the names resolve. The deck's concern
// 'system breakdown' is kept; 'modularity' is shortened.
package StakeholdersAndConcerns {
	part def 'Systems Engineer';
	part def 'IV&V';
	concern 'system breakdown' {
		doc /* To ensure that a system covers all its required capabilities, it is necessary to understand how it is
		 * broken down into subsystems and components that provide those capabilities. */
		subject system;
		stakeholder se : 'Systems Engineer';
		stakeholder ivv : 'IV&V';
	}
	concern modularity {
		doc /* There should be well defined interfaces between the parts of a system. */
		subject system;
		stakeholder 'Systems Engineer';
	}
}

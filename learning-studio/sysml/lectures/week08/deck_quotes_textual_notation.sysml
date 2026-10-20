// Week 8 lecture listings quoted from the textual-notation training deck: "Introduction to the SysML v2 Language,
// Textual Notation", Release 2026-08, Copyright 2019-2026 Model Driven Solutions, Inc., CC BY 4.0.
// Slides 7, 8, 9 and 12, each in its own package so their names do not clash; the text inside each package is the
// slide's, unchanged except for layout. Checked with the course-designated checker (week08-report.json).
package DeckQuotes {
	package 'Comment Example' {
		/* This is comment, part of the model,
		 * annotating (by default) it's owning package. */
		comment Comment1 /* This is a named comment. */
		comment about Automobile
		/* This is an unnamed comment, annotating an
		 * explicitly specified element. */
		part def Automobile;
		alias Car for Automobile {
			/* This is a comment annotating its owning
			 * element. */
		}
		// This is a note. It is in the text, but not part
		// of the model.
		alias Torque for ISQ::TorqueValue;
	}
	package 'Documentation Example' {
		doc /* This is documentation of the owning
		 * package.
		 */
		part def Automobile {
			doc Document1
			/* This is documentation of Automobile. */
		}
		alias Car for Automobile {
			doc /* This is documentation of the alias. */
		}
		alias Torque for ISQ::TorqueValue;
	}
	package Slide9 {
		part def Vehicle {
			attribute mass : ScalarValues::Real;
			part eng : Engine;
			ref part driver : Person;
		}
		attribute def VehicleStatus {
			private import ScalarValues::*;
			attribute gearSetting : Integer;
			attribute acceleratorPosition : Real;
		}
		part def Engine;
		part def Person;
	}
	package Slide12 {
		part def Vehicle {
			part eng : Engine;
		}
		part def SmallVehicle :> Vehicle {
			part smallEng : SmallEngine redefines eng;
		}
		part def BigVehicle :> Vehicle {
			part bigEng : BigEngine :>> eng;
		}
		part def Engine {
			part cyl : Cylinder[4..6];
		}
		part def SmallEngine :> Engine {
			part redefines cyl[4];
		}
		part def BigEngine :> Engine {
			part redefines cyl[6];
		}
		part def Cylinder;
	}
}

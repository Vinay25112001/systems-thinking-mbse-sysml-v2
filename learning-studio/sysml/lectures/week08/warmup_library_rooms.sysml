// Week 8, Session 2 warm-up listing (unseen, not AeroLink): read it before the answers are revealed.
// Which line is a specialization, which a subsetting, and at least how many rooms does a branch library have?
// Instructor-authored example; checked with the course-designated checker (week08-report.json).
package LibraryBranch {
	abstract part def Room;
	part def StudyRoom :> Room;
	part def Library {
		part rooms : Room[1..*];
		part studyRooms : StudyRoom[4] subsets rooms;
	}
}

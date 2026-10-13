# Firestore Schema

## Collections
- **users**: `uid`, `name`, `email`, `role` (admin|faculty|student), `createdAt`
- **courses**: `id`, `name`, `description`, `facultyId`, `studentIds[]`
- **enrollments**: `studentId`, `courseId`, `enrolledAt`
- **attendance**: `courseId`, `date`, `presentStudentIds[]`
- **assignments**: `id`, `courseId`, `title`, `description`, `dueDate`
- **submissions**: `assignmentId`, `studentId`, `fileUrl`, `submittedAt`
- **materials**: `courseId`, `fileName`, `fileUrl`, `uploadedBy`, `uploadedAt`
- **notices**: `id`, `title`, `body`, `target` (all|courseId|role), `createdBy`, `createdAt`
- **marks**: `studentId`, `assignmentId`, `score`

## Indexes (suggested)
- `users.role`
- `courses.facultyId`
- `attendance.courseId + date`
- `assignments.courseId + dueDate`
- `marks.studentId + assignmentId`

*Schema can be refined during implementation.*

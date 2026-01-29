// ================================
// 🔔 JOB NOTIFICATIONS
// ================================

// TODO: When CLIENT creates a job
// Notify TECHNICIANS (optional – future feature)
// Type: JOB_CREATED
// Reference: job._id

// --------------------------------

// TODO: When TECHNICIAN accepts the job
// Notify CLIENT
// Type: JOB_ACCEPTED
// Reference: job._id
//
// Example:
// await createNotification({
//   userId: job.clientId,
//   type: "JOB_ACCEPTED",
//   title: "Job Accepted",
//   message: "Your job request has been accepted by the technician",
//   referenceId: job._id,
// });

// --------------------------------

// TODO: When TECHNICIAN starts the job
// Notify CLIENT
// Type: JOB_IN_PROGRESS
// Reference: job._id

// --------------------------------

// TODO: When TECHNICIAN completes the job
// Notify CLIENT
// Type: JOB_COMPLETED
// Reference: job._id

// --------------------------------

// TODO: When CLIENT cancels the job
// Notify TECHNICIAN
// Type: JOB_CANCELLED
// Reference: job._id

// --------------------------------

// TODO: When ADMIN cancels the job
// Notify BOTH client & technician
// Type: JOB_CANCELLED
// Reference: job._id

// --------------------------------

// TODO: When CLIENT opens a dispute
// Notify ADMIN
// Type: JOB_DISPUTED
// Reference: job._id

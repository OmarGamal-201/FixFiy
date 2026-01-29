// ================================
// 🔔 PAYMENT NOTIFICATIONS
// ================================

// TODO: When payment is COMPLETED successfully
// Notify TECHNICIAN
// Type: PAYMENT_COMPLETED
// Reference: payment._id
//
// Example:
// await createNotification({
//   userId: job.workerId,
//   type: "PAYMENT_COMPLETED",
//   title: "Payment Received",
//   message: "Your payment has been completed successfully",
//   referenceId: payment._id,
// });

// --------------------------------

// TODO: When payment FAILS
// Notify CLIENT
// Type: PAYMENT_FAILED
// Reference: payment._id

// --------------------------------

// TODO: When TECHNICIAN withdraws money
// Notify TECHNICIAN
// Type: WITHDRAWAL_COMPLETED
// Reference: transaction._id

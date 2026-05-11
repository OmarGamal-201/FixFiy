/**
 * ============================================
 * DATABASE SCHEMA - PROPOSAL SYSTEM
 * ============================================
 */

// ============================================
// 1. JOB MODEL (UPDATED)
// ============================================

const Job = {
  _id: ObjectId,
  
  // Core Info
  title: String,                    // "Fix Kitchen Sink"
  description: String,              // Full description
  serviceId: ObjectId (ref: Service),
  
  // Relations
  clientId: ObjectId (ref: User),   // Required
  workerId: ObjectId (ref: User),   // Optional (null for OPEN jobs)
  reviewId: ObjectId (ref: Review), // Set after job completion
  acceptedProposalId: ObjectId (ref: Proposal), // Set when proposal accepted (OPEN jobs only)
  
  // Booking Type (NEW)
  bookingType: String,              // Enum: ["DIRECT", "OPEN"]
                                    // DIRECT: Technician selected upfront
                                    // OPEN: Multiple technicians can bid
  
  // Status
  status: String,                   // Enum: ["PENDING", "ACCEPTED", "ACTIVE", "DONE", "CANCELED", "REJECTED"]
  statusHistory: [
    {
      status: String,
      changedAt: Date
    }
  ],
  
  canceledBy: String,               // Enum: ["CLIENT", "TECHNICIAN", "ADMIN"]
  cancelReason: String,
  
  // Pricing
  total_price: Number,              // Initial: service.base_price (DIRECT)
                                    // Initial: 0 (OPEN)
                                    // Updated: proposal.proposedPrice when accepted
  site_commission: Number,          // Commission percentage
  depositAmount: Number,            // Initial: total_price * 20% (DIRECT)
                                    // Initial: 0 (OPEN)
                                    // Updated when proposal accepted
  
  // Payment
  paymentStatus: String,            // Enum: ["UNPAID", "DEPOSIT_PAID", "PAID"]
  paymentMethod: String,            // Enum: ["MOCK", "FAWRY", "PAYPAL", "CASH"]
  paymentRef: String,               // Transaction reference
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Virtuals
  commission_amount: Number,        // total_price * (site_commission / 100)
  provider_earnings: Number,        // total_price - commission_amount
  uiState: {
    canReview: Boolean,
    canChat: Boolean,
    canAccept: Boolean,
    canPayFinal: Boolean
  }
};

/**
 * INDEXES:
 * - { clientId: 1 }
 * - { workerId: 1 }
 * - { status: 1 }
 * - { bookingType: 1 }
 * - { bookingType: 1, status: 1 }
 * - { acceptedProposalId: 1 }
 */

// ============================================
// 2. PROPOSAL MODEL (NEW)
// ============================================

const Proposal = {
  _id: ObjectId,
  
  // Relations
  jobId: ObjectId (ref: Job),           // Required, references OPEN job
  technicianId: ObjectId (ref: User),   // The technician sending proposal
  
  // Proposal Details
  message: String,                      // 10-1000 chars
                                        // Technician's pitch/description
  proposedPrice: Number,                // 0-10000
                                        // Technician's quote for the job
  estimatedDuration: Number,            // Optional, in hours
                                        // 0-168 max (1 week)
  
  // Status
  status: String,                       // Enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]
  statusHistory: [
    {
      status: String,
      changedAt: Date,
      reason: String                    // For rejections/withdrawals
    }
  ],
  
  rejectionReason: String,              // When client rejects
  
  // Acceptance Details
  acceptedAt: Date,                     // When it was accepted
  acceptedByClientAt: Date,             // Client acceptance timestamp
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Virtuals
  isPending: Boolean,                   // status === "PENDING"
  isAccepted: Boolean                   // status === "ACCEPTED"
};

/**
 * INDEXES:
 * - { jobId: 1, technicianId: 1 } (unique)
 * - { jobId: 1, status: 1 }
 * - { technicianId: 1, status: 1 }
 * - { createdAt: -1 }
 * 
 * UNIQUE CONSTRAINT:
 * - One proposal per technician per job
 * - Prevents duplicate proposals
 */

// ============================================
// 3. NOTIFICATION MODEL (UPDATED)
// ============================================

const Notification = {
  _id: ObjectId,
  
  userId: ObjectId (ref: User),
  type: String,                         // Added 5 new types:
                                        // - "NEW_PROPOSAL"
                                        // - "PROPOSAL_ACCEPTED"
                                        // - "PROPOSAL_REJECTED"
                                        // - "PROPOSAL_WITHDRAWN"
                                        // - "PROPOSAL_ASSIGNED"
  
  title: String,
  message: String,
  referenceId: ObjectId,                // Job, Proposal, Payment, etc.
  isRead: Boolean,
  
  createdAt: Date,
  updatedAt: Date
};

/**
 * INDEXES:
 * - { userId: 1, isRead: 1, createdAt: -1 }
 */

// ============================================
// 4. USER MODEL (No Changes, Reference)
// ============================================

const User = {
  _id: ObjectId,
  
  name: String,
  email: String,
  password: String,
  phone: String,
  
  role: String,                         // "client", "technician", "admin"
  
  // Technician specific
  rating: Number,                       // 0-5
  totalJobs: Number,
  totalEarnings: Number,
  
  // Other fields...
};

// ============================================
// 5. SERVICE MODEL (Reference)
// ============================================

const Service = {
  _id: ObjectId,
  
  name: String,                         // "Plumbing", "Electrical", etc.
  description: String,
  base_price: Number,                   // Used for DIRECT jobs
  category: String,
  
  // Other fields...
};

// ============================================
// 6. PAYMENT MODEL (No Changes, Reference)
// ============================================

const Payment = {
  _id: ObjectId,
  
  jobId: ObjectId (ref: Job),
  clientId: ObjectId (ref: User),
  
  amount: Number,                       // depositAmount or remaining
  type: String,                         // "DEPOSIT" or "FINAL"
  status: String,                       // "PAID", "FAILED", etc.
  
  transactionId: String,
  provider: String,                     // "PAYPAL", "FAWRY", etc.
  
  // Other fields...
};

// ============================================
// 7. REVIEW MODEL (No Changes, Reference)
// ============================================

const Review = {
  _id: ObjectId,
  
  jobId: ObjectId (ref: Job),
  clientId: ObjectId (ref: User),
  technicianId: ObjectId (ref: User),
  
  rating: Number,                       // 1-5
  comment: String,
  
  // Other fields...
};

// ============================================
// 8. DATA RELATIONSHIPS DIAGRAM
// ============================================

/**
 * DIRECT BOOKING FLOW:
 * 
 * Client
 *   ↓
 * Creates Job (bookingType: "DIRECT", workerId set)
 *   ↓
 * Job → Technician (immediate assignment)
 *   ↓
 * Technician gets notification
 *   ↓
 * Technician accepts/rejects job
 *   ↓
 * Client pays deposit
 *   ↓
 * Job proceeds (ACTIVE → DONE)
 */

/**
 * OPEN BOOKING FLOW:
 * 
 * Client
 *   ↓
 * Creates Job (bookingType: "OPEN", workerId NULL)
 *   ↓
 * Job appears in open listings
 *   ↓
 * Multiple Technicians
 *   ↓
 * Send Proposals → Proposal records created
 *   ↓
 * Client reviews Proposals
 *   ↓
 * Client accepts one Proposal
 *   ↓
 * Proposal status: ACCEPTED
 * Job updated: workerId, acceptedProposalId, total_price, depositAmount
 * Other proposals auto-rejected
 *   ↓
 * Client pays deposit (NEW amount based on proposal)
 *   ↓
 * Job proceeds (ACTIVE → DONE)
 */

// ============================================
// 9. STATE TRANSITIONS
// ============================================

/**
 * JOB STATUS FLOW - DIRECT:
 * PENDING → ACCEPTED → ACTIVE → DONE
 *    ↓
 *  CANCELED (client cancels)
 * REJECTED (technician rejects)
 */

/**
 * JOB STATUS FLOW - OPEN:
 * PENDING → PENDING (proposals received) → ACCEPTED → ACTIVE → DONE
 *    ↓
 *  CANCELED (client cancels)
 */

/**
 * PROPOSAL STATUS FLOW:
 * PENDING → ACCEPTED
 *     ↓       ↓
 *   REJECTED  ACCEPTED (only one per job)
 *     ↓
 *  WITHDRAWN (technician withdraws)
 * 
 * Only ONE proposal per job can be ACCEPTED
 * When one accepted, all others auto-rejected
 */

// ============================================
// 10. FIELD VALIDATION RULES
// ============================================

/**
 * JOB MODEL VALIDATION:
 * - title: required, 3-30 chars, trimmed
 * - description: required, min 15 chars, trimmed
 * - serviceId: required, valid ObjectId, exists in Service collection
 * - clientId: required, valid ObjectId, exists in User collection
 * - workerId: required for DIRECT, null/absent for OPEN
 * - bookingType: required, one of ["DIRECT", "OPEN"]
 * - total_price: 0-10000, ≥ 0
 * - depositAmount: 0-10000, ≥ 0
 * - status: one of ["PENDING", "ACCEPTED", "ACTIVE", "DONE", "CANCELED", "REJECTED"]
 * - paymentStatus: one of ["UNPAID", "DEPOSIT_PAID", "PAID"]
 * - paymentMethod: one of ["MOCK", "FAWRY", "PAYPAL", "CASH"], optional
 */

/**
 * PROPOSAL MODEL VALIDATION:
 * - jobId: required, valid ObjectId, references Job with bookingType: "OPEN"
 * - technicianId: required, valid ObjectId, User with role: "technician"
 * - message: required, 10-1000 chars, trimmed
 * - proposedPrice: required, 0-10000
 * - estimatedDuration: optional, 0-168 hours
 * - status: one of ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]
 * - jobId + technicianId: unique (one proposal per tech per job)
 */

// ============================================
// 11. QUERY EXAMPLES
// ============================================

/**
 * Find all OPEN jobs with PENDING status:
 * db.jobs.find({
 *   bookingType: "OPEN",
 *   status: "PENDING",
 *   workerId: null
 * })
 */

/**
 * Find all proposals for a job:
 * db.proposals.find({
 *   jobId: ObjectId("..."),
 *   status: "PENDING"
 * }).sort({ createdAt: -1 })
 */

/**
 * Find technician's proposals:
 * db.proposals.find({
 *   technicianId: ObjectId("..."),
 *   status: "PENDING"
 * }).populate('jobId')
 */

/**
 * Get job with all details:
 * db.jobs.findById("...").populate([
 *   { path: 'clientId', select: 'name email rating' },
 *   { path: 'workerId', select: 'name email rating' },
 *   { path: 'serviceId', select: 'name base_price' },
 *   { path: 'acceptedProposalId' }
 * ])
 */

/**
 * Count proposals by status:
 * db.proposals.aggregate([
 *   { $match: { jobId: ObjectId("...") } },
 *   { $group: { _id: "$status", count: { $sum: 1 } } }
 * ])
 */

// ============================================
// 12. BACKUP & RECOVERY
// ============================================

/**
 * To backup proposal data:
 * mongodump --collection proposals --out ./backups
 * 
 * To restore:
 * mongorestore --collection proposals ./backups
 */

/**
 * MongoDB Atlas backup (automatic):
 * - Daily snapshots
 * - 35-day retention
 * - Point-in-time recovery available
 */

// ============================================
// 13. MIGRATION SCRIPTS
// ============================================

/**
 * Add bookingType to existing jobs:
 * db.jobs.updateMany(
 *   {},
 *   { $set: { bookingType: "DIRECT" } }
 * )
 * 
 * Add acceptedProposalId to existing jobs:
 * db.jobs.updateMany(
 *   {},
 *   { $set: { acceptedProposalId: null } }
 * )
 */

/**
 * Verification query:
 * db.jobs.findOne({ bookingType: { $exists: true } })
 */

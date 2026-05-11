/**
 * ============================================
 * PROPOSAL SYSTEM - COMPLETE API REFERENCE
 * ============================================
 * 
 * Base URL: http://localhost:3000/api
 * Authentication: Bearer {token}
 */

// ============================================
// 1. JOB CREATION ENDPOINTS
// ============================================

/**
 * POST /jobs - Create Job (Both DIRECT & OPEN)
 * 
 * DIRECT BOOKING EXAMPLE:
 */
REQUEST:
POST /jobs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Fix Leaking Kitchen Sink",
  "description": "My kitchen sink is leaking under the counter. I need a professional plumber to fix it ASAP.",
  "serviceId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "bookingType": "DIRECT",
  "workerId": "64a1b2c3d4e5f6g7h8i9j0k2"
}

RESPONSE 201 Created:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
    "title": "Fix Leaking Kitchen Sink",
    "description": "My kitchen sink is leaking...",
    "serviceId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "clientId": "64a1b2c3d4e5f6g7h8i9j0k4",
    "workerId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "bookingType": "DIRECT",
    "status": "PENDING",
    "total_price": 500,
    "depositAmount": 100,
    "site_commission": 10,
    "paymentStatus": "UNPAID",
    "paymentMethod": null,
    "paymentRef": null,
    "createdAt": "2024-05-11T10:00:00Z",
    "updatedAt": "2024-05-11T10:00:00Z"
  }
}

/**
 * OPEN BOOKING EXAMPLE:
 */
REQUEST:
POST /jobs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Need Bathroom Renovation",
  "description": "Looking for a contractor to help renovate my bathroom. Need someone experienced with tile work and plumbing.",
  "serviceId": "64a1b2c3d4e5f6g7h8i9j0k5"
}

RESPONSE 201 Created:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k6",
    "title": "Need Bathroom Renovation",
    "description": "Looking for a contractor...",
    "serviceId": "64a1b2c3d4e5f6g7h8i9j0k5",
    "clientId": "64a1b2c3d4e5f6g7h8i9j0k4",
    "workerId": null,
    "bookingType": "OPEN",
    "status": "PENDING",
    "total_price": 0,
    "depositAmount": 0,
    "site_commission": 10,
    "paymentStatus": "UNPAID",
    "createdAt": "2024-05-11T11:00:00Z",
    "updatedAt": "2024-05-11T11:00:00Z"
  }
}

/**
 * ERROR: Creating DIRECT without workerId
 */
RESPONSE 400 Bad Request:
{
  "success": false,
  "message": "workerId is required for DIRECT bookings"
}

/**
 * ERROR: Creating OPEN with workerId
 */
RESPONSE 400 Bad Request:
{
  "success": false,
  "message": "workerId must not be provided for OPEN bookings"
}

// ============================================
// 2. PROPOSAL ENDPOINTS
// ============================================

/**
 * POST /proposals - Technician Sends Proposal
 */
REQUEST:
POST /proposals
Content-Type: application/json
Authorization: Bearer {token}

{
  "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
  "message": "I have 8 years of experience in bathroom renovations. I specialize in tile work and can complete this project in 5-7 days. I provide warranty on all work.",
  "proposedPrice": 2500,
  "estimatedDuration": 40
}

RESPONSE 201 Created:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k7",
    "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
    "technicianId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k8",
      "name": "Ahmed El-Sayed",
      "email": "ahmed@fixify.com",
      "rating": 4.8
    },
    "message": "I have 8 years of experience...",
    "proposedPrice": 2500,
    "estimatedDuration": 40,
    "status": "PENDING",
    "statusHistory": [
      {
        "status": "PENDING",
        "changedAt": "2024-05-11T12:00:00Z"
      }
    ],
    "createdAt": "2024-05-11T12:00:00Z",
    "updatedAt": "2024-05-11T12:00:00Z"
  }
}

/**
 * ERROR: Duplicate proposal from same technician
 */
RESPONSE 400 Bad Request:
{
  "success": false,
  "message": "You have already submitted a proposal for this job"
}

/**
 * ERROR: Sending proposal to DIRECT job
 */
RESPONSE 400 Bad Request:
{
  "success": false,
  "message": "Proposals can only be sent for OPEN jobs"
}

/**
 * GET /proposals/open-jobs - Browse Open Jobs (Technician)
 */
REQUEST:
GET /proposals/open-jobs?limit=50&skip=0&serviceId=64a1b2c3d4e5f6g7h8i9j0k5
Authorization: Bearer {token}

RESPONSE 200 OK:
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k6",
      "title": "Need Bathroom Renovation",
      "description": "Looking for a contractor to help renovate my bathroom...",
      "serviceId": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k5",
        "name": "Bathroom Renovation",
        "base_price": 2000,
        "category": "Renovation"
      },
      "clientId": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
        "name": "Sarah Ahmed",
        "email": "sarah@example.com",
        "rating": 4.9
      },
      "bookingType": "OPEN",
      "status": "PENDING",
      "createdAt": "2024-05-11T11:00:00Z"
    },
    // More jobs...
  ]
}

/**
 * GET /proposals/job/:jobId - Get Job Proposals (Client)
 */
REQUEST:
GET /proposals/job/64a1b2c3d4e5f6g7h8i9j0k6
Authorization: Bearer {token}

RESPONSE 200 OK:
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k7",
      "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
      "technicianId": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k8",
        "name": "Ahmed El-Sayed",
        "email": "ahmed@fixify.com",
        "rating": 4.8,
        "totalJobs": 250,
        "totalEarnings": 45000
      },
      "message": "I have 8 years of experience in bathroom renovations...",
      "proposedPrice": 2500,
      "estimatedDuration": 40,
      "status": "PENDING",
      "createdAt": "2024-05-11T12:00:00Z"
    },
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k9",
      "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
      "technicianId": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0ka",
        "name": "Mohamed Hassan",
        "email": "hassan@fixify.com",
        "rating": 4.9,
        "totalJobs": 320,
        "totalEarnings": 52000
      },
      "message": "Expert contractor with 10 years experience. Can start immediately.",
      "proposedPrice": 2800,
      "estimatedDuration": 35,
      "status": "PENDING",
      "createdAt": "2024-05-11T12:15:00Z"
    }
  ]
}

/**
 * PATCH /proposals/:id/accept - Client Accepts Proposal
 */
REQUEST:
PATCH /proposals/64a1b2c3d4e5f6g7h8i9j0k7/accept
Content-Type: application/json
Authorization: Bearer {token}

{}

RESPONSE 200 OK:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k7",
    "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
    "technicianId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k8",
      "name": "Ahmed El-Sayed",
      "email": "ahmed@fixify.com"
    },
    "proposedPrice": 2500,
    "status": "ACCEPTED",
    "acceptedAt": "2024-05-11T13:00:00Z",
    "acceptedByClientAt": "2024-05-11T13:00:00Z",
    "statusHistory": [
      { "status": "PENDING", "changedAt": "2024-05-11T12:00:00Z" },
      { "status": "ACCEPTED", "changedAt": "2024-05-11T13:00:00Z" }
    ]
  }
}

/**
 * AFTER PROPOSAL ACCEPTANCE - Job is Updated
 */
REQUEST:
GET /jobs/64a1b2c3d4e5f6g7h8i9j0k6
Authorization: Bearer {token}

RESPONSE 200 OK:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k6",
    "title": "Need Bathroom Renovation",
    "description": "Looking for a contractor...",
    "bookingType": "OPEN",
    "status": "ACCEPTED",
    "workerId": "64a1b2c3d4e5f6g7h8i9j0k8",
    "acceptedProposalId": "64a1b2c3d4e5f6g7h8i9j0k7",
    "total_price": 2500,              // Updated from proposal
    "depositAmount": 500,             // Recalculated: 2500 * 20%
    "paymentStatus": "UNPAID",        // Reset for new amount
    "site_commission": 10,
    "clientId": "64a1b2c3d4e5f6g7h8i9j0k4",
    "createdAt": "2024-05-11T11:00:00Z",
    "updatedAt": "2024-05-11T13:00:00Z"
  }
}

/**
 * PATCH /proposals/:id/reject - Client Rejects Proposal
 */
REQUEST:
PATCH /proposals/64a1b2c3d4e5f6g7h8i9j0k9/reject
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Already accepted another proposal with better price"
}

RESPONSE 200 OK:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k9",
    "status": "REJECTED",
    "rejectionReason": "Already accepted another proposal with better price",
    "statusHistory": [
      { "status": "PENDING", "changedAt": "2024-05-11T12:15:00Z" },
      { 
        "status": "REJECTED", 
        "reason": "Already accepted another proposal with better price",
        "changedAt": "2024-05-11T13:00:00Z" 
      }
    ]
  }
}

/**
 * GET /proposals/my - Technician's Proposals
 */
REQUEST:
GET /proposals/my?status=PENDING
Authorization: Bearer {token}

RESPONSE 200 OK:
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k7",
      "jobId": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k6",
        "title": "Need Bathroom Renovation",
        "description": "Looking for a contractor...",
        "status": "ACCEPTED",
        "total_price": 2500,
        "serviceId": {
          "_id": "64a1b2c3d4e5f6g7h8i9j0k5",
          "name": "Bathroom Renovation",
          "base_price": 2000
        },
        "clientId": {
          "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
          "name": "Sarah Ahmed",
          "email": "sarah@example.com"
        }
      },
      "message": "I have 8 years of experience...",
      "proposedPrice": 2500,
      "status": "ACCEPTED",
      "createdAt": "2024-05-11T12:00:00Z"
    }
  ]
}

/**
 * PATCH /proposals/:id/withdraw - Technician Withdraws Proposal
 */
REQUEST:
PATCH /proposals/64a1b2c3d4e5f6g7h8i9j0k7/withdraw
Authorization: Bearer {token}

{}

RESPONSE 200 OK:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k7",
    "status": "WITHDRAWN",
    "statusHistory": [
      { "status": "PENDING", "changedAt": "2024-05-11T12:00:00Z" },
      { "status": "WITHDRAWN", "changedAt": "2024-05-11T14:00:00Z" }
    ]
  }
}

/**
 * ERROR: Cannot withdraw accepted proposal
 */
RESPONSE 400 Bad Request:
{
  "success": false,
  "message": "Cannot withdraw an accepted proposal"
}

// ============================================
// 3. PAYMENT FLOW INTEGRATION
// ============================================

/**
 * POST /payments/deposit - Pay Deposit
 * 
 * Works for BOTH DIRECT and OPEN jobs
 * For OPEN jobs: amount is recalculated after proposal acceptance
 */
REQUEST:
POST /payments/deposit
Content-Type: application/json
Authorization: Bearer {token}

{
  "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
  "paymentMethod": "PAYPAL"
}

RESPONSE 200 OK:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k10",
    "jobId": "64a1b2c3d4e5f6g7h8i9j0k6",
    "clientId": "64a1b2c3d4e5f6g7h8i9j0k4",
    "amount": 500,
    "type": "DEPOSIT",
    "status": "PAID",
    "provider": "PAYPAL",
    "transactionId": "paypal_tx_12345",
    "createdAt": "2024-05-11T13:30:00Z"
  }
}

/**
 * After deposit paid, job status updates:
 */
GET /jobs/64a1b2c3d4e5f6g7h8i9j0k6

RESPONSE:
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k6",
    "total_price": 2500,
    "depositAmount": 500,
    "paymentStatus": "DEPOSIT_PAID",   // Changed
    "status": "ACCEPTED"
  }
}

// ============================================
// 4. NOTIFICATION PAYLOADS (WebSocket)
// ============================================

/**
 * NEW_PROPOSAL - Client receives when technician sends proposal
 */
{
  "type": "NEW_PROPOSAL",
  "title": "New Proposal Received",
  "message": "Ahmed El-Sayed submitted a proposal for Need Bathroom Renovation",
  "proposalId": "64a1b2c3d4e5f6g7h8i9j0k7",
  "jobId": "64a1b2c3d4e5f6g7h8i9j0k6"
}

/**
 * PROPOSAL_ACCEPTED - Technician receives when client accepts
 */
{
  "type": "PROPOSAL_ACCEPTED",
  "title": "Proposal Accepted",
  "message": "Your proposal for Need Bathroom Renovation was accepted",
  "jobId": "64a1b2c3d4e5f6g7h8i9j0k6"
}

/**
 * PROPOSAL_REJECTED - Technician receives when client rejects
 */
{
  "type": "PROPOSAL_REJECTED",
  "title": "Proposal Rejected",
  "message": "Your proposal for Need Bathroom Renovation was not selected"
}

/**
 * PROPOSAL_ASSIGNED - Client receives confirmation
 */
{
  "type": "PROPOSAL_ASSIGNED",
  "title": "Technician Assigned",
  "message": "Ahmed El-Sayed is now assigned to your job",
  "jobId": "64a1b2c3d4e5f6g7h8i9j0k6"
}

// ============================================
// 5. COMMON HTTP STATUS CODES
// ============================================

/**
 * 201 Created
 * - Job or proposal successfully created
 * 
 * 200 OK
 * - Proposal accepted/rejected
 * - Job retrieved
 * - Proposals list retrieved
 * 
 * 400 Bad Request
 * - Invalid input (missing fields, wrong type)
 * - Validation failed
 * - Business logic error (e.g., cannot accept proposal)
 * 
 * 403 Forbidden
 * - User not authorized to perform action
 * - Client trying to accept proposal for someone else's job
 * 
 * 404 Not Found
 * - Job/proposal not found
 * - Invalid ID
 * 
 * 401 Unauthorized
 * - Missing or invalid token
 */

// ============================================
// 6. DATABASE RELATIONS
// ============================================

/**
 * Job ──────┬────── Client (User)
 *           ├────── Service
 *           ├────── Technician (User) - Optional for OPEN
 *           ├────── Review - After completion
 *           └────── Proposal[] (OPEN only)
 * 
 * Proposal ─┬────── Job (OPEN type)
 *           └────── Technician (User)
 * 
 * When proposal accepted:
 * - Job.workerId = Proposal.technicianId
 * - Job.acceptedProposalId = Proposal._id
 * - Job.total_price = Proposal.proposedPrice
 * - All other Proposal records for same job auto-rejected
 */

// ============================================
// 7. USAGE EXAMPLE: COMPLETE FLOW
// ============================================

/**
 * STEP 1: Client creates OPEN job
 */
POST /jobs
{ bookingType: "OPEN", title: "...", serviceId: "..." }
// Response: Job created with total_price = 0, depositAmount = 0

/**
 * STEP 2: Technician 1 sends proposal
 */
POST /proposals
{ jobId: "...", message: "...", proposedPrice: 2500 }
// Response: Proposal created with status PENDING
// Client notified: NEW_PROPOSAL

/**
 * STEP 3: Technician 2 sends proposal
 */
POST /proposals
{ jobId: "...", message: "...", proposedPrice: 2300 }
// Response: Proposal created with status PENDING
// Client notified: NEW_PROPOSAL

/**
 * STEP 4: Client reviews proposals via GET /proposals/job/{jobId}
 */
GET /proposals/job/...
// Response: Array of both proposals

/**
 * STEP 5: Client accepts Technician 2's proposal
 */
PATCH /proposals/{proposal2_id}/accept
// Response: Proposal status = ACCEPTED
// Job updated: workerId, acceptedProposalId, total_price, depositAmount
// Technician 2: Notified PROPOSAL_ACCEPTED
// Technician 1's proposal: Auto-rejected, notified PROPOSAL_REJECTED
// Client: Notified PROPOSAL_ASSIGNED

/**
 * STEP 6: Client pays deposit
 */
POST /payments/deposit
{ jobId: "..." }
// Response: Payment recorded
// Job.paymentStatus = DEPOSIT_PAID

/**
 * STEP 7: Flow continues as normal job lifecycle
 */
// Technician accepts job (if not auto-accepted)
// Technician starts job
// Technician completes job
// Client pays final payment
// Client reviews

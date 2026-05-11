/**
 * ============================================
 * FIXIFY DUAL BOOKING SYSTEM - FRONTEND GUIDE
 * ============================================
 * 
 * This guide covers integration of the new proposal/open jobs system
 * with the existing direct booking flow.
 */

// ============================================
// 1. API ENDPOINTS OVERVIEW
// ============================================

/**
 * BOOKING TYPE: DIRECT
 * - Client selects technician + creates job
 * - Technician gets job notification
 * - Can accept/reject
 * 
 * BOOKING TYPE: OPEN
 * - Client creates job without selecting technician
 * - Multiple technicians can send proposals
 * - Client reviews proposals and accepts one
 * - Technician gets assigned
 */

// ============================================
// 2. API ENDPOINTS
// ============================================

/**
 * ===== JOB ENDPOINTS =====
 */

// Create DIRECT job (existing, now updated)
POST /api/jobs
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Fix Kitchen Sink",
  "description": "My kitchen sink is leaking and needs repair",
  "serviceId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "bookingType": "DIRECT",
  "workerId": "64a1b2c3d4e5f6g7h8i9j0k2"  // Required for DIRECT
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "job123",
    "title": "Fix Kitchen Sink",
    "description": "...",
    "bookingType": "DIRECT",
    "status": "PENDING",
    "total_price": 500,
    "depositAmount": 100,
    "workerId": "tech123",
    "clientId": "client123",
    "paymentStatus": "UNPAID"
  }
}

// Create OPEN job (new)
POST /api/jobs
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Need Plumbing Service",
  "description": "Water pipe issue in the bathroom that needs professional attention",
  "serviceId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "bookingType": "OPEN"
  // NO workerId for OPEN
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "job456",
    "title": "Need Plumbing Service",
    "bookingType": "OPEN",
    "status": "PENDING",
    "total_price": 0,        // Will be set when proposal accepted
    "depositAmount": 0,      // Will be recalculated
    "workerId": null,        // Not assigned yet
    "clientId": "client123",
    "paymentStatus": "UNPAID"
  }
}

/**
 * ===== PROPOSAL ENDPOINTS =====
 */

// Get open jobs (Technician browsing)
GET /api/proposals/open-jobs?limit=50&skip=0&serviceId=service123
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "job456",
      "title": "Need Plumbing Service",
      "description": "...",
      "bookingType": "OPEN",
      "status": "PENDING",
      "serviceId": { "name": "Plumbing", "base_price": 500 },
      "clientId": { "name": "John", "email": "john@email.com" },
      "createdAt": "2024-05-11T10:00:00Z"
    }
  ]
}

// Technician sends proposal
POST /api/proposals
Content-Type: application/json
Authorization: Bearer {token}

{
  "jobId": "job456",
  "message": "I have 5 years of plumbing experience. I can fix this quickly and professionally.",
  "proposedPrice": 450,
  "estimatedDuration": 2  // hours
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "proposal789",
    "jobId": "job456",
    "technicianId": {
      "_id": "tech123",
      "name": "Ahmed",
      "email": "ahmed@email.com",
      "rating": 4.8
    },
    "message": "I have 5 years of plumbing experience...",
    "proposedPrice": 450,
    "estimatedDuration": 2,
    "status": "PENDING",
    "createdAt": "2024-05-11T11:00:00Z"
  }
}

// Get all proposals for a job (Client viewing proposals)
GET /api/proposals/job/job456
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "proposal789",
      "jobId": "job456",
      "technicianId": {
        "_id": "tech123",
        "name": "Ahmed",
        "email": "ahmed@email.com",
        "rating": 4.8,
        "totalJobs": 250,
        "totalEarnings": 45000
      },
      "message": "I have 5 years of plumbing experience...",
      "proposedPrice": 450,
      "estimatedDuration": 2,
      "status": "PENDING",
      "createdAt": "2024-05-11T11:00:00Z"
    },
    {
      "_id": "proposal790",
      "jobId": "job456",
      "technicianId": {
        "_id": "tech456",
        "name": "Mohamed",
        "email": "mohamed@email.com",
        "rating": 4.9,
        "totalJobs": 300,
        "totalEarnings": 52000
      },
      "message": "Expert plumber with 8 years experience...",
      "proposedPrice": 500,
      "estimatedDuration": 1.5,
      "status": "PENDING",
      "createdAt": "2024-05-11T11:15:00Z"
    }
  ]
}

// Client accepts proposal
PATCH /api/proposals/proposal789/accept
Content-Type: application/json
Authorization: Bearer {token}

{}

Response 200:
{
  "success": true,
  "data": {
    "_id": "proposal789",
    "jobId": "job456",
    "technicianId": {
      "_id": "tech123",
      "name": "Ahmed"
    },
    "proposedPrice": 450,
    "status": "ACCEPTED",
    "acceptedAt": "2024-05-11T12:00:00Z",
    "acceptedByClientAt": "2024-05-11T12:00:00Z"
  }
}

// After proposal acceptance, job is updated:
GET /api/jobs/job456
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "_id": "job456",
    "title": "Need Plumbing Service",
    "bookingType": "OPEN",
    "status": "ACCEPTED",
    "workerId": "tech123",         // Now assigned!
    "acceptedProposalId": "proposal789",
    "total_price": 450,            // Updated to proposal price
    "depositAmount": 90,           // Recalculated: 450 * 20%
    "paymentStatus": "UNPAID",     // Reset for new payment
    "clientId": "client123"
  }
}

// Client rejects proposal
PATCH /api/proposals/proposal790/reject
Content-Type: application/json
Authorization: Bearer {token}

{
  "reason": "Already accepted another proposal"
}

Response 200:
{
  "success": true,
  "data": {
    "_id": "proposal790",
    "status": "REJECTED",
    "rejectionReason": "Already accepted another proposal"
  }
}

// Get technician's proposals
GET /api/proposals/my?status=PENDING
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "proposal789",
      "jobId": {
        "_id": "job456",
        "title": "Need Plumbing Service",
        "status": "PENDING",
        "total_price": 0,
        "serviceId": { "name": "Plumbing", "base_price": 500 }
      },
      "message": "I can help with this...",
      "proposedPrice": 450,
      "status": "PENDING",
      "createdAt": "2024-05-11T11:00:00Z"
    }
  ]
}

// Withdraw proposal (Technician)
PATCH /api/proposals/proposal789/withdraw
Authorization: Bearer {token}

{}

Response 200:
{
  "success": true,
  "data": {
    "_id": "proposal789",
    "status": "WITHDRAWN"
  }
}

// ============================================
// 3. PAYMENT FLOW
// ============================================

/**
 * DIRECT BOOKING PAYMENT:
 * 1. Job created with total_price = service.base_price
 * 2. depositAmount calculated immediately
 * 3. Client pays deposit
 * 4. Technician can accept job
 * 
 * OPEN BOOKING PAYMENT:
 * 1. Job created with total_price = 0, depositAmount = 0
 * 2. Proposals sent (no payment yet)
 * 3. Client accepts proposal
 * 4. total_price = proposal.proposedPrice
 * 5. depositAmount recalculated
 * 6. Client pays deposit
 * 7. Technician can accept job
 */

// Pay deposit (same for both DIRECT and OPEN)
POST /api/payments/deposit
Content-Type: application/json
Authorization: Bearer {token}

{
  "jobId": "job456",  // Can be DIRECT or OPEN
  "paymentMethod": "PAYPAL"
}

Response 200:
{
  "success": true,
  "data": {
    "_id": "payment123",
    "jobId": "job456",
    "amount": 90,  // depositAmount
    "type": "DEPOSIT",
    "status": "PAID",
    "transactionId": "paypal_tx_123"
  }
}

// After deposit paid, job payment status updates
GET /api/jobs/job456
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "_id": "job456",
    "total_price": 450,
    "depositAmount": 90,
    "paymentStatus": "DEPOSIT_PAID",  // Now deposit is paid
    "status": "ACCEPTED"
  }
}

// ============================================
// 4. NOTIFICATION TYPES
// ============================================

/**
 * NEW_PROPOSAL - Client receives when technician sends proposal
 * PROPOSAL_ACCEPTED - Technician receives when client accepts their proposal
 * PROPOSAL_REJECTED - Technician receives when client rejects their proposal
 * PROPOSAL_WITHDRAWN - Client receives when technician withdraws proposal
 * PROPOSAL_ASSIGNED - Client receives confirmation that technician is assigned
 */

// Listen for notifications (WebSocket example)
socket.on('notification', (notification) => {
  if (notification.type === 'NEW_PROPOSAL') {
    console.log('New proposal received from:', notification.proposalId);
    // Refresh proposals list
  }
  
  if (notification.type === 'PROPOSAL_ACCEPTED') {
    console.log('Your proposal was accepted!');
    // Show job assigned screen
  }
});

// ============================================
// 5. VALIDATION RULES
// ============================================

/**
 * DIRECT BOOKING VALIDATION:
 * - workerId: REQUIRED
 * - bookingType: "DIRECT"
 * - Technician must exist and have role "technician"
 * 
 * OPEN BOOKING VALIDATION:
 * - workerId: MUST BE NULL or undefined
 * - bookingType: "OPEN"
 * - Multiple proposals allowed
 * 
 * PROPOSAL VALIDATION:
 * - message: required, 10-1000 chars
 * - proposedPrice: required, 0-10000
 * - estimatedDuration: optional, 0-168 hours
 * - Cannot send duplicate proposals from same technician
 */

// ============================================
// 6. ERROR HANDLING
// ============================================

/**
 * When creating DIRECT job without workerId:
 * {
 *   "success": false,
 *   "message": "workerId is required for DIRECT bookings"
 * }
 * 
 * When creating OPEN job with workerId:
 * {
 *   "success": false,
 *   "message": "workerId must not be provided for OPEN bookings"
 * }
 * 
 * When sending proposal to DIRECT job:
 * {
 *   "success": false,
 *   "message": "Proposals can only be sent for OPEN jobs"
 * }
 * 
 * When duplicate proposal:
 * {
 *   "success": false,
 *   "message": "You have already submitted a proposal for this job"
 * }
 */

// ============================================
// 7. STATUS FLOW COMPARISON
// ============================================

/**
 * DIRECT BOOKING:
 * PENDING -> ACCEPTED -> ACTIVE -> DONE
 * 
 * OPEN BOOKING:
 * PENDING (no proposals yet)
 * -> PENDING (proposals received)
 * -> ACCEPTED (client accepts proposal)
 * -> ACTIVE (technician starts work)
 * -> DONE (technician completes work)
 */

// ============================================
// 8. IMPORTANT NOTES
// ============================================

/**
 * - Existing DIRECT booking flow remains unchanged
 * - OPEN jobs start with $0 price and $0 deposit
 * - Payment is only triggered after proposal acceptance
 * - All other job mechanics (chat, reviews, etc.) work the same
 * - Commission is calculated on final price
 * - Multiple technicians can send proposals simultaneously
 * - Client can accept/reject proposals anytime before acceptance
 * - After acceptance, all other proposals are auto-rejected
 */

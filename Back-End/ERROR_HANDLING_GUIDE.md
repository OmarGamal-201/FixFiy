/**
 * ============================================
 * ERROR HANDLING & TROUBLESHOOTING GUIDE
 * ============================================
 */

// ============================================
// 1. JOB CREATION ERRORS
// ============================================

/**
 * ERROR: Missing required fields
 * Status: 400 Bad Request
 * Message: "Missing required fields: title, description, serviceId"
 * 
 * CAUSE: Required field(s) not provided
 * SOLUTION: Include title, description, and serviceId in request
 */

REQUEST:
{
  "title": "",  // ❌ Empty
  "description": "",  // ❌ Empty
  "serviceId": ""  // ❌ Empty
}

RESPONSE 400:
{
  "success": false,
  "message": "Missing required fields: title, description, serviceId"
}

---

/**
 * ERROR: Invalid booking type
 * Status: 400 Bad Request
 * Message: "bookingType must be either DIRECT or OPEN"
 * 
 * CAUSE: bookingType is neither "DIRECT" nor "OPEN"
 * SOLUTION: Use exactly "DIRECT" or "OPEN"
 */

REQUEST:
{
  "bookingType": "MIXED"  // ❌ Invalid
}

RESPONSE 400:
{
  "success": false,
  "message": "bookingType must be either DIRECT or OPEN"
}

---

/**
 * ERROR: Missing workerId for DIRECT booking
 * Status: 400 Bad Request
 * Message: "workerId is required for DIRECT bookings"
 * 
 * CAUSE: Creating DIRECT job without workerId
 * SOLUTION: Provide valid workerId for DIRECT bookings
 */

REQUEST:
{
  "bookingType": "DIRECT"
  // ❌ Missing workerId
}

RESPONSE 400:
{
  "success": false,
  "message": "workerId is required for DIRECT bookings"
}

---

/**
 * ERROR: workerId provided for OPEN booking
 * Status: 400 Bad Request
 * Message: "workerId must not be provided for OPEN bookings"
 * 
 * CAUSE: Creating OPEN job with workerId
 * SOLUTION: Remove workerId from request for OPEN bookings
 */

REQUEST:
{
  "bookingType": "OPEN",
  "workerId": "tech123"  // ❌ Should not provide for OPEN
}

RESPONSE 400:
{
  "success": false,
  "message": "workerId must not be provided for OPEN bookings"
}

---

/**
 * ERROR: Invalid technician
 * Status: 400 Bad Request
 * Message: "Assigned worker not found or invalid"
 * 
 * CAUSE: workerId doesn't exist or isn't a technician
 * SOLUTION: Verify workerId exists and has role "technician"
 */

REQUEST:
{
  "workerId": "nonexistent_id"
}

RESPONSE 400:
{
  "success": false,
  "message": "Assigned worker not found or invalid"
}

---

/**
 * ERROR: Invalid service
 * Status: 400 Bad Request
 * Message: "Service not found or invalid"
 * 
 * CAUSE: serviceId doesn't exist
 * SOLUTION: Use valid serviceId from services list
 */

// ============================================
// 2. PROPOSAL CREATION ERRORS
// ============================================

/**
 * ERROR: Proposal sent to DIRECT job
 * Status: 400 Bad Request
 * Message: "Proposals can only be sent for OPEN jobs"
 * 
 * CAUSE: Trying to send proposal to DIRECT job
 * SOLUTION: Only send proposals for OPEN jobs
 */

REQUEST:
{
  "jobId": "direct_job_id"  // ❌ Is DIRECT job
}

RESPONSE 400:
{
  "success": false,
  "message": "Proposals can only be sent for OPEN jobs"
}

---

/**
 * ERROR: Job not found
 * Status: 400 Bad Request
 * Message: "Job not found"
 * 
 * CAUSE: Invalid jobId
 * SOLUTION: Use valid jobId
 */

REQUEST:
{
  "jobId": "invalid_id"
}

RESPONSE 400:
{
  "success": false,
  "message": "Job not found"
}

---

/**
 * ERROR: Technician not found
 * Status: 400 Bad Request
 * Message: "Technician not found"
 * 
 * CAUSE: User is not authenticated as technician
 * SOLUTION: Ensure logged-in user is a technician
 */

// ============================================
// 3. PROPOSAL VALIDATION ERRORS
// ============================================

/**
 * ERROR: Message too short
 * Status: 400 Bad Request
 * Message: "Validation failed"
 * errors: ["message must be at least 10 characters"]
 * 
 * CAUSE: Message < 10 characters
 * SOLUTION: Provide message with 10+ characters
 */

REQUEST:
{
  "message": "Help me"  // ❌ Only 8 chars
}

RESPONSE 400:
{
  "success": false,
  "message": "Validation failed",
  "errors": ["message must be at least 10 characters"]
}

---

/**
 * ERROR: Message too long
 * Status: 400 Bad Request
 * Message: "Validation failed"
 * errors: ["message must not exceed 1000 characters"]
 * 
 * CAUSE: Message > 1000 characters
 * SOLUTION: Keep message under 1000 characters
 */

---

/**
 * ERROR: Invalid proposed price
 * Status: 400 Bad Request
 * errors: ["proposedPrice must be greater than 0", "proposedPrice must not exceed 10000"]
 * 
 * CAUSE: Price < 0 or > 10000
 * SOLUTION: Use price between 0 and 10000
 */

---

/**
 * ERROR: Duplicate proposal
 * Status: 400 Bad Request
 * Message: "You have already submitted a proposal for this job"
 * 
 * CAUSE: Technician already sent proposal for this job
 * SOLUTION: Withdraw previous proposal or wait for decision
 */

// ============================================
// 4. PROPOSAL ACCEPTANCE ERRORS
// ============================================

/**
 * ERROR: Not authorized
 * Status: 403 Forbidden
 * Message: "Not authorized to accept this proposal"
 * 
 * CAUSE: User is not the job's client
 * SOLUTION: Only job owner can accept/reject proposals
 */

---

/**
 * ERROR: Job not pending
 * Status: 400 Bad Request
 * Message: "Job must be pending to accept a proposal"
 * 
 * CAUSE: Job status is not PENDING
 * SOLUTION: Can only accept proposals for PENDING jobs
 */

---

/**
 * ERROR: Proposal not pending
 * Status: 400 Bad Request
 * Message: "Only pending proposals can be accepted"
 * 
 * CAUSE: Proposal already accepted/rejected
 * SOLUTION: Can only accept PENDING proposals
 */

// ============================================
// 5. AUTHORIZATION ERRORS
// ============================================

/**
 * ERROR: Unauthorized (missing token)
 * Status: 401 Unauthorized
 * Message: "No token provided"
 * 
 * CAUSE: Missing Authorization header
 * SOLUTION: Include Authorization: Bearer {token}
 */

REQUEST:
GET /api/proposals/open-jobs
// ❌ Missing Authorization header

RESPONSE 401:
{
  "success": false,
  "message": "No token provided"
}

---

/**
 * ERROR: Invalid token
 * Status: 401 Unauthorized
 * Message: "Invalid token"
 * 
 * CAUSE: Token expired or malformed
 * SOLUTION: Re-login to get new token
 */

---

/**
 * ERROR: Forbidden - wrong role
 * Status: 403 Forbidden
 * Message: "Access denied"
 * 
 * CAUSE: User role doesn't match endpoint requirement
 * SOLUTION: 
 *   - Technicians can send proposals
 *   - Clients can review proposals
 *   - Only appropriate role can access endpoint
 */

REQUEST:
POST /api/proposals
// ❌ Client trying to send proposal

RESPONSE 403:
{
  "success": false,
  "message": "Access denied"
}

// ============================================
// 6. COMMON DEBUGGING SCENARIOS
// ============================================

/**
 * SCENARIO 1: "I created an OPEN job but can't send proposal"
 * 
 * Possible causes:
 * 1. Job bookingType is "DIRECT", not "OPEN"
 *    → Check GET /jobs/:id response
 * 
 * 2. Job status is not "PENDING"
 *    → Can only send proposals to PENDING jobs
 *    → Check job status
 * 
 * 3. Duplicate proposal already exists
 *    → You already sent one for this job
 *    → Withdraw it first or wait for decision
 * 
 * Solutions:
 * - Verify job exists: GET /jobs/{jobId}
 * - Check job.bookingType === "OPEN"
 * - Check job.status === "PENDING"
 * - Check for existing proposals: GET /proposals/my
 */

---

/**
 * SCENARIO 2: "Client can't see my proposal"
 * 
 * Possible causes:
 * 1. Proposal not created successfully
 *    → Check response status (should be 201)
 * 
 * 2. Job ID mismatch
 *    → Ensure correct job ID used
 * 
 * 3. Proposal is WITHDRAWN
 *    → Appears in list but hidden from clients
 * 
 * Solutions:
 * - Check proposal creation response
 * - GET /proposals/my to see your proposals
 * - GET /proposals/job/{jobId} as client to see all
 */

---

/**
 * SCENARIO 3: "After accepting proposal, job price didn't update"
 * 
 * Possible causes:
 * 1. Proposal acceptance failed silently
 * 2. Database not updated
 * 3. Caching issue
 * 
 * Solutions:
 * - Check proposal status: GET /proposals/{id}
 * - Check job updated: GET /jobs/{id}
 * - Verify:
 *   - job.workerId = proposal.technicianId
 *   - job.total_price = proposal.proposedPrice
 *   - job.depositAmount recalculated
 *   - job.paymentStatus = "UNPAID"
 */

---

/**
 * SCENARIO 4: "Multiple proposals accepted for same job"
 * 
 * This should NOT happen!
 * 
 * Our system auto-rejects all other proposals when one is accepted.
 * 
 * If this occurs:
 * - Bug in system
 * - Database integrity issue
 * 
 * Check:
 * - Proposal statuses: GET /proposals/job/{jobId}
 * - Should be exactly ONE "ACCEPTED"
 * - All others should be "REJECTED"
 */

---

/**
 * SCENARIO 5: "Can't withdraw accepted proposal"
 * 
 * Expected behavior:
 * - Cannot withdraw ACCEPTED proposals
 * - Only PENDING proposals can be withdrawn
 * 
 * If you need to cancel an accepted job:
 * - Use job cancellation endpoint
 * - Provide reason
 * - Technician and client both notified
 */

// ============================================
// 7. VALIDATION CHECKLIST
// ============================================

/**
 * Before sending proposal:
 * ✅ Job exists
 * ✅ Job bookingType = "OPEN"
 * ✅ Job status = "PENDING"
 * ✅ You haven't already proposed on this job
 * ✅ Message is 10-1000 chars
 * ✅ proposedPrice is 0-10000
 * ✅ You are authenticated as technician
 */

/**
 * Before accepting proposal:
 * ✅ Proposal exists
 * ✅ Proposal status = "PENDING"
 * ✅ You own the job
 * ✅ Job status = "PENDING"
 * ✅ You are authenticated as client
 */

/**
 * Before creating OPEN job:
 * ✅ Title is 3-30 chars
 * ✅ Description is 15+ chars
 * ✅ Service exists
 * ✅ Don't provide workerId
 * ✅ You are authenticated as client
 */

/**
 * Before creating DIRECT job:
 * ✅ All of above PLUS:
 * ✅ workerId provided
 * ✅ Technician exists
 * ✅ Technician has role "technician"
 */

// ============================================
// 8. LOG EXAMPLES
// ============================================

/**
 * Success: Proposal created
 * 
 * Backend log:
 * [PROPOSAL_SERVICE] Proposal created: proposal123
 * [NOTIFICATION_SERVICE] NEW_PROPOSAL sent to client_id
 * [SOCKET_IO] Notification emitted to client_id
 */

/**
 * Success: Proposal accepted
 * 
 * Backend log:
 * [PROPOSAL_SERVICE] Proposal accepted: proposal123
 * [JOB_SERVICE] Job updated with workerId and price
 * [PROPOSAL_SERVICE] Auto-rejecting other proposals...
 * [NOTIFICATION_SERVICE] PROPOSAL_ACCEPTED sent to tech
 * [NOTIFICATION_SERVICE] PROPOSAL_REJECTED sent to other techs
 * [NOTIFICATION_SERVICE] PROPOSAL_ASSIGNED sent to client
 */

/**
 * Error: Duplicate proposal
 * 
 * Backend log:
 * [PROPOSAL_SERVICE] Duplicate proposal attempt
 * [AUTH] Technician: tech123
 * [JOB] Job: job456
 * [ERROR] Existing proposal found: proposal_old_id
 */

// ============================================
// 9. TESTING ENDPOINTS
// ============================================

/**
 * Test all new endpoints:
 */

// 1. Get open jobs (as technician)
GET http://localhost:3000/api/proposals/open-jobs
Authorization: Bearer {tech_token}

// Expected: 200 OK with array of jobs

---

// 2. Send proposal (as technician)
POST http://localhost:3000/api/proposals
Authorization: Bearer {tech_token}
{
  "jobId": "...",
  "message": "I can help with this",
  "proposedPrice": 500,
  "estimatedDuration": 2
}

// Expected: 201 Created with proposal data

---

// 3. Get job proposals (as client)
GET http://localhost:3000/api/proposals/job/...
Authorization: Bearer {client_token}

// Expected: 200 OK with array of proposals

---

// 4. Accept proposal (as client)
PATCH http://localhost:3000/api/proposals/.../accept
Authorization: Bearer {client_token}

// Expected: 200 OK with updated proposal
// Check job afterward - should have workerId

---

// 5. Get technician's proposals
GET http://localhost:3000/api/proposals/my
Authorization: Bearer {tech_token}

// Expected: 200 OK with technician's proposals

// ============================================
// 10. PERFORMANCE MONITORING
// ============================================

/**
 * Monitor these metrics:
 * 
 * - Proposal creation response time (target: <100ms)
 * - Get open jobs response time (target: <500ms)
 * - Proposal acceptance response time (target: <200ms)
 * 
 * Alert if:
 * - Response time > 1 second
 * - Error rate > 5%
 * - Database timeout
 * - Memory leak in notification service
 */

/**
 * Query performance:
 * 
 * - Index on (jobId, technicianId) critical
 * - Index on (technicianId, status) important
 * - Compound index on (bookingType, status) helps
 * 
 * Monitor with:
 * db.collection.find(...).explain("executionStats")
 */

// ============================================
// 11. SUPPORT ESCALATION
// ============================================

/**
 * If issue persists after troubleshooting:
 * 
 * GATHER:
 * 1. User ID and role
 * 2. Exact error message
 * 3. Request body and response
 * 4. Timestamp
 * 5. Reproduction steps
 * 
 * CHECK:
 * 1. Server logs
 * 2. Database records
 * 3. Socket.io connections
 * 4. Payment system integration
 * 5. Notification service status
 * 
 * ESCALATE TO:
 * - Backend team for API/database issues
 * - DevOps for infrastructure issues
 * - Frontend team for UI issues
 * - QA for reproducibility confirmation
 */

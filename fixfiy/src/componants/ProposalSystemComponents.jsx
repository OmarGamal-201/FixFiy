/**
 * ============================================
 * FIXIFY FRONTEND COMPONENTS - PROPOSAL SYSTEM
 * ============================================
 */

// ============================================
// 1. BookingType Selector (Enhanced Booking.jsx)
// ============================================

import React, { useState } from "react";
import axios from "axios";

export const BookingTypeSelector = () => {
  const [bookingType, setBookingType] = useState("DIRECT");

  return (
    <div className="booking-selector">
      <h2>How would you like to book?</h2>
      
      <div className="booking-options">
        <button
          className={`option ${bookingType === "DIRECT" ? "active" : ""}`}
          onClick={() => setBookingType("DIRECT")}
        >
          <h3>Direct Booking</h3>
          <p>Select a specific technician</p>
          <ul>
            <li>Choose from available technicians</li>
            <li>Instant technician assignment</li>
            <li>Immediate price quote</li>
            <li>Quick start</li>
          </ul>
        </button>

        <button
          className={`option ${bookingType === "OPEN" ? "active" : ""}`}
          onClick={() => setBookingType("OPEN")}
        >
          <h3>Open Request</h3>
          <p>Get multiple quotes from technicians</p>
          <ul>
            <li>Technicians send proposals</li>
            <li>Compare different prices</li>
            <li>See technician ratings & experience</li>
            <li>Choose the best offer</li>
          </ul>
        </button>
      </div>

      {bookingType === "DIRECT" && <DirectBookingForm />}
      {bookingType === "OPEN" && <OpenJobForm />}
    </div>
  );
};

// ============================================
// 2. Direct Booking Form (Updated)
// ============================================

export const DirectBookingForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceId: "",
    workerId: "", // REQUIRED for DIRECT
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.workerId) {
      alert("Please select a technician");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/jobs",
        {
          ...formData,
          bookingType: "DIRECT",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Job created:", response.data);
      // Redirect to payment page
    } catch (error) {
      console.error("Error:", error.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <input
        type="text"
        placeholder="Job Title"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        required
      />

      <textarea
        placeholder="Describe the issue"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        required
      />

      <select
        value={formData.serviceId}
        onChange={(e) =>
          setFormData({ ...formData, serviceId: e.target.value })
        }
        required
      >
        <option>Select Service Type</option>
        {/* Map services from API */}
      </select>

      {/* DIRECT BOOKING: Show technician selector */}
      <TechnicianSelector
        value={formData.workerId}
        onChange={(workerId) =>
          setFormData({ ...formData, workerId })
        }
      />

      <button type="submit">Book Now</button>
    </form>
  );
};

// ============================================
// 3. Open Job Form (New)
// ============================================

export const OpenJobForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/jobs",
        {
          ...formData,
          bookingType: "OPEN", // NO workerId
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Open job created:", response.data);
      // Redirect to wait-for-proposals screen
      // Navigate(`/jobs/${response.data.data._id}/proposals`);
    } catch (error) {
      console.error("Error:", error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h3>Create an Open Request</h3>
      <p className="info">
        Technicians will see your request and send proposals with their prices
      </p>

      <input
        type="text"
        placeholder="Job Title"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        required
      />

      <textarea
        placeholder="Describe the issue in detail"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
        required
      />

      <select
        value={formData.serviceId}
        onChange={(e) =>
          setFormData({ ...formData, serviceId: e.target.value })
        }
        required
      >
        <option>Select Service Type</option>
        {/* Map services from API */}
      </select>

      {/* NOTE: NO technician selector for OPEN jobs */}

      <button type="submit" disabled={loading}>
        {loading ? "Creating Request..." : "Post Open Request"}
      </button>
    </form>
  );
};

// ============================================
// 4. Open Jobs List (For Technicians)
// ============================================

export const OpenJobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchOpenJobs();
  }, []);

  const fetchOpenJobs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/proposals/open-jobs",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setJobs(response.data.data);
    } catch (error) {
      console.error("Error fetching open jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="open-jobs-list">
      <h2>Available Opportunities</h2>
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No open jobs available</p>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job) => (
            <OpenJobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 5. Open Job Card (For Technicians)
// ============================================

export const OpenJobCard = ({ job }) => {
  const [showProposalForm, setShowProposalForm] = useState(false);

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p className="description">{job.description}</p>

      <div className="job-info">
        <span className="service">{job.serviceId?.name}</span>
        <span className="base-price">Base Price: ${job.serviceId?.base_price}</span>
        <span className="client">
          By: {job.clientId?.name} ({job.clientId?.email})
        </span>
      </div>

      <div className="job-meta">
        <small>Posted: {new Date(job.createdAt).toLocaleDateString()}</small>
      </div>

      <button
        className="btn-primary"
        onClick={() => setShowProposalForm(true)}
      >
        Send Proposal
      </button>

      {showProposalForm && (
        <ProposalForm jobId={job._id} onClose={() => setShowProposalForm(false)} />
      )}
    </div>
  );
};

// ============================================
// 6. Proposal Form (For Technicians)
// ============================================

export const ProposalForm = ({ jobId, onClose }) => {
  const [formData, setFormData] = useState({
    message: "",
    proposedPrice: "",
    estimatedDuration: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/proposals",
        {
          jobId,
          message: formData.message,
          proposedPrice: parseFloat(formData.proposedPrice),
          estimatedDuration: parseFloat(formData.estimatedDuration),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Proposal sent:", response.data);
      alert("Proposal sent successfully!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error sending proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proposal-form-modal">
      <div className="form-container">
        <h3>Send Your Proposal</h3>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Message (10-1000 chars)</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Explain why you're the right fit for this job..."
              minLength="10"
              maxLength="1000"
              required
            />
          </div>

          <div className="form-group">
            <label>Your Proposed Price ($)</label>
            <input
              type="number"
              value={formData.proposedPrice}
              onChange={(e) =>
                setFormData({ ...formData, proposedPrice: e.target.value })
              }
              placeholder="Enter your price"
              min="0"
              max="10000"
              step="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Estimated Duration (hours)</label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) =>
                setFormData({ ...formData, estimatedDuration: e.target.value })
              }
              placeholder="How many hours?"
              min="0"
              max="168"
              step="0.5"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Sending..." : "Send Proposal"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================
// 7. Job Proposals View (For Clients)
// ============================================

export const JobProposalsView = ({ jobId }) => {
  const [proposals, setProposals] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchProposals();
  }, [jobId]);

  const fetchProposals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/proposals/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProposals(response.data.data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proposals-view">
      <h2>Proposals for Your Job</h2>

      {loading ? (
        <p>Loading proposals...</p>
      ) : proposals.length === 0 ? (
        <p>No proposals yet. Check back later!</p>
      ) : (
        <div className="proposals-list">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal._id}
              proposal={proposal}
              jobId={jobId}
              onProposalChange={fetchProposals}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 8. Proposal Card (For Clients)
// ============================================

export const ProposalCard = ({ proposal, jobId, onProposalChange }) => {
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await axios.patch(
        `http://localhost:3000/api/proposals/${proposal._id}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Proposal accepted! Technician will be assigned to your job.");
      onProposalChange();
    } catch (error) {
      alert(error.response?.data?.message || "Error accepting proposal");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (reason = "") => {
    setRejecting(true);
    try {
      await axios.patch(
        `http://localhost:3000/api/proposals/${proposal._id}/reject`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Proposal rejected");
      onProposalChange();
    } catch (error) {
      alert(error.response?.data?.message || "Error rejecting proposal");
    } finally {
      setRejecting(false);
    }
  };

  const tech = proposal.technicianId;

  return (
    <div className="proposal-card">
      <div className="header">
        <div className="tech-info">
          <h3>{tech.name}</h3>
          <div className="rating">
            <span className="stars">⭐ {tech.rating || "N/A"}</span>
            <span className="jobs">{tech.totalJobs} jobs</span>
          </div>
        </div>
        <div className="price">
          <span className="amount">${proposal.proposedPrice}</span>
          {proposal.estimatedDuration && (
            <span className="duration">~{proposal.estimatedDuration}h</span>
          )}
        </div>
      </div>

      <div className="message">
        <p>{proposal.message}</p>
      </div>

      <div className="actions">
        <button
          className="btn-accept"
          onClick={handleAccept}
          disabled={accepting || proposal.status !== "PENDING"}
        >
          {accepting ? "Accepting..." : "Accept Proposal"}
        </button>

        <button
          className="btn-reject"
          onClick={() => setShowRejectReason(true)}
          disabled={rejecting || proposal.status !== "PENDING"}
        >
          {rejecting ? "Rejecting..." : "Reject"}
        </button>
      </div>

      {showRejectReason && (
        <div className="reject-reason">
          <input
            type="text"
            placeholder="Reason for rejection (optional)"
            maxLength="500"
          />
          <button onClick={handleReject}>Confirm Reject</button>
        </div>
      )}

      <div className="status-badge">
        <span className={`status status-${proposal.status.toLowerCase()}`}>
          {proposal.status}
        </span>
      </div>
    </div>
  );
};

// ============================================
// 9. Technician My Proposals (Dashboard)
// ============================================

export const MyProposalsPage = () => {
  const [proposals, setProposals] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchMyProposals();
  }, [filter]);

  const fetchMyProposals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/proposals/my?status=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setProposals(response.data.data);
    } catch (error) {
      console.error("Error fetching proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-proposals-page">
      <h2>My Proposals</h2>

      <div className="filters">
        {["PENDING", "ACCEPTED", "REJECTED"].map((status) => (
          <button
            key={status}
            className={`filter-btn ${filter === status ? "active" : ""}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : proposals.length === 0 ? (
        <p>No proposals with {filter.toLowerCase()} status</p>
      ) : (
        <div className="proposals-list">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="proposal-row">
              <h4>{proposal.jobId?.title}</h4>
              <p>{proposal.jobId?.description}</p>
              <div className="details">
                <span>Your Price: ${proposal.proposedPrice}</span>
                <span>Status: {proposal.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 10. CSS Styles (Optional - Reference)
// ============================================

const styles = `
  .booking-selector {
    padding: 2rem;
  }

  .booking-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 2rem 0;
  }

  .booking-options .option {
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .booking-options .option.active {
    border-color: #007bff;
    background: #f0f7ff;
  }

  .proposal-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .proposal-card .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .proposal-card .price {
    text-align: right;
  }

  .proposal-card .amount {
    font-size: 1.5rem;
    font-weight: bold;
    color: #28a745;
  }

  .proposal-card .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .btn-accept,
  .btn-reject {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-accept {
    background: #28a745;
    color: white;
  }

  .btn-reject {
    background: #dc3545;
    color: white;
  }
`;

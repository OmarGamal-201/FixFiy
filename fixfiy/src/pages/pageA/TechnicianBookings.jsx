// TechnicianBookings.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  PlayCircle,
  Wrench,
  MapPin,
  User,
  Briefcase,
  FileText,
} from "lucide-react";
import API from "../../services/api";

const TechnicianBookings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const userRole = (
    localStorage.getItem("role") ||
    localStorage.getItem("userRole")
  )?.toLowerCase();

  useEffect(() => {
    if (userRole !== "technician") {
      navigate("/");
      return;
    }

    fetchJobs();
  }, [userRole, navigate]);

  // ============================
  // Fetch Technician Jobs
  // ============================
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/jobs");

      const fetchedJobs = res.data.data || res.data;

      // فلترة الطلبات الخاصة بالفني الحالي فقط
      const workerId =
        localStorage.getItem("userId") || localStorage.getItem("id");

      const workerJobs = Array.isArray(fetchedJobs)
        ? fetchedJobs.filter((job) => job.workerId?._id === workerId)
        : [];

      setJobs(workerJobs);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load technician bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Job Actions
  // ============================
  const updateJobStatus = async (jobId, action) => {
    setActionLoading(jobId);

    try {
      await API.patch(`/jobs/${jobId}/${action}`);
      fetchJobs();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          `Failed to ${action} job.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleChat = (jobId) => {
    navigate(`/chat?jobId=${jobId}`);
  };

  // ============================
  // Status Colors
  // ============================
  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-700";
      case "ACCEPTED":
        return "bg-blue-100 text-blue-700";
      case "ACTIVE":
        return "bg-indigo-100 text-indigo-700";
      case "DONE":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (userRole !== "worker") return null;

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Technician Bookings
          </h1>
          <p className="text-slate-600 mt-2">
            Manage all assigned service requests
          </p>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
            <p className="mt-4 text-slate-600">
              Loading your bookings...
            </p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!loading && jobs.length === 0 && !error && (
          <div className="text-center bg-white rounded-3xl shadow-md p-12">
            <Calendar className="mx-auto w-16 h-16 text-slate-400" />
            <h3 className="text-2xl font-semibold mt-4">
              No Bookings Available
            </h3>
            <p className="text-slate-500 mt-2">
              You don't have any assigned jobs yet.
            </p>
          </div>
        )}

        {/* ================= BOOKINGS GRID ================= */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-slate-800">
                    {job.title}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Client */}
                <div className="space-y-3 text-sm text-slate-700">
                  <p className="flex items-center gap-2">
                    <User size={16} />
                    <strong>Client:</strong>{" "}
                    {job.clientId?.name || "Unknown"}
                  </p>

                  <p className="flex items-center gap-2">
                    <Briefcase size={16} />
                    <strong>Service:</strong>{" "}
                    {job.serviceId?.name || "N/A"}
                  </p>

                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="mt-1" />
                    <span>
                      <strong>Address:</strong>{" "}
                      {job.location?.governorate},{" "}
                      {job.location?.city},{" "}
                      {job.location?.street}
                    </span>
                  </p>

                  <p className="flex items-start gap-2">
                    <FileText size={16} className="mt-1" />
                    <span>
                      <strong>Description:</strong>{" "}
                      {job.description}
                    </span>
                  </p>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {/* Accept / Reject */}
                  {job.status === "PENDING" && (
                    <>
                      <button
                        onClick={() =>
                          updateJobStatus(job._id, "accept")
                        }
                        disabled={actionLoading === job._id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          updateJobStatus(job._id, "reject")
                        }
                        disabled={actionLoading === job._id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}

                  {/* Start Job */}
                  {job.status === "ACCEPTED" && (
                    <button
                      onClick={() =>
                        updateJobStatus(job._id, "start")
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} />
                      Start Job Now
                    </button>
                  )}

                  {/* Complete Job */}
                  {job.status === "ACTIVE" && (
                    <button
                      onClick={() =>
                        updateJobStatus(job._id, "complete")
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Wrench size={18} />
                      Mark as Done
                    </button>
                  )}

                  {/* Chat */}
                  {(job.status === "ACCEPTED" ||
                    job.status === "ACTIVE") && (
                    <button
                      onClick={() => handleChat(job._id)}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={18} />
                      Open Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianBookings;
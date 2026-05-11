const validateSendProposal = (data) => {
  const errors = [];

  if (!data.jobId) errors.push("jobId is required");
  if (!data.message) errors.push("message is required");

  if (data.message && data.message.length < 10) {
    errors.push("message must be at least 10 characters");
  }

  if (data.message && data.message.length > 1000) {
    errors.push("message must not exceed 1000 characters");
  }

  if (data.estimatedDuration) {
    if (data.estimatedDuration < 0 || data.estimatedDuration > 168) {
      errors.push("estimatedDuration must be between 0 and 168 hours");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateAcceptProposal = (data) => {
  const errors = [];

  if (!data.proposalId) errors.push("proposalId is required");

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateRejectProposal = (data) => {
  const errors = [];

  if (!data.proposalId) errors.push("proposalId is required");

  if (data.reason && data.reason.length > 500) {
    errors.push("reason must not exceed 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateSendProposal,
  validateAcceptProposal,
  validateRejectProposal,
};

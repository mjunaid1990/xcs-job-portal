export interface FormattedNotification {
  title: string;
  message: string;
  href?: string;
  category: "proposal" | "contract" | "payment" | "review" | "dispute" | "message" | "system";
}

export function formatNotification(
  type: string,
  rawPayload: unknown,
  role?: string,
): FormattedNotification {
  const payload =
    typeof rawPayload === "object" && rawPayload !== null
      ? (rawPayload as Record<string, unknown>)
      : {};

  const isClient = role === "CLIENT";
  const isFreelancer = role === "FREELANCER";
  const isAdmin = role === "ADMIN";

  switch (type) {
    case "PROPOSAL_RECEIVED":
    case "NEW_PROPOSAL": {
      const freelancer = String(payload.freelancerName ?? "A specialist");
      const job = String(payload.jobTitle ?? payload.title ?? "your job posting");
      const bid = payload.bidAmount
        ? ` ($${payload.bidAmount})`
        : payload.bidCents
          ? ` ($${(Number(payload.bidCents) / 100).toFixed(0)})`
          : "";
      const jobId = payload.jobId ? String(payload.jobId) : undefined;
      return {
        title: "New Proposal Received",
        message: `${freelancer} submitted a bid${bid} on "${job}".`,
        href: jobId ? `/client/jobs/${jobId}/proposals` : "/client/jobs",
        category: "proposal",
      };
    }

    case "PROPOSAL_ACCEPTED": {
      const job = String(payload.jobTitle ?? "the project");
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "Proposal Accepted!",
        message: `Great news! Your proposal for "${job}" was accepted. Your contract is now active.`,
        href: contractId ? `/contracts/${contractId}` : isClient ? "/client/contracts" : "/freelancer/contracts",
        category: "contract",
      };
    }

    case "PROPOSAL_SHORTLISTED": {
      const job = String(payload.jobTitle ?? "the project");
      return {
        title: "Proposal Shortlisted",
        message: `Your application for "${job}" has been shortlisted by the hiring team.`,
        href: isClient ? "/client/jobs" : "/freelancer/proposals",
        category: "proposal",
      };
    }

    case "PROPOSAL_REJECTED":
    case "PROPOSAL_DECLINED": {
      const job = String(payload.jobTitle ?? "the project");
      return {
        title: "Proposal Status Update",
        message: `The client has concluded review for "${job}". Thank you for your bid.`,
        href: isClient ? "/client/jobs" : "/freelancer/proposals",
        category: "proposal",
      };
    }

    case "CONTRACT_OFFERED":
    case "CONTRACT_CREATED": {
      const client = String(payload.clientName ?? "A client");
      const job = String(payload.jobTitle ?? "project");
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "New Contract Offer",
        message: `${client} sent you a formal contract offer for "${job}".`,
        href: contractId ? `/contracts/${contractId}` : isClient ? "/client/contracts" : "/freelancer/contracts",
        category: "contract",
      };
    }

    case "MILESTONE_FUNDED":
    case "ESCROW_FUNDED": {
      const milestone = String(payload.milestoneTitle ?? payload.title ?? "Milestone");
      const amount = payload.amount
        ? ` (${payload.amount})`
        : payload.amountDollars
          ? ` ($${payload.amountDollars})`
          : payload.amountCents
            ? ` ($${(Number(payload.amountCents) / 100).toFixed(0)})`
            : "";
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "Milestone Escrow Funded",
        message: `Escrow funds for "${milestone}"${amount} have been deposited and securely locked.`,
        href: contractId ? `/contracts/${contractId}` : isClient ? "/client/contracts" : "/freelancer/contracts",
        category: "payment",
      };
    }

    case "DELIVERABLE_SUBMITTED": {
      const milestone = String(payload.milestoneTitle ?? "Milestone");
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "Deliverable Submitted for Review",
        message: `Work deliverables for "${milestone}" have been submitted for your approval.`,
        href: contractId ? `/contracts/${contractId}` : "/client/contracts",
        category: "contract",
      };
    }

    case "REVISION_REQUESTED": {
      const milestone = String(payload.milestoneTitle ?? "Milestone");
      const reason = payload.reason ? `: "${payload.reason}"` : "";
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "Milestone Revision Requested",
        message: `The client requested adjustments on "${milestone}"${reason}`,
        href: contractId ? `/contracts/${contractId}` : isClient ? "/client/contracts" : "/freelancer/contracts",
        category: "contract",
      };
    }

    case "MILESTONE_RELEASED": {
      const milestone = String(payload.milestoneTitle ?? "Milestone");
      const payout = payload.netPayoutDollars ?? payload.amountDollars ?? "0.00";
      const isPartial = Boolean(payload.isPartial);
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: isPartial ? "Partial Escrow Payment Released" : "Milestone Payment Released",
        message: `${isPartial ? "Partial payment" : "Full payment"} of $${payout} for "${milestone}" has been released to your balance.`,
        href: contractId ? `/contracts/${contractId}` : isClient ? "/client/contracts" : "/freelancer/payouts",
        category: "payment",
      };
    }

    case "REVIEW_RECEIVED": {
      const reviewer = String(payload.reviewerName ?? "A user");
      const rating = payload.rating ? `${payload.rating}-star ` : "";
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "New Review Received",
        message: `${reviewer} left a ${rating}review on your completed contract.`,
        href: contractId ? `/contracts/${contractId}` : isClient ? "/client/profile" : "/freelancer/profile",
        category: "review",
      };
    }

    case "DISPUTE_OPENED": {
      const reason = payload.reason ? `: "${payload.reason}"` : "";
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "Contract Dispute Filed",
        message: `A formal mediation request was filed${reason}. Escrow funds are safely held during review.`,
        href: contractId ? `/contracts/${contractId}` : isAdmin ? "/admin/disputes" : isClient ? "/client/contracts" : "/freelancer/contracts",
        category: "dispute",
      };
    }

    case "DISPUTE_RESOLVED": {
      const resolution = String(payload.resolution ?? "Mediation completed.");
      const contractId = payload.contractId ? String(payload.contractId) : undefined;
      return {
        title: "Dispute Resolved",
        message: `Dispute review has completed: ${resolution}`,
        href: contractId ? `/contracts/${contractId}` : isAdmin ? "/admin/disputes" : isClient ? "/client/contracts" : "/freelancer/contracts",
        category: "dispute",
      };
    }

    case "NEW_MESSAGE": {
      const sender = String(payload.senderName ?? "A team member");
      const preview = payload.preview ? ` "${payload.preview}"` : "";
      const conversationId = payload.conversationId ? String(payload.conversationId) : undefined;
      return {
        title: `Message from ${sender}`,
        message: preview || `${sender} sent you a direct message in your workroom.`,
        href: conversationId ? `/messages/${conversationId}` : "/messages",
        category: "message",
      };
    }

    default: {
      const readableType = type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

      // Extract any useful human text from payload without dumping raw JSON
      const textCandidate =
        payload.message ||
        payload.description ||
        payload.title ||
        payload.text ||
        payload.reason ||
        "You have a new update in your workspace.";

      const fallbackHref = isClient
        ? "/client"
        : isFreelancer
          ? "/freelancer"
          : isAdmin
            ? "/admin"
            : "/client";

      return {
        title: readableType,
        message: String(textCandidate),
        href: fallbackHref,
        category: "system",
      };
    }
  }
}

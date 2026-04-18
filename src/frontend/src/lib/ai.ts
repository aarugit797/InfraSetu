import { UserRole } from "@/types";

export interface AIVerificationResult {
  isFlagged: boolean;
  reason: string;
}

/**
 * MOCKED AI Engine for InfraSetu Hackathon
 * Simulates intelligent parsing of complaint text and spatial anomalies.
 */
export async function verifyComplaintAI(
  title: string,
  description: string,
  locationMatch: boolean
): Promise<AIVerificationResult> {
  // Simulate network/inference delay
  await new Promise((r) => setTimeout(r, 1500));

  const text = (title + " " + description).toLowerCase();

  // Rule 1: Location mismatch is an immediate red flag
  if (!locationMatch) {
    return {
      isFlagged: true,
      reason: "Location Mismatch: Device GPS coordinates recorded during submission do not match the target project site boundaries. High probability of fabrication.",
    };
  }

  // Rule 2: Semantic checks (Common fake topics or contradictions)
  const redFlagKeywords = ["super", "magic", "invisible", "fake", "scam", "billion"];
  if (redFlagKeywords.some((kw) => text.includes(kw))) {
    return {
      isFlagged: true,
      reason: "Semantic Anomaly: Description contains hyperbolic or suspicious terminology often associated with non-genuine reporting.",
    };
  }

  // Rule 3: Contradictory weather/environment simulation (contextual)
  if (text.includes("snow") ) {
    return {
      isFlagged: true,
      reason: "Contextual Contradiction: Description mentions environmental conditions (snow) that are statistically impossible for the recorded regional climate metadata.",
    };
  }

  return { isFlagged: false, reason: "Verified: Description and spatial metadata appear consistent." };
}

/**
 * Generates role-based insights for the InfraSetu AI Assistant
 */
export function getRoleBasedInsights(role: UserRole | "public") {
  const insights: Record<string, string[]> = {
    governmentAuthority: [
      "Alert: NH-48 Project budget utilization exceeded by 5% in March.",
      "Compliance Note: 12% of workforce at Sector 45 School Site lack updated safety permits.",
      "Recommendation: Release pending payment for Village Road connectivity to maintain milestone speed."
    ],
    projectManager: [
      "Timeline Alert: Material shortage at Site B may delay Milestone 3 by 4 days.",
      "Labor Insight: Site A is operating at 95% efficiency, but Site C is at 60% due to weather.",
      "Action Req: Approve 5 pending wage requests to prevent labor union escalation."
    ],
    auditor: [
      "Anomaly Detected: Material costs for Cement (P2) are 18% higher than current market rate index.",
      "Logistics Check: 3 fuel pings observed outside assigned project routes for Truck #420.",
      "Attendance Gap: 14 ghost-attendance entries flagged for manual verification at Site D."
    ],
    contractor: [
      "Safety Warning: High wind alert for tomorrow. Secure all scaffolding at Tower A.",
      "Supply Chain: Delivery of TMT Steel confirmed for 09:00 AM Monday.",
      "Next Milestone: 82% complete. Estimated completion date: Oct 24."
    ],
    public: [
      "Site Status: Government School Complex is moving 10% faster than average state projects.",
      "Community Note: 4 water-logged areas reported; maintenance crew dispatched.",
      "Transparency: Project budget is 100% audited and verified."
    ]
  };

  return insights[role] || insights["public"];
}

/**
 * Mock chatbot response generator
 */
export async function getChatBotResponse(message: string, role: string): Promise<string> {
  // Simulating connection to advanced backend Python AI Agent (LangGraph/Groq-Llama)
  await new Promise((r) => setTimeout(r, 2000));
  const query = message.toLowerCase();

  const thinkingPrefix = `*Connecting to Backend Inference (Llama 3.3)... Context: ${role.toUpperCase()}...*\n\n`;

  if (query.includes("budget") || query.includes("money") || query.includes("cost")) {
    return thinkingPrefix + `**Financial Intelligence Report:**\n\nI have analyzed the blockchain ledger for this quadrant:\n- **Current Allocation:** ₹4.20 Cr \n- **Utilization Rate:** 68% (Optimal)\n- **Anomalies Detected:** **0**\n\n*Recommendation*: The contractor is pending a ₹12L release for Milestone 3 completion. Authorizing this will maintain the critical path schedule. How would you like to proceed?`;
  }
  
  if (query.includes("status") || query.includes("progress") || query.includes("delay")) {
    return thinkingPrefix + `**Real-time Site Diagnostics:**\n\n- **Overall Completion:** 64.5%\n- **Milestone Velocity:** +1.2% ahead of nominal trajectory.\n- **Bottleneck Detection:** The AI vision system noted delayed material staging at Sector 45, but the contractor resolved it today.\n\n*Impact Analysis*: We are on track for the projected Q3 handover. Shall I generate a formal PDF progress report for the government authority?`;
  }
  
  if (query.includes("safety") || query.includes("issue") || query.includes("risk")) {
    return thinkingPrefix + `**Risk & Compliance Engine:**\n\n- **Active Hazards:** **None**\n- **Resolved Logs:** 2 minor incident logs closed by the Site Engineer today.\n- **Environment Alert:** Open-Meteo API forecasts high wind speeds tomorrow. Recommend securing open scaffolding by 17:00 HRS.\n\n*Action*: I have pre-drafted a safety memo. Would you like me to dispatch it to all on-site supervisors via SMS?`;
  }
  
  return thinkingPrefix + `As your specialized **${role.replace(/([A-Z])/g, ' $1').trim()} AI**, I have full access to the InfraSetu backend databases, IoT sensory metrics, and cross-project ledgers.\n\nYou can ask me complex queries like:\n1. *"Analyze our current budget burn rate."*\n2. *"Identify potential bottlenecks in the upcoming phase."*\n3. *"Audit the recent community complaints for spatial anomalies."*\n\nHow can I accelerate your decision-making today?`;
}

export type AgentName =
  | "scout"
  | "pricer"
  | "operator"
  | "collector"
  | "auditor";

export type JobStatus =
  | "intake"
  | "running"
  | "awaiting_payment"
  | "delivered"
  | "escalated"
  | "paid"
  | "rejected";

export type DecisionLog = {
  id: string;
  at: string;
  agent: AgentName;
  decision: string;
  rationale: string;
  payload: unknown;
  model: string;
  latencyMs: number;
};

export type ScoutOutput = {
  businessOneLiner: string;
  customerWho: string;
  corePain: string;
  constraints: string[];
  successLooksLike: string;
  riskFlags: string[];
};

export type PricingOutput = {
  takeJob: boolean;
  rejectReason?: string;
  sku: "desk_sprint" | "desk_retainer";
  priceUsd: number;
  complexity: 1 | 2 | 3 | 4 | 5;
  marginNote: string;
  rationale: string;
};

export type Script = {
  situation: string;
  channel: "sms" | "whatsapp" | "email" | "in_person";
  message: string;
};

export type SequenceStep = {
  day: number;
  action: string;
  owner: "owner" | "staff" | "agent";
  copy: string;
};

export type OperatorOutput = {
  playbookTitle: string;
  situationSummary: string;
  operatingRules: string[];
  scripts: Script[];
  sevenDaySequence: SequenceStep[];
  metricsToWatch: string[];
  risks: string[];
};

export type DunningStep = {
  day: number;
  channel: "email" | "sms";
  message: string;
};

export type CollectorOutput = {
  terms: "due_on_delivery" | "net7";
  invoiceMemo: string;
  dunning: DunningStep[];
  waive: boolean;
};

export type AuditorOutput = {
  verdict: "SHIP" | "REVISE" | "ESCALATE" | "REJECT";
  qualityScore: number;
  issues: string[];
  humanNeeded: boolean;
  humanReason?: string;
};

export type Job = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  currentAgent: AgentName | null;
  error?: string;
  customer: {
    name: string;
    email: string;
    businessName: string;
    industry: string;
    location: string;
  };
  problem: string;
  constraints: string;
  scout?: ScoutOutput;
  pricing?: PricingOutput;
  deliverable?: OperatorOutput;
  collection?: CollectorOutput;
  audit?: AuditorOutput;
  logs: DecisionLog[];
  payment: {
    amountUsd: number;
    status: "unpriced" | "invoiced" | "paid" | "waived" | "demo_paid";
    stripeSessionId?: string;
    paidAt?: string;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type InputType = "text" | "url" | "claim";

export interface AnalyzeRequest {
  content: string;
  input_type: InputType;
  user_id?: string;
  user_email?: string;
}

export interface ClassificationResult {
  verdict: string;
  fake_probability: number;
  real_probability: number;
  model: string;
}

export interface SentimentResult {
  vader_compound: number;
  sensationalism_score: number;
  sentiment_score: number;
}

export interface CredibilityResult {
  domain: string | null;
  score: number;
  credibility_level: string;
  category: string;
  bias: string;
  is_flagged: boolean;
  in_database: boolean;
  credibility_score: number;
}

export interface FactCheckMatch {
  claim_text: string;
  claimant: string;
  rating: string;
  publisher: string;
  url: string;
  review_date: string;
  language: string;
}

export interface FactCheckResult {
  has_matches: boolean;
  match_count: number;
  matches: FactCheckMatch[];
  fact_check_score: number;
  api_available: boolean;
}

export interface ArticleInfo {
  title: string | null;
  authors: string[];
  publish_date: string | null;
  source_domain: string | null;
}

export interface Highlight {
  text: string;
  weight: number;
  signal: "fake" | "real";
}

export interface ExplainabilityResult {
  highlights: Highlight[];
  explanation: string | null;
  method: string;
  available: boolean;
}

export interface ClickbaitResult {
  available: boolean;
  mismatch_score: number;
  clickbait_score: number;
  pattern_matches: string[];
  similarity: number | null;
  headline: string | null;
}

export interface AnalyzeResponse {
  id: string;
  verdict: "Real" | "Misleading" | "Fake";
  confidence: number;
  final_score: number;
  input_text: string;
  analyzed_text: string | null;
  input_type: string;
  model_used: string;
  created_at: string | null;
  classification: ClassificationResult;
  sentiment: SentimentResult;
  credibility: CredibilityResult;
  fact_check: FactCheckResult;
  article_info: ArticleInfo | null;
  explainability: ExplainabilityResult | null;
  clickbait: ClickbaitResult | null;
}

export interface AnalysisSummary {
  id: string;
  verdict: string;
  confidence: number;
  final_score: number;
  input_type: string;
  input_text: string;
  model_used: string;
  created_at: string | null;
}

export interface HistoryResponse {
  items: AnalysisSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface VerdictCount {
  verdict: string;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface FlaggedSource {
  domain: string;
  count: number;
  avg_score: number;
}

export interface StatsResponse {
  total_analyses: number;
  verdict_distribution: VerdictCount[];
  trends: TrendPoint[];
  recent_analyses: AnalysisSummary[];
  flagged_sources: FlaggedSource[];
}

export async function analyzeContent(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getAnalysis(id: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE}/analyze/${id}`);

  if (!res.ok) {
    throw new Error(res.status === 404 ? "Analysis not found" : `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getHistory(
  page = 1,
  pageSize = 20,
  verdict?: string,
  userEmail?: string
): Promise<HistoryResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (verdict) params.set("verdict", verdict);
  if (userEmail) params.set("user_email", userEmail);

  const res = await fetch(`${API_BASE}/history?${params}`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export async function getStats(userEmail?: string): Promise<StatsResponse> {
  const params = userEmail
    ? `?user_email=${encodeURIComponent(userEmail)}`
    : "";
  const res = await fetch(`${API_BASE}/stats${params}`);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}

export interface ModelResult {
  model_name: string;
  verdict: string;
  confidence: number;
  fake_probability: number;
  real_probability: number;
  inference_time_ms: number;
  available: boolean;
}

export interface CompareResponse {
  input_text: string;
  models: ModelResult[];
}

export async function compareModels(
  request: AnalyzeRequest
): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Comparison failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function submitFeedback(
  analysisId: string,
  isCorrect: boolean,
  userVerdict?: string,
  comment?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback/${analysisId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      is_correct: isCorrect,
      user_verdict: userVerdict,
      comment,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
}

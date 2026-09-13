export type JobEmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "internship"
  | "temporary";

export type JobWorkplaceType = "onsite" | "remote" | "hybrid";

export type SalaryPeriod = "hourly" | "monthly" | "yearly";

export interface Job {
  id: string;
  organization_id: string;
  slug: string;
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  employment_type: JobEmploymentType;
  workplace_type: JobWorkplaceType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;
  experience_level: string | null;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  published_at: string | null;
  closed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobCreatePayload {
  title: string;
  description: string;
  department?: string | null;
  location?: string | null;
  employment_type?: JobEmploymentType;
  workplace_type?: JobWorkplaceType;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: SalaryPeriod | null;
  experience_level?: string | null;
  requirements?: string | null;
  responsibilities?: string | null;
  benefits?: string | null;
  is_active?: boolean;
}

export type JobUpdatePayload = Partial<JobCreatePayload>;

export type JobApplicationStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";

export type CandidateRankingRecommendation =
  | "strong_match"
  | "possible_match"
  | "not_recommended";

export type CandidateRankingStatus = "pending" | "completed" | "failed";

export interface ResumeWorkExperience {
  company: string | null;
  title: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface ResumeEducation {
  institution: string | null;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface ResumeCertification {
  name: string | null;
  issuer: string | null;
  issued_date: string | null;
}

export interface ParsedResume {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  summary: string | null;
  skills: string[];
  work_experience: ResumeWorkExperience[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
  total_experience_years: number | null;
}

export interface JobApplication {
  id: string;
  job_id: string;
  organization_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  summary: string | null;
  parsed_resume: ParsedResume | null;
  cover_letter: string | null;
  status: JobApplicationStatus;
  ranking_score: number | null;
  ranking_recommendation: CandidateRankingRecommendation | null;
  ranking_rationale: string | null;
  ranking_strengths: string[] | null;
  ranking_gaps: string[] | null;
  ranking_status: CandidateRankingStatus;
  ranking_error: string | null;
  ranked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplicationStatusUpdatePayload {
  status: JobApplicationStatus;
}

export interface PublicJobOrganization {
  name: string;
  slug: string;
  website: string | null;
}

export interface PublicJob {
  slug: string;
  title: string;
  description: string;
  department: string | null;
  location: string | null;
  employment_type: JobEmploymentType;
  workplace_type: JobWorkplaceType;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;
  experience_level: string | null;
  requirements: string | null;
  responsibilities: string | null;
  benefits: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  organization: PublicJobOrganization;
}

export interface JobApplicationCreatePayload {
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string | null;
  candidate_location?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  summary?: string | null;
  resume_text?: string | null;
  parsed_resume?: ParsedResume | null;
  cover_letter?: string | null;
}

export interface PublicResumeParseResponse {
  resume_text: string;
  parsed_resume: ParsedResume;
}

export interface PublicJobApplicationResponse {
  candidate_name: string;
  candidate_email: string;
  status: JobApplicationStatus;
  created_at: string;
}

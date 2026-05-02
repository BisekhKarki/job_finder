export type Job = {
  id: number;
  title: string;
  slug: string;
  company: number;
  created_by: number;
  description: string;
  requirements: string;
  experience_level: "entry" | "mid" | "senior";
  job_type: "full_time" | "part_time" | "internship" | "contract";
  location: string;
  salary_min: number;
  salary_max: number;
  tags: number[];
  is_active: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
};

export type Application = {
  applicant: number;
  job: number;
  slug: string;
  status: string;
};

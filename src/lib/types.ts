export interface Course {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  created_at: string;
}

export interface Tee {
  id: string;
  course_id: string;
  tee_name: string;
  yardage: number | null;
  par: number | null;
  slope: number | null;
  rating: number | null;
  created_at: string;
}

export interface Round {
  id: string;
  date_played: string;
  course_name: string;
  score: number;
  notes: string | null;
  image_url: string | null;
  gir: number | null;
  total_putts: number | null;
  penalties: number | null;
  transport: "walk" | "cart";
  course_id: string | null;
  tee_id: string | null;
  created_at: string;
  course?: Course;
  tee?: Tee;
}

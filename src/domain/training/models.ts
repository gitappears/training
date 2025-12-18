// Modelos de dominio para cursos tipo Udemy

export interface TrainingAttachment {
  id: string;
  type: 'file' | 'link';
  label: string;
  url: string;
}

export interface TrainingImage {
  id: string;
  url: string;
  alt?: string;
}

export interface TrainingSection {
  id: string;
  title: string;
  description?: string;
  lessonsCount: number;
  durationMinutes: number;
}

export interface TrainingStudent {
  id: string;
  name: string;
  email: string;
  progress: number; // 0-1
  score?: number; // nota final
  rating?: number; // 1-5
}

export interface TrainingReview {
  id: string;
  studentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type TrainingStatus = 'active' | 'inactive' | 'draft' | 'published' | 'finished' | 'cancelled';

export interface Training {
  id: string;
  title: string;
  description: string;
  type: 'standard' | 'certified' | 'survey';
  modality: 'online' | 'onsite' | 'hybrid';
  coverImageUrl?: string;
  promoVideoUrl?: string;
  instructor: string;
  area: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  durationHours?: number;
  capacity?: number;
  studentsCount: number;
  averageRating: number;
  status?: TrainingStatus;
  sections: TrainingSection[];
  attachments: TrainingAttachment[];
  images: TrainingImage[];
  students: TrainingStudent[];
  reviews: TrainingReview[];
}

// Implementación HTTP del repositorio de evaluaciones
// Adaptador que conecta la capa de aplicación con la API REST

// import { api } from '../../../boot/axios'; // TODO: Descomentar cuando backend esté listo
import type { AxiosError } from 'axios';
import type {
  IEvaluationRepository,
  CreateEvaluationDto,
  UpdateEvaluationDto,
  SubmitEvaluationDto,
  EvaluationListParams,
  EvaluationFilters,
  EvaluationStatistics,
} from '../../../application/evaluation/evaluation.repository.port';
import type {
  Evaluation,
  EvaluationAttempt,
  QuestionType,
} from '../../../domain/evaluation/models';
import type { PaginatedResponse } from '../../../application/training/training.repository.port';

/**
 * Tipos para las respuestas del backend (mock por ahora)
 */
interface BackendEvaluation {
  id: number;
  courseId: number;
  courseName: string;
  description: string;
  durationMinutes: number;
  minimumScore: number;
  attemptsAllowed: number;
  questions: BackendQuestion[];
  createdAt: string;
  updatedAt?: string;
}

interface BackendQuestion {
  id: number;
  text: string;
  type: string;
  options: BackendQuestionOption[];
  imageUrl?: string;
  order: number;
}

interface BackendQuestionOption {
  id: number;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

// interface BackendPaginatedResponse { // TODO: Usar cuando backend esté listo
//   data: BackendEvaluation[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// }

/**
 * Mapea la respuesta del backend al modelo de dominio
 */
function mapBackendToDomain(backendData: BackendEvaluation): Evaluation {
  const evaluation: Evaluation = {
    id: backendData.id?.toString() ?? '',
    courseId: backendData.courseId?.toString() ?? '',
    courseName: backendData.courseName ?? '',
    description: backendData.description ?? '',
    questions: backendData.questions?.map((q: BackendQuestion) => {
      const question: {
        id: string;
        text: string;
        type: QuestionType;
        options: Array<{
          id: string;
          text: string;
          isCorrect: boolean;
          imageUrl?: string;
        }>;
        order: number;
        imageUrl?: string;
      } = {
        id: q.id?.toString() ?? '',
        text: q.text ?? '',
        type: mapQuestionType(q.type),
        options: q.options?.map((opt: BackendQuestionOption) => {
          const option: {
            id: string;
            text: string;
            isCorrect: boolean;
            imageUrl?: string;
          } = {
            id: opt.id?.toString() ?? '',
            text: opt.text ?? '',
            isCorrect: opt.isCorrect ?? false,
          };
          if (opt.imageUrl) {
            option.imageUrl = opt.imageUrl;
          }
          return option;
        }) ?? [],
        order: q.order ?? 0,
      };
      if (q.imageUrl) {
        question.imageUrl = q.imageUrl;
      }
      return question;
    }) ?? [],
    questionsCount: backendData.questions?.length ?? 0,
    durationMinutes: backendData.durationMinutes ?? 0,
    minimumScore: backendData.minimumScore ?? 70,
    attemptsAllowed: backendData.attemptsAllowed ?? 2,
    status: 'pending',
    createdAt: backendData.createdAt ?? new Date().toISOString(),
  };
  if (backendData.updatedAt) {
    evaluation.updatedAt = backendData.updatedAt;
  }
  return evaluation;
}

function mapQuestionType(type: string): QuestionType {
  const normalized = type?.toLowerCase() ?? 'single';
  if (normalized.includes('multiple')) return 'multiple';
  if (normalized.includes('image')) return 'image';
  if (normalized.includes('true') || normalized.includes('false')) return 'true_false';
  if (normalized.includes('yes') || normalized.includes('no')) return 'yes_no';
  return 'single';
}

/**
 * Servicio HTTP para evaluaciones
 * Implementa el puerto IEvaluationRepository usando axios
 * Por ahora usa datos mock, pero está listo para conectarse al backend
 */
export class EvaluationsService implements IEvaluationRepository {
  private readonly baseUrl = '/evaluaciones';

  // eslint-disable-next-line @typescript-eslint/require-await
  async findAll(params: EvaluationListParams): Promise<PaginatedResponse<Evaluation>> {
    try {
      // Mock por ahora
      const mockEvaluations: BackendEvaluation[] = [
        {
          id: 1,
          courseId: 1,
          courseName: 'Primeros Auxilios',
          description: 'Evaluación sobre primeros auxilios básicos',
          durationMinutes: 30,
          minimumScore: 70,
          attemptsAllowed: 2,
          questions: [],
          createdAt: '2025-01-15T10:00:00Z',
        },
      ];

      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = mockEvaluations.slice(start, end);

      return {
        data: paginated.map(mapBackendToDomain),
        total: mockEvaluations.length,
        page,
        limit,
        totalPages: Math.ceil(mockEvaluations.length / limit),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener la lista de evaluaciones',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findOne(id: string): Promise<Evaluation> {
    try {
      // Mock por ahora
      const mockEvaluation: BackendEvaluation = {
        id: Number.parseInt(id),
        courseId: 1,
        courseName: 'Primeros Auxilios',
        description: 'Evaluación sobre primeros auxilios básicos',
        durationMinutes: 30,
        minimumScore: 70,
        attemptsAllowed: 2,
        questions: [
          {
            id: 1,
            text: '¿Cuál es el primer paso en primeros auxilios?',
            type: 'single',
            options: [
              { id: 1, text: 'Llamar al 911', isCorrect: false },
              { id: 2, text: 'Evaluar la escena', isCorrect: true },
              { id: 3, text: 'Iniciar RCP', isCorrect: false },
            ],
            order: 1,
          },
        ],
        createdAt: '2025-01-15T10:00:00Z',
      };

      return mapBackendToDomain(mockEvaluation);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener la evaluación con ID ${id}`,
      );
    }
  }

  async findByCourse(courseId: string): Promise<Evaluation | null> {
    try {
      // Mock por ahora
      const evaluation = await this.findOne('1');
      if (evaluation.courseId === courseId) {
        return evaluation;
      }
      return null;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al obtener la evaluación del curso ${courseId}`,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(dto: CreateEvaluationDto): Promise<Evaluation> {
    try {
      // Mock por ahora
      const mockEvaluation: BackendEvaluation = {
        id: Date.now(),
        courseId: Number.parseInt(dto.courseId),
        courseName: 'Curso',
        description: dto.description,
        durationMinutes: dto.durationMinutes,
        minimumScore: dto.minimumScore,
        attemptsAllowed: dto.attemptsAllowed,
        questions: dto.questions.map((q, idx) => {
          const question: BackendQuestion = {
            id: idx + 1,
            text: q.text,
            type: q.type,
            options: q.options.map((opt, optIdx) => {
              const option: BackendQuestionOption = {
                id: optIdx + 1,
                text: opt.text,
                isCorrect: opt.isCorrect,
              };
              if (opt.imageUrl) {
                option.imageUrl = opt.imageUrl;
              }
              return option;
            }),
            order: q.order,
          };
          if (q.imageUrl) {
            question.imageUrl = q.imageUrl;
          }
          return question;
        }),
        createdAt: new Date().toISOString(),
      };

      return mapBackendToDomain(mockEvaluation);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al crear la evaluación',
      );
    }
  }

  async update(id: string, dto: UpdateEvaluationDto): Promise<Evaluation> {
    try {
      // Mock por ahora
      const existing = await this.findOne(id);
      const mockEvaluation: BackendEvaluation = {
        id: Number.parseInt(id),
        courseId: Number.parseInt(existing.courseId),
        courseName: existing.courseName,
        description: dto.description ?? existing.description,
        durationMinutes: dto.durationMinutes ?? existing.durationMinutes,
        minimumScore: dto.minimumScore ?? existing.minimumScore,
        attemptsAllowed: dto.attemptsAllowed ?? existing.attemptsAllowed,
        questions: existing.questions.map((q) => {
          const question: BackendQuestion = {
            id: Number.parseInt(q.id),
            text: q.text,
            type: q.type,
            options: q.options.map((opt) => {
              const option: BackendQuestionOption = {
                id: Number.parseInt(opt.id),
                text: opt.text,
                isCorrect: opt.isCorrect,
              };
              if (opt.imageUrl) {
                option.imageUrl = opt.imageUrl;
              }
              return option;
            }),
            order: q.order,
          };
          if (q.imageUrl) {
            question.imageUrl = q.imageUrl;
          }
          return question;
        }),
        updatedAt: new Date().toISOString(),
        createdAt: existing.createdAt,
      };

      return mapBackendToDomain(mockEvaluation);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al actualizar la evaluación con ID ${id}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Mock por ahora
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? `Error al eliminar la evaluación con ID ${id}`,
      );
    }
  }

  async submitAttempt(dto: SubmitEvaluationDto): Promise<EvaluationAttempt> {
    try {
      // Mock: Calificación automática (RF-18)
      // Cuando el backend esté listo: const response = await api.post(`${this.baseUrl}/${dto.evaluationId}/submit`, dto);
      
      // Simular calificación
      const evaluation = await this.findOne(dto.evaluationId);
      const totalQuestions = evaluation.questions.length;
      let correctAnswers = 0;

      evaluation.questions.forEach((question) => {
        const userAnswer = dto.answers[question.id];
        if (question.type === 'multiple') {
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          const correctOptions = question.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);
          if (
            userAnswers.length === correctOptions.length &&
            userAnswers.every((ans) => correctOptions.includes(ans))
          ) {
            correctAnswers++;
          }
        } else {
          const correctOption = question.options.find((opt) => opt.isCorrect);
          if (correctOption && userAnswer === correctOption.id) {
            correctAnswers++;
          }
        }
      });

      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= evaluation.minimumScore;

      return {
        id: Date.now().toString(),
        evaluationId: dto.evaluationId,
        userId: 'current-user-id', // En producción vendría del store de auth
        answers: dto.answers,
        score,
        passed,
        completedAt: new Date().toISOString(),
        timeSpentMinutes: dto.timeSpentMinutes,
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al enviar la evaluación',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getUserAttempts(evaluationId: string, userId: string): Promise<EvaluationAttempt[]> {
    try {
      // Mock por ahora
      return [];
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener los intentos de evaluación',
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async getStatistics(filters?: EvaluationFilters): Promise<EvaluationStatistics> {
    try {
      // Mock por ahora
      return {
        total: 50,
        pending: 20,
        inProgress: 10,
        passed: 15,
        failed: 5,
        byCourse: {
          '1': 10,
          '2': 15,
          '3': 25,
        },
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(
        axiosError.response?.data?.message ?? 'Error al obtener estadísticas de evaluaciones',
      );
    }
  }
}

// Exportar instancia singleton
export const evaluationsService = new EvaluationsService();


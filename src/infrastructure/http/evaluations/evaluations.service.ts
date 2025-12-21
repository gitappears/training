// Implementación HTTP del repositorio de evaluaciones
// Adaptador que conecta la capa de aplicación con la API REST

import { api } from '../../../boot/axios';
import type { AxiosError } from 'axios';
import type {
  IEvaluationRepository,
  CreateEvaluationDto,
  UpdateEvaluationDto,
  SubmitEvaluationDto,
  EvaluationListParams,
  EvaluationFilters,
  EvaluationStatistics,
  CreateQuestionDto,
  CreateQuestionOptionDto,
} from '../../../application/evaluation/evaluation.repository.port';
import type {
  Evaluation,
  EvaluationAttempt,
  QuestionType,
} from '../../../domain/evaluation/models';
import type { PaginatedResponse } from '../../../application/training/training.repository.port';

/**
 * Tipos para las respuestas del backend
 */
interface BackendTipoPregunta {
  id: number;
  nombre: string;
}

interface BackendOpcionRespuesta {
  id: number;
  texto: string;
  esCorrecta: boolean;
  puntajeParcial?: number;
  orden: number;
}

interface BackendPregunta {
  id: number;
  tipoPregunta: BackendTipoPregunta;
  enunciado: string;
  imagenUrl?: string;
  puntaje: number;
  orden: number;
  requerida: boolean;
  opciones: BackendOpcionRespuesta[];
}

interface BackendEvaluacion {
  id: number;
  capacitacion?: {
    id: number;
  };
  titulo: string;
  descripcion?: string;
  tiempoLimiteMinutos?: number;
  intentosPermitidos: number;
  mostrarResultados: boolean;
  mostrarRespuestasCorrectas: boolean;
  puntajeTotal: number;
  minimoAprobacion: number;
  orden: number;
  activo: boolean;
  fechaCreacion: string;
  preguntas?: BackendPregunta[];
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
function mapBackendToDomain(backendData: BackendEvaluacion): Evaluation {
  const evaluation: Evaluation = {
    id: backendData.id?.toString() ?? '',
    courseId: backendData.capacitacion?.id?.toString() ?? '',
    courseName: '',
    description: backendData.descripcion ?? '',
    questions: backendData.preguntas?.map((q: BackendPregunta) => {
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
        text: q.enunciado ?? '',
        type: mapTipoPreguntaToQuestionType(q.tipoPregunta),
        options: q.opciones?.map((opt: BackendOpcionRespuesta) => {
          const option: {
            id: string;
            text: string;
            isCorrect: boolean;
            imageUrl?: string;
          } = {
            id: opt.id?.toString() ?? '',
            text: opt.texto ?? '',
            isCorrect: opt.esCorrecta ?? false,
          };
          return option;
        }) ?? [],
        order: q.orden ?? 0,
      };
      if (q.imagenUrl) {
        question.imageUrl = q.imagenUrl;
      }
      return question;
    }) ?? [],
    questionsCount: backendData.preguntas?.length ?? 0,
    durationMinutes: backendData.tiempoLimiteMinutos ?? 0,
    minimumScore: backendData.minimoAprobacion ?? 70,
    attemptsAllowed: backendData.intentosPermitidos ?? 2,
    status: 'pending',
    createdAt: backendData.fechaCreacion ?? new Date().toISOString(),
  };
  return evaluation;
}

/**
 * Mapea el tipo de pregunta del backend al tipo del dominio
 */
function mapTipoPreguntaToQuestionType(tipoPregunta: BackendTipoPregunta): QuestionType {
  const nombre = tipoPregunta?.nombre?.toLowerCase() ?? '';
  if (nombre.includes('única') || nombre.includes('unica') || nombre.includes('single')) return 'single';
  if (nombre.includes('múltiple') || nombre.includes('multiple')) return 'multiple';
  if (nombre.includes('imagen') || nombre.includes('image')) return 'image';
  if (nombre.includes('falso') || nombre.includes('verdadero') || nombre.includes('true') || nombre.includes('false')) return 'true_false';
  if (nombre.includes('sí') || nombre.includes('no') || nombre.includes('yes') || nombre.includes('no')) return 'yes_no';
  return 'single';
}

/**
 * Mapea el tipo de pregunta del dominio al ID del tipo en el backend
 */
function mapQuestionTypeToTipoPreguntaId(type: QuestionType): number {
  const map: Record<QuestionType, number> = {
    single: 1, // Única respuesta
    multiple: 2, // Respuesta múltiple
    image: 3, // Selección de imagen
    true_false: 4, // Falso o Verdadero
    yes_no: 5, // Sí o No
  };
  return map[type] ?? 1;
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
      const mockEvaluations: BackendEvaluacion[] = [
        {
          id: 1,
          capacitacion: { id: 1 },
          titulo: 'Primeros Auxilios',
          descripcion: 'Evaluación sobre primeros auxilios básicos',
          tiempoLimiteMinutos: 30,
          minimoAprobacion: 70,
          intentosPermitidos: 2,
          mostrarResultados: true,
          mostrarRespuestasCorrectas: false,
          puntajeTotal: 100,
          orden: 0,
          activo: true,
          fechaCreacion: '2025-01-15T10:00:00Z',
          preguntas: [],
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

  async findOne(id: string): Promise<Evaluation> {
    try {
      const response = await api.get<BackendEvaluacion>(`${this.baseUrl}/${id}`);
      return mapBackendToDomain(response.data);
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
      const mockEvaluation: BackendEvaluacion = {
        id: Date.now(),
        capacitacion: { id: Number.parseInt(dto.courseId) },
        titulo: 'Evaluación',
        descripcion: dto.description,
        tiempoLimiteMinutos: dto.durationMinutes,
        minimoAprobacion: dto.minimumScore,
        intentosPermitidos: dto.attemptsAllowed,
        mostrarResultados: true,
        mostrarRespuestasCorrectas: false,
        puntajeTotal: 100,
        orden: 0,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        preguntas: dto.questions.map((q, idx) => {
          const question: BackendPregunta = {
            id: idx + 1,
            tipoPregunta: { id: mapQuestionTypeToTipoPreguntaId(q.type), nombre: q.type },
            enunciado: q.text,
            puntaje: 1,
            orden: q.order,
            requerida: true,
            opciones: q.options.map((opt, optIdx) => {
              const option: BackendOpcionRespuesta = {
                id: optIdx + 1,
                texto: opt.text,
                esCorrecta: opt.isCorrect,
                puntajeParcial: 0,
                orden: optIdx,
              };
              return option;
            }),
          };
          if (q.imageUrl) {
            question.imagenUrl = q.imageUrl;
          }
          return question;
        }),
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
      // Mapear DTO del dominio al formato del backend
      const backendDto: {
        titulo?: string;
        descripcion?: string;
        tiempoLimiteMinutos?: number;
        intentosPermitidos?: number;
        mostrarResultados?: boolean;
        mostrarRespuestasCorrectas?: boolean;
        puntajeTotal?: number;
        minimoAprobacion?: number;
        orden?: number;
        preguntas?: Array<{
          id?: number;
          tipoPreguntaId: number;
          enunciado: string;
          imagenUrl?: string;
          puntaje?: number;
          orden?: number;
          requerida?: boolean;
          opciones: Array<{
            id?: number;
            texto: string;
            esCorrecta: boolean;
            puntajeParcial?: number;
            orden?: number;
          }>;
        }>;
      } = {};

      if (dto.description !== undefined) {
        backendDto.descripcion = dto.description;
      }
      if (dto.durationMinutes !== undefined) {
        backendDto.tiempoLimiteMinutos = dto.durationMinutes;
      }
      if (dto.attemptsAllowed !== undefined) {
        backendDto.intentosPermitidos = dto.attemptsAllowed;
      }
      if (dto.minimumScore !== undefined) {
        backendDto.minimoAprobacion = dto.minimumScore;
      }
      if (dto.questions !== undefined) {
        backendDto.preguntas = dto.questions.map((q) => {
          // Tipo extendido para permitir id opcional en actualización
          type QuestionWithId = CreateQuestionDto & { id?: string | number };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const questionWithId = q as any as QuestionWithId;

          const pregunta: {
            id?: number;
            tipoPreguntaId: number;
            enunciado: string;
            imagenUrl?: string;
            puntaje?: number;
            orden?: number;
            requerida?: boolean;
            opciones: Array<{
              id?: number;
              texto: string;
              esCorrecta: boolean;
              puntajeParcial?: number;
              orden?: number;
            }>;
          } = {
            tipoPreguntaId: mapQuestionTypeToTipoPreguntaId(q.type),
            enunciado: q.text,
            puntaje: 1,
            orden: q.order,
            requerida: true,
            opciones: q.options.map((opt, idx) => {
              // Tipo extendido para permitir id opcional en actualización
              type OptionWithId = CreateQuestionOptionDto & { id?: string | number };
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const optionWithId = opt as any as OptionWithId;

              const opcion: {
                id?: number;
                texto: string;
                esCorrecta: boolean;
                puntajeParcial?: number;
                orden?: number;
              } = {
                texto: opt.text,
                esCorrecta: opt.isCorrect,
                puntajeParcial: 0,
                orden: idx,
              };

              // Si la opción tiene id, incluirlo para actualización
              if (optionWithId.id !== undefined) {
                opcion.id = typeof optionWithId.id === 'string' ? parseInt(optionWithId.id) : optionWithId.id;
              }

              return opcion;
            }),
          };

          // Si la pregunta tiene id, incluirla para actualización
          if (questionWithId.id !== undefined) {
            pregunta.id = typeof questionWithId.id === 'string' ? parseInt(questionWithId.id) : questionWithId.id;
          }

          if (q.imageUrl) {
            pregunta.imagenUrl = q.imageUrl;
          }

          return pregunta;
        });
      }

      const response = await api.patch<BackendEvaluacion>(`${this.baseUrl}/${id}`, backendDto);
      return mapBackendToDomain(response.data);
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


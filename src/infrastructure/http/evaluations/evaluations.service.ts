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
import { mapBackendCodeToFrontend } from '../../../shared/constants/training-types';

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
    tipoCapacitacion?: {
      id: number;
      codigo?: string;
      nombre?: string;
    };
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
  // Mapear tipo de capacitación si está disponible
  const courseType = backendData.capacitacion?.tipoCapacitacion?.codigo
    ? mapBackendCodeToFrontend(backendData.capacitacion.tipoCapacitacion.codigo)
    : undefined;

  const evaluation: Evaluation = {
    id: backendData.id?.toString() ?? '',
    courseId: backendData.capacitacion?.id?.toString() ?? '',
    courseName: '',
    courseType, // FAL-004: Tipo de capacitación para UI diferenciada
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
        score?: number;
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
      // Mapear el puntaje de la pregunta desde el backend
      if (q.puntaje !== undefined && q.puntaje !== null) {
        question.score = q.puntaje;
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

  async findAll(params: EvaluationListParams): Promise<PaginatedResponse<Evaluation>> {
    try {
      // Obtener el perfil del usuario actual desde localStorage
      const storedProfile = localStorage.getItem('auth_profile');
      if (!storedProfile) {
        throw new Error('Usuario no autenticado');
      }

      const profile = JSON.parse(storedProfile) as { id: number; personaId?: number; persona?: { id: number } };
      
      // Obtener el ID de la persona del usuario
      // Primero intentar desde personaId (nuevo campo del backend)
      // Luego desde persona.id (estructura antigua)
      // Finalmente desde el endpoint de perfil
      let personaId = profile.personaId || profile.persona?.id;
      
      if (!personaId) {
        // Intentar obtener el perfil completo desde el backend
        try {
          const profileResponse = await api.get<{ id: number; personaId?: number; persona?: { id: number } }>('/auth/profile');
          personaId = profileResponse.data.personaId || profileResponse.data.persona?.id;
        } catch (error) {
          console.error('Error al obtener perfil desde backend:', error);
          throw new Error('No se pudo obtener el perfil del usuario desde el servidor');
        }
      }

      if (!personaId) {
        throw new Error('No se pudo obtener el ID de la persona del usuario. Por favor, inicia sesión nuevamente.');
      }

      // Obtener las inscripciones del usuario
      const pagination = {
        page: params.page ?? 1,
        limit: params.limit ?? 100, // Obtener todas las inscripciones para filtrar después
      };

      const inscripcionesResponse = await api.post<{
        data: Array<{
          id: number;
          capacitacion: {
            id: number;
            titulo: string;
            evaluaciones?: Array<{ id: number }>;
          };
          intentosEvaluacion?: Array<{
            id: number;
            evaluacion: { id: number };
            puntajeObtenido: number;
            porcentaje: number;
            aprobado: boolean;
            fechaInicio: string;
            fechaFinalizacion?: string;
          }>;
        }>;
        total: number;
      }>(`/inscripciones/estudiante/${personaId}`, pagination);

      // Obtener todas las evaluaciones de las capacitaciones inscritas
      const evaluacionesMap = new Map<string, Evaluation>();
      
      // Primero, obtener todas las evaluaciones únicas
      const evaluacionesIds = new Set<number>();
      for (const inscripcion of inscripcionesResponse.data.data) {
        if (inscripcion.capacitacion.evaluaciones && inscripcion.capacitacion.evaluaciones.length > 0) {
          inscripcion.capacitacion.evaluaciones.forEach((evaluacionRef) => {
            evaluacionesIds.add(evaluacionRef.id);
          });
        }
      }

      // Obtener todas las evaluaciones en paralelo
      const evaluacionesPromises = Array.from(evaluacionesIds).map((id) =>
        this.findOne(id.toString()).catch((error) => {
          console.error(`Error al obtener evaluación ${id}:`, error);
          return null;
        })
      );

      const evaluacionesCompletas = await Promise.all(evaluacionesPromises);
      
      // Crear un mapa de evaluaciones por ID
      evaluacionesCompletas.forEach((evaluation) => {
        if (evaluation) {
          evaluacionesMap.set(evaluation.id, evaluation);
        }
      });

      // Ahora actualizar con información de intentos y nombres de curso
      for (const inscripcion of inscripcionesResponse.data.data) {
        if (inscripcion.capacitacion.evaluaciones && inscripcion.capacitacion.evaluaciones.length > 0) {
          for (const evaluacionRef of inscripcion.capacitacion.evaluaciones) {
            const evalId = evaluacionRef.id.toString();
            const evaluation = evaluacionesMap.get(evalId);
            
            if (evaluation) {
              // Actualizar información del curso
              evaluation.courseId = inscripcion.capacitacion.id.toString();
              evaluation.courseName = inscripcion.capacitacion.titulo;
              
              // Obtener intentos de esta evaluación para esta inscripción
              const intentos = inscripcion.intentosEvaluacion?.filter(
                (intento) => intento.evaluacion?.id === evaluacionRef.id
              ) || [];
              
              if (intentos.length > 0) {
                // Ordenar por fecha para obtener el último intento
                const intentosOrdenados = intentos.sort((a, b) => {
                  const fechaA = new Date(a.fechaFinalizacion || a.fechaInicio).getTime();
                  const fechaB = new Date(b.fechaFinalizacion || b.fechaInicio).getTime();
                  return fechaB - fechaA;
                });
                
                const ultimoIntento = intentosOrdenados[0];
                evaluation.status = ultimoIntento.aprobado ? 'passed' : 'failed';
                evaluation.lastAttempt = {
                  date: ultimoIntento.fechaFinalizacion || ultimoIntento.fechaInicio,
                  score: ultimoIntento.porcentaje || ultimoIntento.puntajeObtenido,
                  passed: ultimoIntento.aprobado ?? false,
                };
                evaluation.attemptsRemaining = Math.max(0, evaluation.attemptsAllowed - intentos.length);
              } else {
                evaluation.status = 'pending';
                evaluation.attemptsRemaining = evaluation.attemptsAllowed;
              }
            }
          }
        }
      }

      // Convertir el Map a array y aplicar paginación
      let evaluationsArray = Array.from(evaluacionesMap.values());

      // Aplicar filtros del frontend
      if (params.filters?.search) {
        const search = params.filters.search.toLowerCase();
        evaluationsArray = evaluationsArray.filter(
          (e) =>
            e.courseName.toLowerCase().includes(search) ||
            e.description.toLowerCase().includes(search)
        );
      }

      if (params.filters?.courseId) {
        evaluationsArray = evaluationsArray.filter(
          (e) => e.courseId === params.filters.courseId
        );
      }

      if (params.filters?.status) {
        evaluationsArray = evaluationsArray.filter(
          (e) => e.status === params.filters.status
        );
      }

      // Aplicar paginación
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginated = evaluationsArray.slice(start, end);

      return {
        data: paginated,
        total: evaluationsArray.length,
        page,
        limit,
        totalPages: Math.ceil(evaluationsArray.length / limit),
      };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Error completo en findAll:', error);
      console.error('Error response:', axiosError.response);
      console.error('Error message:', axiosError.message);
      
      // Proporcionar un mensaje más descriptivo
      let errorMessage = 'Error al obtener la lista de evaluaciones';
      
      if (axiosError.response) {
        errorMessage = axiosError.response.data?.message || 
          `Error del servidor: ${axiosError.response.status} ${axiosError.response.statusText}`;
      } else if (axiosError.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
      } else {
        errorMessage = axiosError.message || errorMessage;
      }
      
      throw new Error(errorMessage);
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
      // Obtener la capacitación para encontrar su evaluación asociada
      const capacitacionResponse = await api.get<{
        id: number;
        titulo: string;
        evaluaciones?: Array<{ id: number }>;
      }>(`/capacitaciones/${courseId}`);

      if (
        !capacitacionResponse.data.evaluaciones ||
        capacitacionResponse.data.evaluaciones.length === 0
      ) {
        return null;
      }

      // Obtener la primera evaluación asociada
      const evaluacionId = capacitacionResponse.data.evaluaciones[0].id.toString();
      const evaluation = await this.findOne(evaluacionId);
      evaluation.courseName = capacitacionResponse.data.titulo;

      return evaluation;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      // Si la capacitación no tiene evaluación, retornar null en lugar de error
      if (axiosError.response?.status === 404) {
        return null;
      }
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

          // Validar y convertir puntaje
          let puntajeNum = 1; // Valor por defecto
          if (q.score !== undefined && q.score !== null) {
            const parsed = typeof q.score === 'string' ? parseFloat(q.score) : q.score;
            if (!isNaN(parsed) && parsed >= 0) {
              puntajeNum = parsed;
            }
          }

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
            enunciado: q.text || '',
            puntaje: puntajeNum,
            orden: q.order ?? 0,
            requerida: true,
            opciones: q.options.map((opt, idx) => {
              // Tipo extendido para permitir id opcional en actualización
              type OptionWithId = CreateQuestionOptionDto & { id?: string | number };
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const optionWithId = opt as any as OptionWithId;

              // Asegurar que esCorrecta sea un booleano
              let esCorrectaBool = false;
              if (typeof opt.isCorrect === 'boolean') {
                esCorrectaBool = opt.isCorrect;
              } else if (typeof opt.isCorrect === 'string') {
                esCorrectaBool = opt.isCorrect === 'true' || opt.isCorrect === '1';
              } else if (opt.isCorrect !== undefined && opt.isCorrect !== null) {
                esCorrectaBool = Boolean(opt.isCorrect);
              }

              const opcion: {
                id?: number;
                texto: string;
                esCorrecta: boolean;
                puntajeParcial?: number;
                orden?: number;
              } = {
                texto: opt.text || '',
                esCorrecta: esCorrectaBool,
                puntajeParcial: 0,
                orden: idx,
              };

              // Si la opción tiene id válido, incluirlo para actualización
              if (optionWithId.id !== undefined) {
                const optionIdNum = typeof optionWithId.id === 'string' ? parseInt(optionWithId.id) : optionWithId.id;
                if (!isNaN(optionIdNum) && optionIdNum > 0) {
                  opcion.id = optionIdNum;
                }
              }

              return opcion;
            }),
          };

          // Si la pregunta tiene id válido, incluirla para actualización
          if (questionWithId.id !== undefined) {
            const questionIdNum = typeof questionWithId.id === 'string' ? parseInt(questionWithId.id) : questionWithId.id;
            if (!isNaN(questionIdNum) && questionIdNum > 0) {
              pregunta.id = questionIdNum;
            }
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
      await api.delete(`${this.baseUrl}/${id}`);
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


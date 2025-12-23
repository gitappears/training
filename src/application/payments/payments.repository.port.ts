/**
 * Puerto del repositorio de pagos
 * Define la interfaz que debe implementar el adaptador de infraestructura
 */

export interface CreatePaymentDto {
  estudianteId: number;
  fechaPago?: string; // ISO date string (opcional, se usa fecha actual si no se proporciona)
  monto: number;
  metodoPago: string;
  numeroComprobante?: string;
  observaciones?: string;
}

export interface Payment {
  id: number;
  estudianteId: number;
  fechaPago: Date;
  monto: number;
  metodoPago: string;
  numeroComprobante?: string;
  observaciones?: string;
  registradoPorId: number;
  fechaCreacion: Date;
}

export interface IPaymentsRepository {
  /**
   * Registra un pago manual para un conductor externo
   */
  createPayment(dto: CreatePaymentDto): Promise<Payment>;

  /**
   * Habilita un conductor externo después de que se haya registrado el pago
   * @param studentId ID del estudiante (conductor externo) a habilitar
   */
  enableDriver(studentId: number): Promise<{ message: string }>;
}


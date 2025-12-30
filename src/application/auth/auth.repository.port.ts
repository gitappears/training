export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  numeroDocumento: string;
  tipoDocumento?: string | undefined;
  nombres: string;
  apellidos?: string | undefined;
  email?: string | undefined;
  telefono?: string | undefined;
  fechaNacimiento?: string | undefined;
  genero?: string | undefined;
  direccion?: string | undefined;
  razonSocial?: string | undefined;
  fotoUrl?: string | undefined;
  username: string;
  password: string;
  tipoRegistro: 'ALUMNO' | 'INSTRUCTOR' | 'CLIENTE';
  codigoEstudiante?: string | undefined;
  especialidad?: string | undefined;
  biografia?: string | undefined;
  habilitado?: boolean | undefined;
  aceptaTerminos?: boolean | undefined;
  aceptaPoliticaDatos?: boolean | undefined;
  empresaId?: number | undefined;
}

export interface RegisterResponse {
  message: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  username: string;
  rol: string;
  personaId?: number; // Agregar personaId que viene del backend
  persona: {
    id?: number; // También puede venir dentro de persona
    numeroDocumento: string;
    nombres: string;
    apellidos?: string;
    email?: string;
    fotoUrl?: string;
    telefono?: string;
    direccion?: string;
    fechaNacimiento?: string;
    genero?: string;
    biografia?: string;
    empresaId?: number; // ID de la empresa a la que pertenece
    empresa?: {
      id: number;
      razonSocial: string;
      numeroDocumento: string;
    };
  };
}

export interface CreateAdminDto {
  numeroDocumento: string;
  tipoDocumento?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  genero?: string;
  direccion?: string;
  username: string;
  password: string;
  habilitado?: boolean;
  aceptaTerminos?: boolean;
  aceptaPoliticaDatos?: boolean;
}

export interface CreateAdminResponse {
  id: number;
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: string;
}

export interface IAuthRepository {
  /**
   * Iniciar sesión en el sistema
   */
  login(dto: LoginDto): Promise<TokenResponse>;

  /**
   * Registrar un nuevo usuario
   */
  register(dto: RegisterDto): Promise<RegisterResponse>;

  /**
   * Crear un nuevo administrador (solo para administradores)
   */
  createAdmin(dto: CreateAdminDto): Promise<CreateAdminResponse>;

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile(): Promise<UserProfile>;

  /**
   * Refrescar token de acceso
   */
  refreshToken(): Promise<TokenResponse>;

  updateProfile(data: Partial<RegisterDto>): Promise<void>;
}

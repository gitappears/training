// Puerto (interface) para el repositorio de autenticación
// Define el contrato que debe cumplir cualquier implementación

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
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
  tipoRegistro: 'ALUMNO' | 'INSTRUCTOR';
  codigoEstudiante?: string;
  especialidad?: string;
  biografia?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  nombres: string;
  apellidos: string;
  rol?: string;
}

export interface IAuthRepository {
  /**
   * Iniciar sesión
   */
  login(dto: LoginDto): Promise<TokenResponse>;

  /**
   * Registrar un nuevo usuario
   */
  register(dto: RegisterDto): Promise<TokenResponse>;

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile(): Promise<UserProfile>;

  /**
   * Refrescar token de acceso
   */
  refreshToken(): Promise<TokenResponse>;
}


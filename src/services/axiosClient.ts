import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL =
  "https://api.tecnologiasadministrativas.com/api";

/*
|--------------------------------------------------------------------------
| TOKEN EN MEMORIA
|--------------------------------------------------------------------------
|
| Conservamos el token también en memoria para no consultar localStorage
| en cada petición una vez que ya fue recuperado.
|
*/

let AUTH_TOKEN: string | null = null;

type UnauthorizedHandler = () => void;

let onUnauthorizedCb: UnauthorizedHandler | null =
  null;

/*
|--------------------------------------------------------------------------
| TOKEN
|--------------------------------------------------------------------------
*/

/**
 * Busca el token almacenado.
 *
 * "token" es la clave oficial actual.
 * Las demás se conservan únicamente por compatibilidad con sesiones
 * anteriores que pudieran existir en el navegador.
 */
function readStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("TOKEN") ||
    localStorage.getItem("AUTH_TOKEN") ||
    localStorage.getItem("auth_token")
  );
}

/**
 * Obtiene el token disponible para las peticiones.
 */
function getAuthToken(): string | null {
  if (AUTH_TOKEN) {
    return AUTH_TOKEN;
  }

  const token = readStoredToken();

  if (!token) {
    return null;
  }

  AUTH_TOKEN = token;

  /*
   * Normalizamos progresivamente cualquier sesión antigua para que
   * toda la aplicación utilice la clave oficial "token".
   */
  if (
    typeof window !== "undefined" &&
    !localStorage.getItem("token")
  ) {
    localStorage.setItem(
      "token",
      token,
    );
  }

  return token;
}

/**
 * Guarda o elimina el token de autenticación.
 *
 * Esta función es utilizada por authSession.login(),
 * authSession.register(), etc.
 */
export function setAuthToken(
  token: string | null,
): void {
  const normalizedToken =
    typeof token === "string"
      ? token.trim()
      : "";

  AUTH_TOKEN =
    normalizedToken !== ""
      ? normalizedToken
      : null;

  if (typeof window === "undefined") {
    return;
  }

  if (AUTH_TOKEN) {
    /*
     * Clave oficial de autenticación.
     */
    localStorage.setItem(
      "token",
      AUTH_TOKEN,
    );

    /*
     * Eliminamos posibles claves históricas para evitar
     * tener diferentes tokens almacenados simultáneamente.
     */
    localStorage.removeItem("TOKEN");
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("auth_token");

    return;
  }

  /*
   * Si se cierra sesión, eliminamos todas las variantes.
   */
  localStorage.removeItem("token");
  localStorage.removeItem("TOKEN");
  localStorage.removeItem("AUTH_TOKEN");
  localStorage.removeItem("auth_token");
}

/**
 * Permite que AuthProvider u otro controlador global
 * defina qué hacer cuando la sesión deja de ser válida.
 */
export function onUnauthorized(
  handler: UnauthorizedHandler,
): void {
  onUnauthorizedCb = handler;
}

/*
|--------------------------------------------------------------------------
| AXIOS CLIENT
|--------------------------------------------------------------------------
*/

const axiosClient: AxiosInstance =
  axios.create({
    baseURL: BASE_URL,

    timeout: 60000,

    /*
     * La aplicación utiliza Bearer Token mediante Sanctum,
     * no autenticación basada en cookies.
     */
    withCredentials: false,

    headers: {
      Accept: "application/json",
    },
  });

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
|
| Antes de cada petición:
|
| 1. Recuperamos el token.
| 2. Agregamos Authorization: Bearer ...
| 3. Permitimos que el navegador construya correctamente FormData.
|
*/

axiosClient.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig,
  ) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    } else {
      /*
       * Evita conservar accidentalmente un Authorization
       * anterior en alguna configuración reutilizada.
       */
      delete config.headers.Authorization;
    }

    /*
     * Cuando enviamos FormData NO debemos establecer
     * Content-Type manualmente.
     *
     * El navegador genera automáticamente:
     *
     * multipart/form-data; boundary=...
     */
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData
    ) {
      delete config.headers[
        "Content-Type"
      ];

      delete config.headers[
        "content-type"
      ];
    }

    return config;
  },

  (error) =>
    Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
|
| Una respuesta 401 o 419 significa que Laravel ya no reconoce
| la sesión actual.
|
| Es importante eliminar también auth_user para evitar una
| "sesión fantasma":
|
| auth_user existe
| token no existe
| interfaz parece autenticada
| todas las peticiones devuelven 401
|
*/

axiosClient.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    const status =
      error.response?.status;

    if (
      status === 401 ||
      status === 419
    ) {
      AUTH_TOKEN = null;

      if (
        typeof window !== "undefined"
      ) {
        /*
         * Tokens actuales e históricos.
         */
        localStorage.removeItem(
          "token",
        );

        localStorage.removeItem(
          "TOKEN",
        );

        localStorage.removeItem(
          "AUTH_TOKEN",
        );

        localStorage.removeItem(
          "auth_token",
        );

        /*
         * También eliminamos el usuario almacenado.
         *
         * Si Laravel rechazó el token, no debemos seguir
         * mostrando al usuario como autenticado.
         */
        localStorage.removeItem(
          "auth_user",
        );
      }

      /*
       * El controlador global puede redirigir al login,
       * limpiar estado React, etc.
       */
      if (onUnauthorizedCb) {
        onUnauthorizedCb();
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
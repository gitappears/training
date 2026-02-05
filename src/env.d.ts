declare namespace NodeJS {
  interface ProcessEnv {
    /** Entorno: 'prod' | 'dev' */
    STAGE?: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

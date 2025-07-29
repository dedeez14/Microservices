/// <reference types="vite/client" />

declare module 'react/jsx-runtime' {
  export * from 'react/jsx-runtime'
}

declare const __dirname: string

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USER_FRONTEND_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

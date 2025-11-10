declare interface ImportMetaEnv {
  readonly NG_APP_API_BASE_URL?: string;
  readonly [key: string]: string | undefined;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

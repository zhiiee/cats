declare const __wxConfig

declare const EnvConfig = {
  env: string
}

// Uni Types 扩展
declare namespace UniApp {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface UniExpand extends Uni {
  }
}

declare const uni: UniApp.UniExpand

// Next.js 16 does not fully populate its package.json exports map yet.
// These declarations bridge the gap for moduleResolution: "bundler".
declare module 'next/link' {
  export { default } from 'next/dist/client/link';
}
declare module 'next/image' {
  export { default } from 'next/dist/client/image';
}
declare module 'next/navigation' {
  export * from 'next/dist/client/components/navigation';
}
declare module 'next/headers' {
  export * from 'next/dist/client/components/headers';
}
declare module 'next/server' {
  export * from 'next/dist/server/web/exports/index';
}

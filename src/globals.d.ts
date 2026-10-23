/// <reference types="vite/types/importMeta.d.ts" />
declare global {
    interface Window {
        navgo: import('navgo').Router
    }
}
export {}

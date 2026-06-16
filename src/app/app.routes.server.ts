import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'home', renderMode: RenderMode.Client },
  { path: 'map', renderMode: RenderMode.Client },
  { path: 'projects', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];

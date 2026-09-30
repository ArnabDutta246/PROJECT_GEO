import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

/** Production value matches `baseHref` in angular.json. Dev stays at `/`. */
const deployBase = normalizeDeployBase(environment.baseHref);

const staticAssetPattern =
  /\.(?:js|mjs|css|map|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|eot|json|geojson|txt|webmanifest)$/i;

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * IIS rewrites non-file requests to server/server.mjs, so Node otherwise sees
 * "/". URL Rewrite keeps the browser path in x-original-url. Angular's route
 * table includes the deploy base (/GEOWEB), so that prefix must stay on the URL.
 */
app.use((req, _res, next) => {
  const header = req.headers['x-original-url'];
  const raw = (Array.isArray(header) ? header[0] : header) || req.url;
  const normalized = toAppPath(raw);
  if (normalized !== req.url) {
    req.url = normalized;
  }
  if (normalized !== req.originalUrl) {
    (req as { originalUrl: string }).originalUrl = normalized;
  }
  next();
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser.
 * Mount the deploy base as well: script URLs are /GEOWEB/*.js while files sit at browser/*.js.
 */
const staticOptions = {
  maxAge: '1y',
  index: false,
  redirect: false,
};
if (deployBase) {
  app.use(deployBase, express.static(browserDistFolder, staticOptions));
}
app.use(express.static(browserDistFolder, staticOptions));

/**
 * Handle all other requests by rendering the Angular application.
 * Missing bundles must not fall through to the login HTML shell.
 */
app.use((req, res, next) => {
  if (staticAssetPattern.test(req.path)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }

  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

function normalizeDeployBase(baseHref: string): string {
  if (!baseHref || baseHref === '/') {
    return '';
  }
  const withSlash = baseHref.startsWith('/') ? baseHref : `/${baseHref}`;
  return withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
}

function toAppPath(raw: string): string {
  let path = raw;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    const parsed = new URL(path);
    path = `${parsed.pathname}${parsed.search}`;
  }
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const queryIndex = path.indexOf('?');
  const pathname = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const search = queryIndex >= 0 ? path.slice(queryIndex) : '';

  if (!deployBase || pathname === deployBase || pathname.startsWith(`${deployBase}/`)) {
    return `${pathname}${search}`;
  }

  const suffix = pathname === '/' ? '' : pathname;
  return `${deployBase}${suffix}${search}`;
}

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

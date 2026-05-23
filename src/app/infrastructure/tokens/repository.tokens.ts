import { InjectionToken } from '@angular/core';
import { AuthRepository } from '@domain/repositories/auth.repository';
import { SessionRepository } from '@domain/repositories/session.repository';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { ProjectRepository } from '@domain/repositories/project.repository';
import { GeoRepository } from '@domain/repositories/geo.repository';
import { AnalyticsRepository } from '@domain/repositories/analytics.repository';

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AUTH_REPOSITORY');
export const SESSION_REPOSITORY = new InjectionToken<SessionRepository>('SESSION_REPOSITORY');
export const APPLICABLE_AREA_REPOSITORY = new InjectionToken<ApplicableAreaRepository>(
  'APPLICABLE_AREA_REPOSITORY'
);
export const PROJECT_REPOSITORY = new InjectionToken<ProjectRepository>('PROJECT_REPOSITORY');
export const GEO_REPOSITORY = new InjectionToken<GeoRepository>('GEO_REPOSITORY');
export const ANALYTICS_REPOSITORY = new InjectionToken<AnalyticsRepository>(
  'ANALYTICS_REPOSITORY'
);
export const GEO_BOUNDARY_REPOSITORY = new InjectionToken<import('@domain/repositories/geo-boundary.repository').GeoBoundaryRepository>(
  'GEO_BOUNDARY_REPOSITORY'
);
export const MAP_ADAPTER = new InjectionToken<import('@infrastructure/geo/map-adapter').MapAdapter>(
  'MAP_ADAPTER'
);

import { Provider } from '@angular/core';
import { environment } from '@env/environment';
import { AuthRepository } from '@domain/repositories/auth.repository';
import { SessionRepository } from '@domain/repositories/session.repository';
import { ApplicableAreaRepository } from '@domain/repositories/applicable-area.repository';
import { ProjectRepository } from '@domain/repositories/project.repository';
import { AuthApiRepository } from '@infrastructure/http/auth-api.repository';
import { JurisdictionApiRepository } from '@infrastructure/http/jurisdiction-api.repository';
import { LocalAuthRepository } from '@infrastructure/persistence/local-auth.repository';
import { LocalJurisdictionRepository } from '@infrastructure/persistence/local-jurisdiction.repository';
import { LocalProjectRepository } from '@infrastructure/persistence/local-project.repository';
import { SessionStorageRepository } from '@infrastructure/persistence/session-storage.repository';
import {
  APPLICABLE_AREA_REPOSITORY,
  AUTH_REPOSITORY,
  ANALYTICS_REPOSITORY,
  GEO_BOUNDARY_REPOSITORY,
  MAP_ADAPTER,
  PROJECT_REPOSITORY,
  SESSION_REPOSITORY,
} from '@infrastructure/tokens/repository.tokens';
import { GeoJsonFileRepository } from '@infrastructure/geo/geo-json-file.repository';
import { LeafletMapAdapter } from '@infrastructure/geo/leaflet-map.adapter';
import { MapAdapter } from '@infrastructure/geo/map-adapter';
import { GeoBoundaryRepository } from '@domain/repositories/geo-boundary.repository';
import { AnalyticsRepository } from '@domain/repositories/analytics.repository';
import { CensusFallbackAnalyticsRepository } from '@infrastructure/analytics/census-fallback-analytics.repository';

export const infrastructureProviders: Provider[] = [
  AuthApiRepository,
  LocalAuthRepository,
  JurisdictionApiRepository,
  LocalJurisdictionRepository,
  LocalProjectRepository,
  SessionStorageRepository,
  {
    provide: AUTH_REPOSITORY,
    deps: [AuthApiRepository, LocalAuthRepository],
    useFactory: (apiRepo: AuthApiRepository, localRepo: LocalAuthRepository): AuthRepository =>
      environment.useLocalData ? localRepo : apiRepo,
  },
  {
    provide: APPLICABLE_AREA_REPOSITORY,
    deps: [JurisdictionApiRepository, LocalJurisdictionRepository],
    useFactory: (
      apiRepo: JurisdictionApiRepository,
      localRepo: LocalJurisdictionRepository
    ): ApplicableAreaRepository => (environment.useLocalData ? localRepo : apiRepo),
  },
  {
    provide: PROJECT_REPOSITORY,
    useExisting: LocalProjectRepository,
  },
  {
    provide: SESSION_REPOSITORY,
    useExisting: SessionStorageRepository,
  },
  {
    provide: SessionRepository,
    useExisting: SessionStorageRepository,
  },
  {
    provide: AuthRepository,
    useExisting: AUTH_REPOSITORY,
  },
  {
    provide: ApplicableAreaRepository,
    useExisting: APPLICABLE_AREA_REPOSITORY,
  },
  {
    provide: ProjectRepository,
    useExisting: PROJECT_REPOSITORY,
  },
  {
    provide: GEO_BOUNDARY_REPOSITORY,
    useExisting: GeoJsonFileRepository,
  },
  {
    provide: GeoBoundaryRepository,
    useExisting: GeoJsonFileRepository,
  },
  {
    provide: MAP_ADAPTER,
    useClass: LeafletMapAdapter,
  },
  {
    provide: MapAdapter,
    useExisting: MAP_ADAPTER,
  },
  {
    provide: ANALYTICS_REPOSITORY,
    useExisting: CensusFallbackAnalyticsRepository,
  },
  {
    provide: AnalyticsRepository,
    useExisting: ANALYTICS_REPOSITORY,
  },
  CensusFallbackAnalyticsRepository,
  GeoJsonFileRepository,
];

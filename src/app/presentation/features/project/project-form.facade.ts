import { Inject, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SCHEME_TYPE_LABELS } from '@domain/catalog/scheme-type.catalog';
import { PROJECT_TYPE_CATALOG } from '@domain/catalog/project-type.catalog';
import { GetApplicableStatesUseCase } from '@application/geo/get-applicable-states.use-case';
import { GetApplicableDistrictsUseCase } from '@application/geo/get-applicable-districts.use-case';
import { GetApplicableBlocksUseCase } from '@application/geo/get-applicable-blocks.use-case';
import { GetCurrentUserUseCase } from '@application/auth/get-current-user.use-case';
import { SubmitProjectBasicInfoUseCase } from '@application/projects/submit-project-basic-info.use-case';
import {
  parseProjectCreateContext,
  PROJECT_CREATE_CONTEXT_KEY,
} from '@domain/value-objects/project-create-context.vo';
import { ApplicationError } from '@application/errors/application.error';
import { IProjectData } from './models/legacy-project-data';
import {
  createEmptyFormData,
  FileWithPreview,
  FUND_TYPE_OPTIONS,
  PROJECT_FORM_STEPS,
  ProjectMapComponentRef,
  ProjectWizardFormData,
} from './models/project-wizard.view-model';

@Injectable({ providedIn: 'root' })
export class ProjectFormFacade {
  readonly currentStep = signal(1);
  readonly totalSteps = signal(5);
  readonly isEditMode = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly formData = signal<ProjectWizardFormData>(createEmptyFormData());

  readonly stateOptions = signal<Array<{ id: number; label: string }>>([]);
  readonly districtOptions = signal<Array<{ id: number; label: string }>>([]);
  readonly blockOptions = signal<Array<{ id: number; label: string }>>([]);

  readonly aoiFiles = signal<FileWithPreview[]>([]);
  readonly beneficiaryDocuments = signal<FileWithPreview[]>([]);
  readonly planEstimationFiles = signal<FileWithPreview[]>([]);
  readonly tenderDetailFiles = signal<FileWithPreview[]>([]);
  readonly otherDocuments = signal<FileWithPreview[]>([]);
  readonly uploadedMedia = signal<FileWithPreview[]>([]);

  readonly projectNames = PROJECT_TYPE_CATALOG.map((item) => item.label);
  readonly schemeTypes = [...SCHEME_TYPE_LABELS];
  readonly fundTypeOptions = FUND_TYPE_OPTIONS;
  readonly formSteps = PROJECT_FORM_STEPS;

  private readonly originalActivityName = signal('');
  private readonly userProfile = signal<{ name: string; email: string; userId: string } | null>(null);
  private mapComponentRef?: ProjectMapComponentRef;

  private readonly getStates = inject(GetApplicableStatesUseCase);
  private readonly getDistricts = inject(GetApplicableDistrictsUseCase);
  private readonly getBlocks = inject(GetApplicableBlocksUseCase);
  private readonly getCurrentUser = inject(GetCurrentUserUseCase);
  private readonly submitBasicInfo = inject(SubmitProjectBasicInfoUseCase);
  private readonly router = inject(Router);

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  async initialize(mapComponent?: ProjectMapComponentRef): Promise<void> {
    if (mapComponent) {
      this.mapComponentRef = mapComponent;
    }
    this.initializeUserDefaults();
    await this.loadJurisdictionOptions();
    this.loadProjectData(this.mapComponentRef);
    this.loadCreateContext(this.mapComponentRef);
  }

  setMapComponent(mapComponent?: ProjectMapComponentRef): void {
    this.mapComponentRef = mapComponent;
  }

  patchFormData(partial: Partial<ProjectWizardFormData>): void {
    this.formData.update((data) => ({ ...data, ...partial }));
  }

  resetForm(): void {
    [...this.getAllDocuments(), ...this.uploadedMedia(), ...this.aoiFiles()].forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    this.isEditMode.set(false);
    this.originalActivityName.set('');
    this.formData.set(createEmptyFormData(this.userProfile() ?? undefined));
    this.beneficiaryDocuments.set([]);
    this.planEstimationFiles.set([]);
    this.tenderDetailFiles.set([]);
    this.otherDocuments.set([]);
    this.uploadedMedia.set([]);
    this.aoiFiles.set([]);
    this.submitError.set(null);
  }

  nextStep(mapComponent?: ProjectMapComponentRef): void {
    const map = mapComponent ?? this.mapComponentRef;
    if (this.currentStep() === 1) {
      const error = this.validateStep1();
      if (error) {
        alert(error);
        return;
      }
    }
    if (this.currentStep() === 2) {
      const error = this.validateStep2();
      if (error) {
        alert(error);
        return;
      }
    }
    if (this.currentStep() === 3) {
      const error = this.validateStep3();
      if (error) {
        alert(error);
        return;
      }
    }
    if (this.currentStep() < this.totalSteps()) {
      this.currentStep.update((step) => step + 1);
      this.onStepChange(map);
    }
  }

  previousStep(mapComponent?: ProjectMapComponentRef): void {
    const map = mapComponent ?? this.mapComponentRef;
    if (this.currentStep() > 1) {
      this.currentStep.update((step) => step - 1);
      this.onStepChange(map);
    }
  }

  goToStep(step: number, mapComponent?: ProjectMapComponentRef): void {
    const map = mapComponent ?? this.mapComponentRef;
    if (step >= 1 && step <= this.totalSteps()) {
      this.currentStep.set(step);
      this.onStepChange(map);
    }
  }

  goForReview(mapComponent?: ProjectMapComponentRef): void {
    const map = mapComponent ?? this.mapComponentRef;
    if (this.currentStep() === 4) {
      this.currentStep.set(5);
      this.onStepChange(map);
    }
  }

  submitForm(): void {
    if (this.currentStep() !== this.totalSteps()) {
      return;
    }

    const step1Error = this.validateStep1();
    if (step1Error) {
      alert(step1Error);
      this.currentStep.set(1);
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const data = this.formData();
    const projectName = this.getFinalProjectName();
    const schemeType = this.getFinalSchemeType();
    const activityName = data.activityName.trim() ? data.activityName : projectName;

    this.formData.update((current) => ({
      ...current,
      projectName,
      schemeType,
      activityName,
    }));

    const updated = this.formData();

    void firstValueFrom(
      this.submitBasicInfo.execute({
        numericId: updated.numericId,
        selectedProjectName: updated.selectedProjectName,
        newProjectName: updated.newProjectName,
        selectedSchemeType: updated.selectedSchemeType,
        newSchemeType: updated.newSchemeType,
        activityName: updated.activityName,
        locationName: updated.locationName,
        nearestLandmark: updated.nearestLandmark,
        latitude: updated.latitude,
        longitude: updated.longitude,
        stateId: updated.selectedStateId!,
        districtId: updated.selectedDistrictId!,
        blockId: updated.selectedBlockId!,
        assignedToUserId: updated.assignedToUserId,
        contactName: updated.contactName,
        contactNumber: updated.contactNumber,
        contactEmail: updated.contactEmail,
        plannedStartDate: updated.plannedStartDate,
        plannedEndDate: updated.plannedEndDate,
        actualStartDate: updated.actualStartDate || undefined,
        actualEndDate: updated.actualEndDate || undefined,
      })
    )
      .then(() => {
        alert('Data submitted successfully.');
        void this.router.navigate(['/home']);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof ApplicationError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to submit project.';
        this.submitError.set(message);
        alert(message);
      })
      .finally(() => {
        this.submitting.set(false);
      });
  }

  async onWizardStateChange(
    stateId: number | null,
    preselectDistrictId: number | null = null,
    preselectBlockId: number | null = null
  ): Promise<void> {
    this.formData.update((data) => ({
      ...data,
      selectedStateId: stateId,
      selectedDistrictId: null,
      selectedBlockId: null,
    }));
    this.districtOptions.set([]);
    this.blockOptions.set([]);

    if (!stateId) {
      return;
    }

    try {
      const districts = await firstValueFrom(this.getDistricts.execute(stateId, 0));
      this.districtOptions.set(districts.map((item) => ({ id: item.id, label: item.name })));
      if (preselectDistrictId) {
        this.formData.update((data) => ({ ...data, selectedDistrictId: preselectDistrictId }));
        await this.onWizardDistrictChange(preselectDistrictId, preselectBlockId);
      }
    } catch (error) {
      console.error('Failed to load districts', error);
    }
  }

  async onWizardDistrictChange(
    districtId: number | null,
    preselectBlockId: number | null = null
  ): Promise<void> {
    this.formData.update((data) => ({
      ...data,
      selectedDistrictId: districtId,
      selectedBlockId: null,
    }));
    this.blockOptions.set([]);

    const stateId = this.formData().selectedStateId;
    if (!stateId || !districtId) {
      return;
    }

    try {
      const blocks = await firstValueFrom(this.getBlocks.execute(stateId, districtId, 0));
      this.blockOptions.set(blocks.map((item) => ({ id: item.id, label: item.name })));
      if (preselectBlockId) {
        this.formData.update((data) => ({ ...data, selectedBlockId: preselectBlockId }));
      }
    } catch (error) {
      console.error('Failed to load blocks', error);
    }
  }

  onWizardBlockChange(blockId: number | null): void {
    this.formData.update((data) => ({ ...data, selectedBlockId: blockId }));
  }

  getFinalProjectName(): string {
    const data = this.formData();
    if (data.selectedProjectName === 'MISC. (Create new)' && data.newProjectName) {
      return data.newProjectName;
    }
    return data.selectedProjectName || '';
  }

  getFinalSchemeType(): string {
    const data = this.formData();
    if (data.selectedSchemeType === 'Misc. (Create new)' && data.newSchemeType) {
      return data.newSchemeType;
    }
    return data.selectedSchemeType || '';
  }

  onAoiFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    const newFiles = files.map((file) => this.createFileWithPreview(file, 'aoi'));
    this.aoiFiles.update((current) => [...current, ...newFiles]);
    const allAoi = [...this.aoiFiles()];
    if (allAoi.length > 0) {
      this.formData.update((data) => ({ ...data, aoiFile: allAoi[0].file }));
    }
  }

  onBeneficiaryDocChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    const newFiles = files.map((file) => this.createFileWithPreview(file, 'beneficiary'));
    this.beneficiaryDocuments.update((current) => [...current, ...newFiles]);
    input.value = '';
  }

  onPlanEstimationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    const newFiles = files.map((file) => this.createFileWithPreview(file, 'plan'));
    this.planEstimationFiles.update((current) => [...current, ...newFiles]);
    input.value = '';
  }

  onTenderDetailsChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    const newFiles = files.map((file) => this.createFileWithPreview(file, 'tender'));
    this.tenderDetailFiles.update((current) => [...current, ...newFiles]);
    input.value = '';
  }

  onOtherDocChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    const newFiles = files.map((file) => this.createFileWithPreview(file, 'other'));
    this.otherDocuments.update((current) => [...current, ...newFiles]);
    input.value = '';
  }

  onMediaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []) as File[];
    const newFiles = files.map((file) => this.createFileWithPreview(file, 'media'));
    this.uploadedMedia.update((current) => [...current, ...newFiles]);
    input.value = '';
  }

  onProjectNameChange(): void {
    const data = this.formData();
    if (data.selectedProjectName !== 'MISC. (Create new)') {
      this.formData.update((current) => ({
        ...current,
        newProjectName: '',
        projectName: current.selectedProjectName,
      }));
    } else {
      this.formData.update((current) => ({ ...current, projectName: '' }));
    }
  }

  onSchemeTypeChange(): void {
    const data = this.formData();
    if (data.selectedSchemeType !== 'Misc. (Create new)') {
      this.formData.update((current) => ({
        ...current,
        newSchemeType: '',
        schemeType: current.selectedSchemeType,
      }));
    } else {
      this.formData.update((current) => ({ ...current, schemeType: '' }));
    }
  }

  onLocationSelected(event: {
    latitude: number;
    longitude: number;
    mouzaName?: string;
    districtName?: string;
  }): void {
    this.formData.update((data) => ({
      ...data,
      latitude: event.latitude,
      longitude: event.longitude,
      mouzaName: event.mouzaName ?? data.mouzaName,
      districtName: event.districtName ?? data.districtName,
    }));
  }

  onCoordinateChange(mapComponent?: ProjectMapComponentRef): void {
    const map = mapComponent ?? this.mapComponentRef;
    const { latitude: lat, longitude: lng } = this.formData();

    if (
      lat !== null &&
      lat !== undefined &&
      lng !== null &&
      lng !== undefined &&
      !Number.isNaN(Number(lat)) &&
      !Number.isNaN(Number(lng))
    ) {
      if (!map) {
        setTimeout(() => this.onCoordinateChange(map), 500);
        return;
      }

      setTimeout(() => {
        if (map && typeof map.setLocationFromCoordinates === 'function') {
          map.setLocationFromCoordinates(Number(lat), Number(lng));
        }
      }, 300);
    }
  }

  getFundTypeLabel(value: string): string {
    return FUND_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value;
  }

  getAllDocuments(): FileWithPreview[] {
    return [
      ...this.beneficiaryDocuments(),
      ...this.planEstimationFiles(),
      ...this.tenderDetailFiles(),
      ...this.otherDocuments(),
    ];
  }

  removeFile(fileWithPreview: FileWithPreview): void {
    if (fileWithPreview.preview) {
      URL.revokeObjectURL(fileWithPreview.preview);
    }

    switch (fileWithPreview.category) {
      case 'beneficiary':
        this.beneficiaryDocuments.update((files) => files.filter((f) => f !== fileWithPreview));
        break;
      case 'plan':
        this.planEstimationFiles.update((files) => files.filter((f) => f !== fileWithPreview));
        break;
      case 'tender':
        this.tenderDetailFiles.update((files) => files.filter((f) => f !== fileWithPreview));
        break;
      case 'other':
        this.otherDocuments.update((files) => files.filter((f) => f !== fileWithPreview));
        break;
      case 'media':
        this.uploadedMedia.update((files) => files.filter((f) => f !== fileWithPreview));
        break;
      case 'aoi': {
        this.aoiFiles.update((files) => files.filter((f) => f !== fileWithPreview));
        const remaining = this.aoiFiles();
        this.formData.update((data) => ({
          ...data,
          aoiFile: remaining.length > 0 ? remaining[0].file : null,
        }));
        break;
      }
    }
  }

  removeBeneficiaryDoc(fileWithPreview: FileWithPreview): void {
    this.removeFile(fileWithPreview);
  }

  removePlanEstimation(fileWithPreview: FileWithPreview): void {
    this.removeFile(fileWithPreview);
  }

  removeTenderDetail(fileWithPreview: FileWithPreview): void {
    this.removeFile(fileWithPreview);
  }

  removeOtherDoc(fileWithPreview: FileWithPreview): void {
    this.removeFile(fileWithPreview);
  }

  removeMedia(fileWithPreview: FileWithPreview): void {
    this.removeFile(fileWithPreview);
  }

  removeAoiFile(fileWithPreview: FileWithPreview): void {
    this.removeFile(fileWithPreview);
  }

  deleteAllDocuments(): void {
    if (confirm('Are you sure you want to delete all documents?')) {
      this.getAllDocuments().forEach((doc) => {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
      this.beneficiaryDocuments.set([]);
      this.planEstimationFiles.set([]);
      this.tenderDetailFiles.set([]);
      this.otherDocuments.set([]);
    }
  }

  deleteAllMedia(): void {
    if (confirm('Are you sure you want to delete all media?')) {
      this.uploadedMedia().forEach((media) => {
        if (media.preview) {
          URL.revokeObjectURL(media.preview);
        }
      });
      this.uploadedMedia.set([]);
    }
  }

  storeToLocalStorage(): void {
    const existingData = localStorage.getItem('projectData');
    let data: IProjectData[] = [];

    if (existingData) {
      const existingDataObj = JSON.parse(existingData);
      if (existingDataObj && existingDataObj.length > 0) {
        data = existingDataObj;
      }
    }

    const projectName = this.getFinalProjectName();
    const schemeType = this.getFinalSchemeType();
    const formSnapshot = {
      ...this.formData(),
      projectName,
      schemeType,
    };

    if (this.isEditMode() && this.originalActivityName()) {
      const projectIndex = data.findIndex((p) => p.activityName === this.originalActivityName());

      if (projectIndex !== -1) {
        data[projectIndex] = formSnapshot as IProjectData;
      } else {
        data.push(formSnapshot as IProjectData);
      }
    } else {
      data.push(formSnapshot as IProjectData);
    }

    localStorage.setItem('projectData', JSON.stringify(data));

    const message = this.isEditMode()
      ? 'Project updated successfully!'
      : 'Application submitted successfully! Confirmation & verification will be done by the authority.';
    alert(message);

    void this.router.navigate(['/home']);
  }

  isStepActive(step: number): boolean {
    return this.currentStep() === step;
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep() > step;
  }

  canGoToStep(step: number): boolean {
    return step >= 1 && step <= this.totalSteps();
  }

  getStepTitle(step: number): string {
    return PROJECT_FORM_STEPS.find((item) => item.step === step)?.title ?? '';
  }

  private validateStep1(): string | null {
    const data = this.formData();
    if (!this.getFinalProjectName().trim()) {
      return 'Project name is required.';
    }
    if (!this.getFinalSchemeType().trim()) {
      return 'Scheme type is required.';
    }
    if (!data.locationName.trim()) {
      return 'Location name is required.';
    }
    if (data.latitude == null || data.longitude == null) {
      return 'Latitude and longitude are required.';
    }
    if (!data.selectedStateId || !data.selectedDistrictId || !data.selectedBlockId) {
      return 'State, district, and block are required.';
    }
    if (!data.nearestLandmark.trim()) {
      return 'Nearest landmark is required.';
    }
    if (!data.contactName.trim() || !data.contactNumber.trim() || !data.contactEmail.trim()) {
      return 'Contact name, phone, and email are required.';
    }
    if (!data.plannedStartDate || !data.plannedEndDate) {
      return 'Planned start and end dates are required.';
    }
    return null;
  }

  private validateStep2(): string | null {
    if (!this.formData().beneficiaryName.trim()) {
      return 'Beneficiary name is required.';
    }
    return null;
  }

  private validateStep3(): string | null {
    if (!this.formData().fundType.trim()) {
      return 'Fund type is required.';
    }
    return null;
  }

  private loadCreateContext(mapComponent?: ProjectMapComponentRef): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const raw = sessionStorage.getItem(PROJECT_CREATE_CONTEXT_KEY);
    const context = parseProjectCreateContext(raw);
    if (!context) {
      return;
    }
    sessionStorage.removeItem(PROJECT_CREATE_CONTEXT_KEY);
    if (context.mode === 'edit' && context.projectId) {
      this.isEditMode.set(true);
      this.formData.update((data) => ({ ...data, numericId: context.projectId! }));
    }
    if (context.stateId) {
      this.formData.update((data) => ({ ...data, selectedStateId: context.stateId! }));
      void this.onWizardStateChange(context.stateId, context.districtId, context.blockId);
    }
  }

  private async loadJurisdictionOptions(): Promise<void> {
    try {
      const states = await firstValueFrom(this.getStates.execute(0));
      this.stateOptions.set(states.map((item) => ({ id: item.id, label: item.name })));
    } catch (error) {
      console.error('Failed to load states', error);
    }
  }

  private initializeUserDefaults(): void {
    const user = this.getCurrentUser.execute();
    if (!user) {
      return;
    }
    this.userProfile.set({ name: user.name, email: user.email, userId: user.userId });
    this.formData.update((data) => ({
      ...data,
      contactName: user.name,
      contactEmail: user.email,
      assignedToUserId: user.userId,
    }));
  }

  private loadProjectData(mapComponent?: ProjectMapComponentRef): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const projectDataStr = sessionStorage.getItem('selectedProjectData');
    if (!projectDataStr) {
      return;
    }
    try {
      const projectData: IProjectData = JSON.parse(projectDataStr);
      this.bindProjectData(projectData, mapComponent);
      sessionStorage.removeItem('selectedProjectData');
    } catch (error) {
      console.error('Error parsing project data:', error);
    }
  }

  private bindProjectData(project: IProjectData, mapComponent?: ProjectMapComponentRef): void {
    this.isEditMode.set(true);
    this.originalActivityName.set(project.activityName || '');

    this.formData.update((data) => {
      const next = { ...data };

      if (project.projectName) {
        next.projectName = project.projectName;
        if (this.projectNames.includes(project.projectName)) {
          next.selectedProjectName = project.projectName;
        } else {
          next.selectedProjectName = 'MISC. (Create new)';
          next.newProjectName = project.projectName;
        }
      }

      if (project.activityName) {
        next.activityName = project.activityName;
      }

      if (project.schemeType) {
        next.schemeType = project.schemeType;
        if (this.schemeTypes.includes(project.schemeType)) {
          next.selectedSchemeType = project.schemeType;
        } else {
          next.selectedSchemeType = 'Misc. (Create new)';
          next.newSchemeType = project.schemeType;
        }
      }

      if (project.locationName) {
        next.locationName = project.locationName;
      }

      if (project.latitude !== null && project.latitude !== undefined) {
        next.latitude = project.latitude;
      }

      if (project.longitude !== null && project.longitude !== undefined) {
        next.longitude = project.longitude;
      }

      if (project.beneficiaryName) {
        next.beneficiaryName = project.beneficiaryName;
      }

      if (project.beneficiaryDetails) {
        next.beneficiaryDetails = project.beneficiaryDetails;
      }

      if (project.estimatedCost !== null && project.estimatedCost !== undefined) {
        next.estimatedCost = project.estimatedCost;
      }

      if (project.finalCost !== null && project.finalCost !== undefined) {
        next.finalCost = project.finalCost;
      }

      if (project.fundType) {
        next.fundType = project.fundType;
      }

      if (project.districtName) {
        next.districtName = project.districtName;
      }

      if (project.mouzaName) {
        next.mouzaName = project.mouzaName;
      }

      return next;
    });

    const { latitude, longitude } = this.formData();
    if (latitude !== null && longitude !== null) {
      setTimeout(() => {
        this.onCoordinateChange(mapComponent);
      }, 500);
    }
  }

  private onStepChange(mapComponent?: ProjectMapComponentRef): void {
    if (this.currentStep() === 1 && mapComponent?.ensureMapInitialized) {
      setTimeout(() => {
        mapComponent.ensureMapInitialized?.().catch((err) => {
          console.error('Error initializing map on step change:', err);
        });
      }, 200);
    }
  }

  private createFileWithPreview(file: File, category: FileWithPreview['category']): FileWithPreview {
    const fileWithPreview: FileWithPreview = {
      file,
      type: this.getFileType(file),
      category,
    };

    if (fileWithPreview.type === 'image') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        fileWithPreview.preview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    return fileWithPreview;
  }

  private getFileType(file: File): 'image' | 'document' | 'video' {
    if (file.type.startsWith('image/')) {
      return 'image';
    }
    if (file.type.startsWith('video/')) {
      return 'video';
    }
    return 'document';
  }
}

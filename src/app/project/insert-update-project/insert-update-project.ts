import { ChangeDetectorRef, Component, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../map/map';
import { AuthService, IDefaultUser } from '../../services/auth/auth';
import { MapSelectionService } from '../../map-selection.service';
import { Router } from '@angular/router';
import { MapForInsert } from '../map-for-insert/map-for-insert';

interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'video';
  category: 'beneficiary' | 'plan' | 'tender' | 'other' | 'media' | 'aoi';
}

@Component({
  selector: 'app-insert-update-project',
  imports: [FormsModule, CommonModule, MapForInsert],
  templateUrl: './insert-update-project.html',
  styleUrl: './insert-update-project.scss',
})
export class InsertUpdateProject {
  currentStep: number = 1;
  totalSteps: number = 5;

  formData = {
    projectName: '',
    activityName: '',
    schemeType: '',
    locationName: '',
    latitude: null as number | null,
    longitude: null as number | null,
    aoiFile: null as any | null,
    beneficiaryName: '',
    beneficiaryDetails: '',
    estimatedCost: null as number | null,
    finalCost: null as number | null,
    fundType: '',
    selectedProjectName: '',
    newProjectName: '',
    selectedSchemeType: '',
    newSchemeType: '',
    districtName: '',
    mouzaName: ''
  };

  projectNames = [
    'MGNRGA',
    'FOREST & HORTICULTURE',
    'AGRI-IRRIGATION',
    'PHED',
    'PMGSY',
    'PMKSY',
    'MINISTRY OF MINES',
    'URBAN PLANNING',
    'RURAL PLANNING',
    'PMAY',
    'MSME',
    'MISC. (Create new)'
  ];

  schemeTypes = [
    'Construction / Civil Work',
    'Plantation',
    'Production System',
    'Water Supply',
    'Sewage / Drainage System',
    'Waste Management',
    'Financial Assistance / Loan',
    'Transport & Infrastructure',
    'Skills & Workforce Development',
    'Surface Mining',
    'Misc. (Create new)'
  ];

  beneficiaryDocuments: FileWithPreview[] = [];
  planEstimationFiles: FileWithPreview[] = [];
  tenderDetailFiles: FileWithPreview[] = [];
  otherDocuments: FileWithPreview[] = [];
  uploadedMedia: FileWithPreview[] = [];
  aoiFiles: FileWithPreview[] = [];

  private userProfile = signal<IDefaultUser | null>(null);
  private selectedDistrict: string = '';
  private selectedMouza: string = '';
  @ViewChild(MapForInsert) mapComponent!: MapForInsert;

  availableLayers = signal<Array<{name: string, label: string, icon: string}>>([]);
  currentLayerName = signal<string>('Satellite');

  constructor(
    private authService: AuthService,
    private mapSelectionService: MapSelectionService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.getUserProfile();
  }
  ngAfterViewInit(): void {
    // Wait a bit for map component to initialize
    const checkMapComponent = () => {
      if (this.mapComponent && this.mapComponent.availableLayers && this.mapComponent.availableLayers.length > 0) {
        // Sync available layers from map component
        this.availableLayers.set(this.mapComponent.availableLayers.map(layer => ({
          name: layer.name,
          label: layer.label,
          icon: this.getLayerIcon(layer.name)
        })));
        // Sync current layer
        this.currentLayerName.set(this.mapComponent.currentLayerName);
        this.cdr.detectChanges();
        console.log('Map component initialized, layers synced:', this.availableLayers().length);
      } else {
        // Retry if map component not ready yet
        setTimeout(checkMapComponent, 100);
      }
    };
    setTimeout(checkMapComponent, 100);
  }
  getLayerIcon(layerName: string): string {
    const iconMap: { [key: string]: string } = {
      'OpenStreetMap': 'fa-map',
      'Satellite': 'fa-earth-asia',
      'Terrain': 'fa-mountain',
      'Google Streets': 'fa-road',
      'Google Satellite': 'fa-satellite',
      'Google Hybrid': 'fa-layer-group',
      'CartoDB Light': 'fa-sun',
      'CartoDB Dark': 'fa-moon'
    };
    return iconMap[layerName] || 'fa-map';
  }


  private createFileWithPreview(file: File, category: FileWithPreview['category']): FileWithPreview {
    const fileWithPreview: FileWithPreview = {
      file: file,
      type: this.getFileType(file),
      category: category
    };

    if (fileWithPreview.type === 'image') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        fileWithPreview.preview = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    return fileWithPreview;
  }

  private getFileType(file: File): 'image' | 'document' | 'video' {
    if (file.type.startsWith('image/')) {
      return 'image';
    } else if (file.type.startsWith('video/')) {
      return 'video';
    }
    return 'document';
  }

  onAoiFileChange(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const fileWithPreview = this.createFileWithPreview(file, 'aoi');
      this.aoiFiles.push(fileWithPreview);
    });
    if (this.aoiFiles.length > 0) {
      this.formData.aoiFile = this.aoiFiles[0].file;
    }
  }

  onBeneficiaryDocChange(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const fileWithPreview = this.createFileWithPreview(file, 'beneficiary');
      this.beneficiaryDocuments.push(fileWithPreview);
    });
    // Reset input to allow selecting same file again
    event.target.value = '';
  }

  onPlanEstimationChange(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const fileWithPreview = this.createFileWithPreview(file, 'plan');
      this.planEstimationFiles.push(fileWithPreview);
    });
    event.target.value = '';
  }

  onTenderDetailsChange(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const fileWithPreview = this.createFileWithPreview(file, 'tender');
      this.tenderDetailFiles.push(fileWithPreview);
    });
    event.target.value = '';
  }

  onOtherDocChange(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const fileWithPreview = this.createFileWithPreview(file, 'other');
      this.otherDocuments.push(fileWithPreview);
    });
    event.target.value = '';
  }

  onMediaChange(event: any): void {
    const files = Array.from(event.target.files) as File[];
    files.forEach(file => {
      const fileWithPreview = this.createFileWithPreview(file, 'media');
      this.uploadedMedia.push(fileWithPreview);
    });
    event.target.value = '';
  }

  onProjectNameChange(): void {
    if (this.formData.selectedProjectName !== 'MISC. (Create new)') {
      this.formData.newProjectName = '';
      // Sync with projectName field if needed
      this.formData.projectName = this.formData.selectedProjectName;
    } else {
      this.formData.projectName = '';
    }
  }

  onSchemeTypeChange(): void {
    if (this.formData.selectedSchemeType !== 'Misc. (Create new)') {
      this.formData.newSchemeType = '';
      // Sync with schemeType field if needed
      this.formData.schemeType = this.formData.selectedSchemeType;
    } else {
      this.formData.schemeType = '';
    }
  }

  getAllDocuments(): FileWithPreview[] {
    return [
      ...this.beneficiaryDocuments,
      ...this.planEstimationFiles,
      ...this.tenderDetailFiles,
      ...this.otherDocuments
    ];
  }

  removeFile(fileWithPreview: FileWithPreview): void {
    // Revoke preview URL to free memory
    if (fileWithPreview.preview) {
      URL.revokeObjectURL(fileWithPreview.preview);
    }

    switch (fileWithPreview.category) {
      case 'beneficiary':
        this.beneficiaryDocuments = this.beneficiaryDocuments.filter(f => f !== fileWithPreview);
        break;
      case 'plan':
        this.planEstimationFiles = this.planEstimationFiles.filter(f => f !== fileWithPreview);
        break;
      case 'tender':
        this.tenderDetailFiles = this.tenderDetailFiles.filter(f => f !== fileWithPreview);
        break;
      case 'other':
        this.otherDocuments = this.otherDocuments.filter(f => f !== fileWithPreview);
        break;
      case 'media':
        this.uploadedMedia = this.uploadedMedia.filter(f => f !== fileWithPreview);
        break;
      case 'aoi':
        this.aoiFiles = this.aoiFiles.filter(f => f !== fileWithPreview);
        if (this.aoiFiles.length > 0) {
          this.formData.aoiFile = this.aoiFiles[0].file;
        } else {
          this.formData.aoiFile = null;
        }
        break;
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
      this.getAllDocuments().forEach(doc => {
        if (doc.preview) {
          URL.revokeObjectURL(doc.preview);
        }
      });
      this.beneficiaryDocuments = [];
      this.planEstimationFiles = [];
      this.tenderDetailFiles = [];
      this.otherDocuments = [];
    }
  }

  deleteAllMedia(): void {
    if (confirm('Are you sure you want to delete all media?')) {
      this.uploadedMedia.forEach(media => {
        if (media.preview) {
          URL.revokeObjectURL(media.preview);
        }
      });
      this.uploadedMedia = [];
    }
  }

  uploadDocuments(): void {
    console.log('Uploading documents:', this.getAllDocuments());
    // Implement upload logic here
  }

  editDocuments(): void {
    console.log('Editing documents');
    // Implement edit logic here
  }

  saveDocuments(): void {
    console.log('Saving documents:', this.getAllDocuments());
    // Implement save logic here
  }

  deleteDocuments(): void {
    this.deleteAllDocuments();
  }

  uploadMedia(): void {
    console.log('Uploading media:', this.uploadedMedia);
    // Implement upload logic here
  }

  editMedia(): void {
    console.log('Editing media');
    // Implement edit logic here
  }

  saveMedia(): void {
    console.log('Saving media:', this.uploadedMedia);
    // Implement save logic here
  }

  deleteMedia(): void {
    this.deleteAllMedia();
  }

  resetForm(): void {
    // Clean up preview URLs
    [...this.getAllDocuments(), ...this.uploadedMedia, ...this.aoiFiles].forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });

    this.formData = {
      projectName: '',
      activityName: '',
      schemeType: '',
      locationName: '',
      latitude: null,
      longitude: null,
      aoiFile: null,
      beneficiaryName: '',
      beneficiaryDetails: '',
      estimatedCost: null,
      finalCost: null,
      fundType: '',
      selectedProjectName: '',
      newProjectName: '',
      selectedSchemeType: '',
      newSchemeType: '',
      districtName: this.userProfile()?.districts[0] || '',
      mouzaName: this.userProfile()?.blocks[0] || ''
    };
    this.beneficiaryDocuments = [];
    this.planEstimationFiles = [];
    this.tenderDetailFiles = [];
    this.otherDocuments = [];
    this.uploadedMedia = [];
    this.aoiFiles = [];
  }

  getFinalProjectName(): string {
    if (this.formData.selectedProjectName === 'MISC. (Create new)' && this.formData.newProjectName) {
      return this.formData.newProjectName;
    }
    return this.formData.selectedProjectName || '';
  }

  getFinalSchemeType(): string {
    if (this.formData.selectedSchemeType === 'Misc. (Create new)' && this.formData.newSchemeType) {
      return this.formData.newSchemeType;
    }
    return this.formData.selectedSchemeType || '';
  }

  submitForm(): void {
    // Update projectName and schemeType with final values
    this.formData.projectName = this.getFinalProjectName();
    this.formData.schemeType = this.getFinalSchemeType();

    // Collect all files for submission
    const allFiles = {
      aoiFiles: this.aoiFiles.map(f => f.file),
      beneficiaryDocuments: this.beneficiaryDocuments.map(f => f.file),
      planEstimationFiles: this.planEstimationFiles.map(f => f.file),
      tenderDetailFiles: this.tenderDetailFiles.map(f => f.file),
      otherDocuments: this.otherDocuments.map(f => f.file),
      mediaFiles: this.uploadedMedia.map(f => f.file)
    };

    console.log('Form Data:', this.formData);
    console.log('All Files:', allFiles);

    // Create FormData for file upload
    const formDataToSubmit = new FormData();

    // Add form fields
    Object.keys(this.formData).forEach(key => {
      const value = (this.formData as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        formDataToSubmit.append(key, value);
      }
    });

    // Add files
    allFiles.aoiFiles.forEach((file, index) => {
      formDataToSubmit.append('aoiFiles', file);
    });
    allFiles.beneficiaryDocuments.forEach((file, index) => {
      formDataToSubmit.append('beneficiaryDocuments', file);
    });
    allFiles.planEstimationFiles.forEach((file, index) => {
      formDataToSubmit.append('planEstimationFiles', file);
    });
    allFiles.tenderDetailFiles.forEach((file, index) => {
      formDataToSubmit.append('tenderDetailFiles', file);
    });
    allFiles.otherDocuments.forEach((file, index) => {
      formDataToSubmit.append('otherDocuments', file);
    });
    allFiles.mediaFiles.forEach((file, index) => {
      formDataToSubmit.append('mediaFiles', file);
    });

    // Implement form submission logic here
    // Example: this.http.post('/api/submit', formDataToSubmit).subscribe(...)

    alert('Application submitted successfully! Confirmation & verification will be done by the authority.');
    this.storeToLocalStorage();
  }

  storeToLocalStorage(): void {
    // get already store data
    const existingData = localStorage.getItem('projectData');
    let data = [];
    if (existingData) {
      const existingDataObj = JSON.parse(existingData);
      if(existingDataObj && existingDataObj.length>0){
        existingDataObj.push(this.formData as any);
        data = existingDataObj;
      } else {
        data = [ this.formData as any ] as any;
      }
    }
    localStorage.setItem('projectData', JSON.stringify(data));
    this.router.navigate(['/home']);
  }

  // Stepper navigation methods
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.onStepChange();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.onStepChange();
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
      this.onStepChange();
    }
  }

  private onStepChange(): void {
    // Initialize map when Step 1 becomes active
    if (this.currentStep === 1 && this.mapComponent) {
      setTimeout(() => {
        this.mapComponent?.ensureMapInitialized().catch(err => {
          console.error('Error initializing map on step change:', err);
        });
      }, 200);
    }
  }

  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }

  canGoToStep(step: number): boolean {
    // Allow navigation to any step (users can go back and forth)
    return step >= 1 && step <= this.totalSteps;
  }

  getStepTitle(step: number): string {
    const titles = [
      '',
      'ACTIVITY NAME & LOCATION DETAILS',
      'BENEFICIERIES DETAILS',
      'DOCUMENTATION',
      'PHOTO & VIDEOGRAPHY',
      'Application Confirmation Note'
    ];
    return titles[step] || '';
  }



  // loading map related data
  private getUserProfile(bindOnlyMouza: boolean = false) {

    const user = this.authService.getCurrentLoginUser();
    console.log('User profile:', user);
    if (user) {
      this.userProfile.set(user);
      if (user.role === 'district_manager') {
        this.selectedDistrict = user.districts[0];
      } else if (user.role === 'block_manager') {
        this.selectedDistrict = user.districts[0];
        this.selectedMouza = user.blocks[0];
        this.mapSelectionService.selectDistrict(this.selectedDistrict);
        this.mapSelectionService.selectMouza(this.selectedMouza);
      }
    }
  }

  // Handle location selection from map
  onLocationSelected(event: { latitude: number; longitude: number }): void {
    console.log("data from map", event);
    this.formData.latitude = event.latitude;
    this.formData.longitude = event.longitude;
    this.cdr.detectChanges();
  }

  // Sync coordinates from form to map when user manually enters them
  onCoordinateChange(): void {
    console.log("onCoordinateChange called", {
      hasMapComponent: !!this.mapComponent,
      mapComponent: this.mapComponent,
      latitude: this.formData.latitude,
      longitude: this.formData.longitude
    });

    // Check if both coordinates are valid numbers
    const lat = this.formData.latitude;
    const lng = this.formData.longitude;
    
    if (lat !== null && lat !== undefined && lng !== null && lng !== undefined && 
        !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      
      // Ensure map is initialized first
      if (!this.mapComponent) {
        console.warn("mapComponent is not available, waiting...");
        setTimeout(() => this.onCoordinateChange(), 500);
        return;
      }

      // Delay to allow map to initialize if needed
      setTimeout(() => {
        if (this.mapComponent && typeof this.mapComponent.setLocationFromCoordinates === 'function') {
          console.log("Calling setLocationFromCoordinates with:", lat, lng);
          this.mapComponent.setLocationFromCoordinates(
            Number(lat),
            Number(lng)
          );
        } else {
          console.warn("mapComponent or setLocationFromCoordinates method not available after timeout", {
            hasMapComponent: !!this.mapComponent,
            hasMethod: this.mapComponent ? typeof this.mapComponent.setLocationFromCoordinates : 'no component'
          });
        }
      }, 300);
    } else {
      console.warn("Cannot update location: invalid coordinates", {
        lat,
        lng,
        hasMapComponent: !!this.mapComponent
      });
    }
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface FileWithPreview {
  file: File;
  preview?: string;
  type: 'image' | 'document' | 'video';
  category: 'beneficiary' | 'plan' | 'tender' | 'other' | 'media' | 'aoi';
}

@Component({
  selector: 'app-insert-update-project',
  imports: [FormsModule, CommonModule],
  templateUrl: './insert-update-project.html',
  styleUrl: './insert-update-project.scss',
})
export class InsertUpdateProject {
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
    newSchemeType: ''
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
      newSchemeType: ''
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
  }
}

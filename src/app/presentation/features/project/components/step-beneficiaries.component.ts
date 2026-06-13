import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectFormFacade } from '../project-form.facade';

@Component({
  selector: 'app-step-beneficiaries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step-beneficiaries.component.html',
  styleUrl: './step-beneficiaries.component.scss',
})
export class StepBeneficiariesComponent {
  protected readonly facade = inject(ProjectFormFacade);
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-forgot-password',
  imports: [ButtonModule,
    InputTextModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    Toast],
  standalone: true,
  providers: [MessageService],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.authService.forgotPassword(this.forgotForm.get('email')?.value!)
        .subscribe({
          next: (response) => {
            this.messageService.add({ severity: "success", summary: "Email Sent !", detail: "Your reset link have been sent. It might appear in your spam folder." })
            this.successMessage = response.message;
            this.loading = false;
          },
          error: (error) => {
            this.messageService.add({ severity: "error", summary: "Oops !", detail: error })
            this.errorMessage = error;
            this.loading = false;
          }
        });
    }
  }

}

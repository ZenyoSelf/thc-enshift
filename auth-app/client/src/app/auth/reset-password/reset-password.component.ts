import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-reset-password',
  imports: [ButtonModule,
    InputTextModule,
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    Toast],
  standalone: true,
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  resetForm: FormGroup;

  token: string | null = null;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(2)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(2)]]
    }, { validators: passwordMatchValidator });

  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.loading = true;
      this.authService.resetPassword(this.token, this.resetForm.get('password')?.value)
        .subscribe({
          next: (response) => {
            this.messageService.add({ severity: "success", summary: "Email Sent !", detail: "Your new password have been set. you will be automaticly redirected to the login page." })
            this.loading = false;
            setTimeout(() => this.router.navigate(['/login']), 2000);
          },
          error: (error) => {
            this.messageService.add({ severity: "error", summary: "Oops !", detail: error })
            this.loading = false;
          }
        });
    }
  }
}

function passwordMatchValidator(g: FormGroup) {
  return g.get('password')!.value === g.get('passwordConfirm')!.value
    ? null : { 'mismatch': true };
}
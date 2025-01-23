import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
@Component({
  selector: 'app-register',
  imports: [RouterModule, InputTextModule, ButtonModule, CheckboxModule, ReactiveFormsModule, CommonModule, Toast],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  loading = false;
  registerForm: FormGroup;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(2)]],
      passwordConfirm: ['', [Validators.required, Validators.minLength(2)]]
    }, { validators: passwordMatchValidator });
  }

  onSubmit() {
    this.loading = true;
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.messageService.add({ severity: "error", summary: error.error.message })
          this.loading = false;
        }
      });
    } else {
      this.messageService.add({ severity: "error", summary: "Oops !", detail: "You forgot to write something, or it is not valid" })
      this.loading = false;
    }
  }
}
//TODO: Hash password in the front
function passwordMatchValidator(g: FormGroup) {
  return g.get('password')!.value === g.get('passwordConfirm')!.value
    ? null : { 'mismatch': true };
}
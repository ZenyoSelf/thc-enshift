import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { Toast } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
@Component({
  selector: 'app-login',
  imports: [CheckboxModule, ButtonModule, InputTextModule, RouterModule, ReactiveFormsModule, CommonModule, Toast, RippleModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    this.loading = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: "Oops !", detail: "Invalid credentials", life: 3000 })
          this.loading = false;
        }
      });
    }
  }


}

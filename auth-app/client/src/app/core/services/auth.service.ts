import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@interfaces/auth.interface';
import { environment } from '@environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenService } from './token.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  private jwtHelper = new JwtHelperService();

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService,) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = this.tokenService.getToken();
    console.log('Token found:', token);
    try {
      const isExpired = this.jwtHelper.isTokenExpired(token);
      console.log('Is token expired:', isExpired);
      const decodedToken = this.jwtHelper.decodeToken(token!);
      console.log('Decoded token:', decodedToken);

      if (!isExpired) {
        this.getUserProfile().subscribe();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      this.logout();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthentication(response))
      );
  }

  getUserProfile(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/profile`)
      .pipe(
        tap(response => this.currentUserSubject.next(response.user)),
        map(response => response.user),
        catchError(error => {
          console.error('Profile fetch error:', error);
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error(error.error?.message || 'Failed to fetch profile'));
        })
      );
  }


  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/forgot-password`,
      { email }
    ).pipe(
      catchError(error => throwError(() => error.error?.message || 'Failed to send reset email'))
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/reset-password`,
      { token, newPassword }
    ).pipe(
      catchError(error => throwError(() => error.error?.message || 'Failed to reset password'))
    );
  }


  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
  }

  private handleAuthentication(response: AuthResponse): void {
    this.tokenService.setToken(response.token);
    this.currentUserSubject.next(response.user);
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }
}
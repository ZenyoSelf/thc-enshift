import { inject } from '@angular/core';
import {
    HttpRequest,
    HttpInterceptorFn,
    HttpHandlerFn
} from '@angular/common/http';
import { TokenService } from '../services/token.service';


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const token = inject(TokenService).getToken();
    
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(cloned);
    }
    return next(req);
  };
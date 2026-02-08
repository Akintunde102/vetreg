import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiSuccessResponse<T>>;
}

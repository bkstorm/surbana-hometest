import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private logger = new Logger();

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const start = performance.now();

    return next.handle().pipe(
      tap(() => {
        const end = performance.now();
        this.logger.log(`${method} ${url} ${end - start}ms`);
      }),
    );
  }
}

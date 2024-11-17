import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    NotFoundException,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(NotFoundException)
export class NotFoundFilter implements ExceptionFilter {
    catch(excepti_on: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        response.status(404).render('errors/404', {
            path: request.url,
        });
    }
}

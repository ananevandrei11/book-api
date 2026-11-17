import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

export const validationExceptionFactory = (errors: ValidationError[]) =>
  new BadRequestException({
    statusCode: 400,
    message: errors.flatMap((err) => Object.values(err.constraints ?? {})),
    error: 'Validation',
  });

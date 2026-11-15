import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

export const INVALID_ID = 'Invalid id format';

@Injectable()
export class IdValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(INVALID_ID);
    }
    return value;
  }
}

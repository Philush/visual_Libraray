import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';

/**
 * DTO обновления книги.
 *
 * PartialType делает все поля CreateBookDto опциональными.
 * Сохраняет все валидаторы — просто снимает обязательность.
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}

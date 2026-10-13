import { Controller, Get, Header, Query } from '@nestjs/common';
import { type CatalogResponse, DEFAULT_LOCALE, LocaleSchema } from '@cv-rush/contracts';
import { ZodValidationPipe } from '../../platform/http/zod-validation.pipe.js';
import { CatalogService } from './catalog.service.js';

@Controller('v1/catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @Header('cache-control', 'public, max-age=300')
  get(
    @Query('locale', new ZodValidationPipe(LocaleSchema.default(DEFAULT_LOCALE)))
    locale: CatalogResponse['locale'],
  ): CatalogResponse {
    return this.catalog.view(locale);
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { SkipApproval } from './auth/decorators/skip-approval.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @SkipApproval()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  @SkipApproval()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'vet-reg-backend',
    };
  }
}

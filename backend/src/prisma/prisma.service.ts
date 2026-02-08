import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Clean up database for testing
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('cleanDatabase can only be called in test environment');
    }

    // Delete in correct order to respect foreign keys
    await this.activityLog.deleteMany();
    await this.auditLog.deleteMany();
    await this.notification.deleteMany();
    await this.treatmentRecord.deleteMany();
    await this.animal.deleteMany();
    await this.client.deleteMany();
    await this.invitation.deleteMany();
    await this.orgMembership.deleteMany();
    await this.organization.deleteMany();
    await this.vet.deleteMany();
  }
}

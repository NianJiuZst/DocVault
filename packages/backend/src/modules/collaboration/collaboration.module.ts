import { Module } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';

@Module({
  providers: [CollaborationService],
  exports: [CollaborationService],
})
export class CollaborationModule {}

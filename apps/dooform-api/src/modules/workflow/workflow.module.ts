import { Module } from '@nestjs/common'

import { WorkflowInterfaceModule } from './interface/workflow.interface.module'

@Module({
  imports: [WorkflowInterfaceModule],
})
export class WorkflowModule {}

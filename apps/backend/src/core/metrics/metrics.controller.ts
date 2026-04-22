import { Controller, Get } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Unprotected()
  getMetrics() {
    const memory = process.memoryUsage();
    return `
# HELP nodejs_memory_heap_used_bytes Heap used by Node.js
# TYPE nodejs_memory_heap_used_bytes gauge
nodejs_memory_heap_used_bytes ${memory.heapUsed}

# HELP nodejs_memory_heap_total_bytes Total heap available for Node.js
# TYPE nodejs_memory_heap_total_bytes gauge
nodejs_memory_heap_total_bytes ${memory.heapTotal}

# HELP nestjs_app_status Application status (1 = UP)
# TYPE nestjs_app_status gauge
nestjs_app_status 1
    `.trim();
  }
}

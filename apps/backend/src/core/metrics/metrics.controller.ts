import { Controller, Get, Res } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect';
import type { Response } from 'express';
import * as promClient from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Unprotected()
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  }

  @Get('summary')
  @Unprotected()
  async getMetricsSummary() {
    const metrics = await promClient.register.getMetricsAsJSON();

    const summary: Record<string, unknown> = {};

    for (const metric of metrics) {
      if (metric.name === 'http_request_duration_seconds') {
        const values = (metric as any).values || [];
        const sum = values.find((v: any) => v.metricName === 'http_request_duration_seconds_sum')?.value || 0;
        const count = values.find((v: any) => v.metricName === 'http_request_duration_seconds_count')?.value || 1;
        summary.avgResponseTime = count > 0 ? (sum / count) * 1000 : 0;
        summary.totalRequests = count;

        const recentDurations = values
          .filter((v: any) => v.metricName === 'http_request_duration_seconds_bucket')
          .slice(-20)
          .map((v: any) => v.value * 100);
        summary.recentLatencies = recentDurations;
      }
      if (metric.name === 'http_requests_total') {
        const values = (metric as any).values || [];
        const errorCount = values
          .filter((v: any) => v.labels?.code?.startsWith('5'))
          .reduce((acc: number, v: any) => acc + v.value, 0);
        const totalCount = values.reduce((acc: number, v: any) => acc + v.value, 0);
        summary.errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
      }
      if (metric.name === 'nestjs_process_cpu_seconds_total') {
        summary.cpuUsage = (metric as any).values?.[0]?.value || 0;
      }
      if (metric.name === 'nestjs_process_resident_memory_bytes') {
        summary.memoryUsage = (metric as any).values?.[0]?.value || 0;
      }
    }

    summary.uptime = process.uptime();
    summary.nodeVersion = process.version;
    summary.timestamp = Date.now();

    return summary;
  }
}

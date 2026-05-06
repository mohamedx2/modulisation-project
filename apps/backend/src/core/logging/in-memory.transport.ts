import Transport from 'winston-transport';

export class InMemoryTransport extends Transport {
  private logs: string[] = [];
  private maxSize = 1000;

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  log(info: any, callback: () => void) {
    setImmediate(() => this.emit('logged', info));
    const entry = `[${info.level}] ${info.timestamp || ''} ${info.message}${info.stack ? '\n' + info.stack : ''}`;
    this.logs.push(entry);
    if (this.logs.length > this.maxSize) {
      this.logs.shift();
    }
    callback();
  }

  getLogs(count = 100): string[] {
    return this.logs.slice(-count);
  }
}

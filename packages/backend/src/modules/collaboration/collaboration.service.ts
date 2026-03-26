import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Server } from '@hocuspocus/server';

@Injectable()
export class CollaborationService implements OnModuleInit, OnModuleDestroy {
  private server: Server;

  onModuleInit() {
    this.server = new Server({
      port: 1234,
      onAuthenticate: async (data) => {
        const { token } = data;
        if (!token) {
          throw new Error('Unauthorized: no token provided');
        }
        return { user: { name: `User-${String(token).slice(0, 6)}` } };
      },
      onConnect: async (data) => {
        console.log(`Client connected to document: ${data.documentName}`);
      },
      onDisconnect: async (data) => {
        console.log(`Client disconnected from document: ${data.documentName}`);
      },
    });

    this.server.listen();
    console.log('Hocuspocus collaboration server running on ws://localhost:1234');
  }

  onModuleDestroy() {
    this.server?.destroy();
  }
}

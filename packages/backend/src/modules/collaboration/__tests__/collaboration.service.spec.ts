import { Test, TestingModule } from '@nestjs/testing';
import { CollaborationService } from '../../collaboration/collaboration.service';
import { Server } from '@hocuspocus/server';

// Capture the real Server class before replacing it with a mock
const mockListen = jest.fn();
const mockDestroy = jest.fn();

jest.mock('@hocuspocus/server', () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      listen: mockListen,
      destroy: mockDestroy,
    })),
  };
});

describe('CollaborationService', () => {
  let service: CollaborationService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaborationService],
    }).compile();

    service = module.get<CollaborationService>(CollaborationService);
  });

  describe('lifecycle', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have onModuleInit method', () => {
      expect(typeof service.onModuleInit).toBe('function');
    });

    it('should have onModuleDestroy method', () => {
      expect(typeof service.onModuleDestroy).toBe('function');
    });
  });

  describe('onModuleInit', () => {
    it('should create a Hocuspocus Server instance with port 1234', () => {
      service.onModuleInit();
      expect(Server).toHaveBeenCalledWith(expect.objectContaining({ port: 1234 }));
    });

    it('should call listen on the server', () => {
      service.onModuleInit();
      expect(mockListen).toHaveBeenCalled();
    });

    it('should register onAuthenticate, onConnect, and onDisconnect callbacks', () => {
      service.onModuleInit();
      const serverConfig = (Server as jest.Mock).mock.calls[0][0];
      expect(serverConfig).toHaveProperty('onAuthenticate');
      expect(serverConfig).toHaveProperty('onConnect');
      expect(serverConfig).toHaveProperty('onDisconnect');
    });

    it('should not throw when onConnect and onDisconnect callbacks are invoked', async () => {
      service.onModuleInit();
      const { onConnect, onDisconnect } = (Server as jest.Mock).mock.calls[0][0];
      await expect(onConnect({ documentName: 'doc-1' })).resolves.not.toThrow();
      await expect(onDisconnect({ documentName: 'doc-1' })).resolves.not.toThrow();
    });
  });

  describe('onAuthenticate callback', () => {
    it('should throw Error when no token is provided', async () => {
      service.onModuleInit();
      const { onAuthenticate } = (Server as jest.Mock).mock.calls[0][0];
      await expect(onAuthenticate({ token: null })).rejects.toThrow('Unauthorized: no token provided');
    });

    it('should return user with truncated token as name when token is provided', async () => {
      service.onModuleInit();
      const { onAuthenticate } = (Server as jest.Mock).mock.calls[0][0];
      const result = await onAuthenticate({ token: 'abcdef123456' });
      expect(result).toEqual({ user: { name: 'User-abcdef' } });
    });
  });

  describe('onModuleDestroy', () => {
    it('should call destroy on the server after init', () => {
      service.onModuleInit();
      service.onModuleDestroy();
      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should not throw if destroy is called without prior init', () => {
      // calling destroy on undefined server is guarded by a check
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});

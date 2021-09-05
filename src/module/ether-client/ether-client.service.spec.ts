import { Test, TestingModule } from '@nestjs/testing';
import { EtherClientService } from './ether-client.service';

describe('EtherClientService', () => {
  let service: EtherClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EtherClientService],
    }).compile();

    service = module.get<EtherClientService>(EtherClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

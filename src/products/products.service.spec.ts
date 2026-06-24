import { Test, TestingModule } from '@nestjs/testing';
import { ListQueryDto } from '../common/dto/list-query.dto';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: Pick<ProductsRepository, 'findAll'>;

  beforeEach(async () => {
    productsRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: productsRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return products from the repository', async () => {
    const query = new ListQueryDto();

    await expect(service.findAll(query)).resolves.toEqual([]);
    expect(productsRepository.findAll).toHaveBeenCalledWith(query);
  });
});

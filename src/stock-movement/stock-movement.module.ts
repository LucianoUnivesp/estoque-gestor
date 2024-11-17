import { Module } from '@nestjs/common';
import { StockMovementsService } from './services/stock.service';
import { StockMovementsController } from './controllers/stock.controller';
import { Product } from 'src/products-module/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovement } from './entities/stock.entity';
import { ProductsModuleModule } from 'src/products-module/products-module.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, StockMovement]), ProductsModuleModule],
  providers: [StockMovementsService],
  controllers: [StockMovementsController],
  exports: [StockMovementsService]
})
export class StockMovementModule { }

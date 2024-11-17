import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModuleModule } from './products-module/products-module.module';
import { ProductsController } from './products-module/products-controller/products.controller';
import { StockMovementModule } from './stock-movement/stock-movement.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'stock.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ProductsModuleModule,
    StockMovementModule,
  ],
  controllers: [AppController, ProductsController],
  providers: [AppService],
})
export class AppModule { }

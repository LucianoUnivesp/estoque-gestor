import { Controller, Get, Post, Body, Query, Render, Res, Delete, Param, Patch, NotFoundException } from '@nestjs/common';
import { StockMovementsService } from '../services/stock.service';
import { StockMovement } from '../entities/stock.entity';
import { ProductsService } from 'src/products-module/products-service/products-service.service';
import { Repository } from 'typeorm';
import { Product } from 'src/products-module/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('stock-movements')
export class StockMovementsController {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly stockMovementsService: StockMovementsService,
        private readonly productsService: ProductsService,
    ) { }

    @Get()
    @Render('stock-movements')
    async getStockMovements(@Query('error') error?: string, @Query('success') successMessage?: string) {
        const stockMovements = await this.stockMovementsService.findAll();
        const products = await this.productsService.findAll();

        const today = new Date().toISOString().split('T')[0];
        const dailySummary = stockMovements.reduce(
            (summary, movement) => {
                if (movement.createdAt.toISOString().split('T')[0] === today) {
                    const value = movement.quantity * (movement.product?.price || 0);
                    if (movement.type === 'entry') {
                        summary.entries += movement.quantity;
                        summary.entriesValue += value;
                    } else if (movement.type === 'exit') {
                        summary.exits += movement.quantity;
                        summary.exitsValue += value;
                    }
                }
                return summary;
            },
            { entries: 0, exits: 0, balance: 0, entriesValue: 0, exitsValue: 0 }
        );

        dailySummary.balance = dailySummary.entries - dailySummary.exits;

        return {
            stockMovements,
            dailySummary,
            products,
            error,
            successMessage,
        };
    }


    @Post()
    async create(@Body() data: Partial<StockMovement>, @Res() res: any): Promise<void> {
        try {
            await this.stockMovementsService.create(data);

            res.redirect('/stock-movements?success=Movimentação registrada com sucesso!');
        } catch (error) {
            res.redirect(`/stock-movements?error=${encodeURIComponent(error.message)}`);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Res() res: any) {
        try {
            await this.stockMovementsService.delete(id);
            res.redirect('/stock-movements?success=Movimentação excluída com sucesso!');
        } catch (error) {
            res.redirect(`/stock-movements?error=${encodeURIComponent(error.message)}`);
        }
    }

    @Get('edit/:id')
    @Render('edit-stock-movement')
    async editStockMovement(@Param('id') id: number) {
        const stockMovement = await this.stockMovementsService.findOne(id);
        const products = await this.productsService.findAll();
        return { stockMovement, products };
    }

    @Patch(':id')
    async updateStockMovement(@Param('id') id: number, @Body() data: Partial<StockMovement>, @Res() res: any) {
        try {
            await this.stockMovementsService.update(id, data);
            res.redirect('/stock-movements?success=Movimentação atualizada com sucesso!');
        } catch (error) {
            res.redirect(`/stock-movements?error=${encodeURIComponent(error.message)}`);
        }
    }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { StockMovement } from '../entities/stock.entity';
import { Product } from 'src/products-module/entities/product.entity';

@Injectable()
export class StockMovementsService {
    constructor(
        @InjectRepository(StockMovement)
        private stockMovementRepository: Repository<StockMovement>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
    ) { }

    async create(data: Partial<StockMovement>): Promise<{ stockMovement: StockMovement; updatedProduct: Product }> {
        if (!['entry', 'exit'].includes(data.type)) {
            throw new BadRequestException('Invalid type. Allowed values are "entry" or "exit".');
        }

        const { productId } = data as any;

        const product = await this.productRepository.findOne({ where: { id: +productId } });
        if (!product) {
            throw new BadRequestException('Product not found');
        }

        if (data.type === 'exit' && product.quantity < +data.quantity) {
            throw new BadRequestException(`Estoque insuficiente de ${product?.description}! Favor ajustar.`);
        }

        product.quantity += data.type === 'entry' ? +data.quantity : -data.quantity;
        const updatedProduct = await this.productRepository.save(product);

        const stockMovement = this.stockMovementRepository.create({
            ...data,
            product,
        });

        const savedStockMovement = await this.stockMovementRepository.save(stockMovement);

        return { stockMovement: savedStockMovement, updatedProduct };
    }

    async getDailySummary(): Promise<{ entries: number; exits: number; balance: number }> {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Define o início do dia

        // Busca todas as movimentações do dia atual
        const movements = await this.stockMovementRepository.find({
            where: {
                createdAt: MoreThanOrEqual(today),
            },
            relations: ['product'],
        });

        // Calcula os totais
        let entries = 0;
        let exits = 0;

        movements.forEach((movement) => {
            if (movement.type === 'entry') {
                entries += movement.quantity;
            } else if (movement.type === 'exit') {
                exits += movement.quantity;
            }
        });

        const balance = entries - exits;

        return { entries, exits, balance };
    }


    async findAll(): Promise<StockMovement[]> {
        return this.stockMovementRepository.find({
            relations: ['product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByFilters(filters: Partial<StockMovement>): Promise<StockMovement[]> {
        return this.stockMovementRepository.find({
            where: filters,
            relations: ['product'],
            order: { createdAt: 'DESC' },
        });
    }

    async delete(id: number): Promise<void> {
        const movement = await this.stockMovementRepository.findOne({
            where: { id },
            relations: ['product'],
        });

        if (!movement) {
            throw new Error('Movimentação não encontrada');
        }

        const product = movement.product;
        if (movement.type === 'entry') {
            product.quantity -= movement.quantity;
        } else if (movement.type === 'exit') {
            product.quantity += movement.quantity;
        }

        if (product.quantity < 0) {
            throw new Error('Operação de exclusão resultaria em estoque negativo');
        }

        await this.productRepository.save(product);

        await this.stockMovementRepository.delete(id);
    }

    async update(id: number, data: Partial<StockMovement>): Promise<StockMovement> {
        const stockMovement = await this.stockMovementRepository.findOne(id, { relations: ['product'] });
        if (!stockMovement) {
            throw new NotFoundException('Movimentação não encontrada.');
        }

        const { productId } = data as any;

        const product = await this.productRepository.findOne(+productId);
        if (!product) {
            throw new BadRequestException('Produto não encontrado.');
        }

        if (data.type === 'exit' && product.quantity < data.quantity) {
            throw new BadRequestException('Estoque insuficiente para a saída.');
        }

        Object.assign(stockMovement, data, { product });
        return this.stockMovementRepository.save(stockMovement);
    }

    async findOne(id: number): Promise<StockMovement> {
        const stockMovement = await this.stockMovementRepository.findOne(id, { relations: ['product'] });
        if (!stockMovement) {
            throw new NotFoundException('Movimentação não encontrada.');
        }
        return stockMovement;
    }
}

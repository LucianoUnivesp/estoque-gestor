import { Product } from 'src/products-module/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity('stock_movements')
export class StockMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    type: 'entry' | 'exit';

    @Column({ type: 'int' })
    quantity: number;

    @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
    product: Product;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;
}

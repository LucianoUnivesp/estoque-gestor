import { Controller, Get, Post, Patch, Delete, Param, Body, Render, Redirect } from '@nestjs/common';
import { ProductsService } from '../products-service/products-service.service';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @Render('products')
    async findAll() {
        const products = await this.productsService.findAll();
        return { products };
    }

    @Get('edit/:id')
    @Render('edit-product')
    async editPage(@Param('id') id: number) {
        const product = await this.productsService.findOne(id);

        product.expirationDate = product.expirationDate ? new Date(product.expirationDate) : null;

        return { product };
    }

    @Get('create')
    @Render('products/create') // Página de criação de produto
    createPage() {
        return {}; // Renderiza o formulário vazio
    }

    @Post()
    @Redirect('/products') // Redireciona após criação
    async create(@Body() productData: Partial<Product>): Promise<void> {
        await this.productsService.create(productData);
    }



    @Patch(':id')
    @Redirect('/products') // Redireciona após atualização
    async update(
        @Param('id') id: number,
        @Body() productData: Partial<Product>,
    ): Promise<void> {
        await this.productsService.update(id, productData);
    }

    @Delete(':id')
    @Redirect('/products') // Redireciona após remoção
    async remove(@Param('id') id: number): Promise<void> {
        await this.productsService.remove(id);
    }
}

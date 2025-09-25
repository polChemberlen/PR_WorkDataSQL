import express from "express";
import session from "express-session";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from "sequelize";
import { Op } from "sequelize";
import pg from "pg";
import { sequelize } from "./db.js";
import { Product, Category, Supplier } from "./models.js";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('veiws', path.join(__dirname, 'views'));

try {
    await sequelize.authenticate();
    console.log('фурычит')
} catch (e) {
    console.log('не фурычит ', e.message)
};

app.get('/', async (req, res) => {
    const products = await Product.findAll({
        include: [Category, Supplier],
    });
    res.render('index', { products });
});

app.get('/add-category', (req, res) => {
    res.render('add-category');
});

app.get('/add-supplier', (req, res) => {
    res.render('add-supplier');
});

app.get('/add-product', async (req, res) => {
    try {
        const categories = await Category.findAll();
        const suppliers = await Supplier.findAll();
        res.render('add-product', { categories, suppliers });
    } catch (e) {
        console.e('Ошибка выбора категорий или поставщиков: ', e);
        res.status(500).send('Ошибка сервера')
    }
});

app.get('/edit-product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByPk(productId, {
            include: [Category, Supplier],
        });
        const categories = await Category.findAll();
        const suppliers = await Supplier.findAll();
        res.render('edit-product', { product, categories, suppliers });
    } catch (e) {
        console.e('Ошибка выбора продукта для изменения: ', e);
        res.status(500).send('Ошибка сервера')
    }
});

app.post('/add-category', express.urlencoded({ extended: true }), async (req, res) => {
    const { name } = req.body;
    if (name) {
        await Category.create({ name });
    }
    res.redirect('/');
});

app.post('/add-supplier', express.urlencoded({ extended: true }), async (req, res) => {
    const { name, contact } = req.body;
    if (name) {
        await Supplier.create({ name, contact });
    }
    res.redirect('/');
});

app.post('/add-product', express.urlencoded({ extended: true }), async (req, res) => {
    const { name, price, categoryId, supplierId } = req.body;

    if (name && price && categoryId && supplierId) {
        try {
            await Product.create({
                name,
                price,
                CategoryId: categoryId,
                SupplierId: supplierId,
            });
            res.redirect('/');
        } catch (e) {
            console.e('Ошибка добавления продукта: ', e);
            res.status(500).send('Ошибка сервера');
        }
    } else {
        res.status(400).send('Заполнены не все поля');
    }
});

app.post('/delete-product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.destroy(
            { where: { id: productId } }
        );
        res.redirect('/');
    } catch (e) {
        console.e('Ошибка удаления продукта: ', e);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/edit-product/:id', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, categoryId, supplierId } = req.body;

        await Product.update({
            name,
            price,
            CategoryId: categoryId,
            SupplierId: supplierId,
        },
            { where: { id: productId } }
        );

        res.redirect('/');
    } catch (e) {
        console.e('Ошибка изменения продукта: ', e);
        res.status(500).send('Ошибка сервера');
    }
});


(async () => {
    try {
        await sequelize.sync({ force: true });

        const category1 = await Category.create({ name: 'Электроника' });
        const category2 = await Category.create({ name: 'Книги' });

        const supplier1 = await Supplier.create({ name: 'DNSnaya', contact: 'контакт DNSnaya' })
        const supplier2 = await Supplier.create({ name: 'Bookdom', contact: 'контакт Bookdom' })

        await Product.create({
            name: 'Ноут',
            price: 999.99,
            CategoryId: category1.id,
            SupplierId: supplier1.id
        });

        await Product.create({
            name: 'ОС',
            price: 9999.99,
            CategoryId: category1.id,
            SupplierId: supplier1.id
        });

        await Product.create({
            name: 'Дюна',
            price: 4.99,
            CategoryId: category2.id,
            SupplierId: supplier2.id
        });

        await Product.create({
            name: 'Данвический ужас',
            price: 4.99,
            CategoryId: category2.id,
            SupplierId: supplier2.id
        });

        app.listen(PORT, () => console.log(`Фурычит на порту ${PORT}`))

    } catch (e) {
        console.e('Ошибка запуска: ', e);
    }
})();
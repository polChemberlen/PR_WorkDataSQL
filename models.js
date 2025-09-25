import { sequelize } from "./db.js";
import { DataTypes } from "sequelize";

const Product = sequelize.define('Product',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    },
    {
        timestamps: false,
    }
);

const Category = sequelize.define('Category',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: false,
    }
);

const Supplier = sequelize.define('Supplier',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact: {
            type: DataTypes.STRING
        }
    },
    {
        timestamps: false,
    }
);

Product.belongsTo(Category);
Product.belongsTo(Supplier);
Category.hasMany(Product);
Supplier.hasMany(Product);


export {
    Product,
    Category,
    Supplier
};
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize('PR_WorkDataSQL', 'postgres', '123', {
    host: 'localhost',
    dialect: 'postgres'
});

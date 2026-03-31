import sequelize from '../config/database.js';
import Treatment from './treatment.js';
import Quote from './quote.js';
import QuoteItem from './quote-item.js';
import Payment from './payment.js';

Treatment.belongsToMany(Quote, { through: QuoteItem, foreignKey: 'treatmentId', otherKey: 'quoteId' });
Quote.belongsToMany(Treatment, { through: QuoteItem, foreignKey: 'quoteId', otherKey: 'treatmentId' });
Treatment.hasMany(QuoteItem, { foreignKey: 'treatmentId' });
QuoteItem.belongsTo(Treatment, { foreignKey: 'treatmentId', as: 'treatment' });
Quote.hasMany(QuoteItem, { foreignKey: 'quoteId', as: 'items', onDelete: 'CASCADE' });
QuoteItem.belongsTo(Quote, { foreignKey: 'quoteId' });

Quote.hasMany(Payment, { foreignKey: { name: 'quoteId', allowNull: false } });
Payment.belongsTo(Quote, { foreignKey: { name: 'quoteId', allowNull: false } });

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

export { sequelize, syncDatabase, Treatment, Quote, QuoteItem, Payment };
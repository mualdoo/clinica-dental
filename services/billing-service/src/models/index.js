import sequelize from '../config/database.js';
import Treatment from './treatment.js';
import Quote from './quote.js';
import QuoteItem from './quote-item.js';
import PaymentPlan from './payment-plan.js';
import Payment from './payment.js';

Treatment.belongsToMany(Quote, { through: QuoteItem });
Quote.belongsToMany(Treatment, { through: QuoteItem });
Treatment.hasMany(QuoteItem);
QuoteItem.belongsTo(Treatment);
Quote.hasMany(QuoteItem);
QuoteItem.belongsTo(Quote);

PaymentPlan.hasOne(Quote, { foreignKey: { name: 'quoteId', allowNull: false } });
Quote.belongsTo(PaymentPlan, { foreignKey: { name: 'quoteId', allowNull: false } });

PaymentPlan.hasMany(Payment, { foreignKey: { name: 'paymentPlanId', allowNull: false } });
Payment.belongsTo(PaymentPlan, { foreignKey: { name: 'paymentPlanId', allowNull: false } });

const syncDatabase = async () => {
    await sequelize.sync({ alter: true });
};

export { sequelize, syncDatabase, Treatment, Quote, QuoteItem, PaymentPlan, Payment };
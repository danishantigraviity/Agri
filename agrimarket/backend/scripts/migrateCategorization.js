const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: '../.env' });

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Fix Fresh Milk
    const milkResult = await Product.updateMany(
      { name: /Milk/i },
      { $set: { category: 'dairy' } }
    );
    console.log(`Updated ${milkResult.modifiedCount} milk products to 'dairy'`);

    // Fix Cauliflower (ensure it is vegetables)
    const cauliflowerResult = await Product.updateMany(
      { name: /Cauliflower/i },
      { $set: { category: 'vegetables' } }
    );
    console.log(`Updated ${cauliflowerResult.modifiedCount} cauliflower products to 'vegetables'`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();

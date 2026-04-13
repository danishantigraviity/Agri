const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const SoilAnalysis = require('../models/SoilAnalysis');
const Subscription = require('../models/Subscription');
const Task = require('../models/Task');
const Medicine = require('../models/Medicine');

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB for cleanup');

    const collections = [
      { name: 'Users', model: User },
      { name: 'Products', model: Product },
      { name: 'Orders', model: Order },
      { name: 'Payments', model: Payment },
      { name: 'Soil Analyses', model: SoilAnalysis },
      { name: 'Subscriptions', model: Subscription },
      { name: 'Tasks', model: Task },
      { name: 'Medicines', model: Medicine }
    ];

    for (const collection of collections) {
      const result = await collection.model.deleteMany({});
      console.log(`🗑️  Cleared ${collection.name}: ${result.deletedCount} items removed`);
    }

    console.log('\n✅ Database is now completely empty and ready for fresh setup.');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

clearDatabase();

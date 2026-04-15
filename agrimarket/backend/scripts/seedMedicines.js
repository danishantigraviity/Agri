const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('../models/Medicine');

dotenv.config({ path: '../.env' });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const medData = [
      {
        name: 'Organic Neem Oil',
        type: 'pesticide',
        cropType: ['Vegetables', 'Fruits'],
        diseaseTarget: ['Aphids', 'Mites', 'Fungus'],
        dosage: '5ml per litre of water',
        price: { mrp: 250, selling: 199 },
        image: 'https://res.cloudinary.com/desvtxlzs/image/upload/v1/medicines/neem_oil',
        description: 'Natural pesticide for organic farming.',
        brand: 'EcoAgri'
      },
      {
        name: 'Potash Fertilizer',
        type: 'fertilizer',
        cropType: ['Grains', 'Pulses'],
        diseaseTarget: ['Nutrient Deficiency'],
        dosage: '10kg per acre',
        price: { mrp: 500, selling: 450 },
        image: 'https://res.cloudinary.com/desvtxlzs/image/upload/v1/medicines/potash',
        description: 'Premium potash for better yield.',
        brand: 'GrowFast'
      }
    ];

    await Medicine.deleteMany({});
    await Medicine.insertMany(medData);
    console.log('Seed medicines successfully');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

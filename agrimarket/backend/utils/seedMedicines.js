const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('../models/Medicine');

dotenv.config();

const MEDICINES = [
  {
    name: 'Mancozeb 75% WP',
    type: 'fungicide',
    cropType: ['Tomato', 'Potato', 'Apple', 'Grape'],
    diseaseTarget: ['Tomato Early Blight', 'Potato Late Blight', 'Apple Scab', 'Grape Leaf Blight'],
    dosage: '2.5g per Litre of water',
    price: { mrp: 450, selling: 380 },
    image: 'https://res.cloudinary.com/demo/image/upload/v1/agrimarket/medicines/mancozeb.jpg',
    description: 'High-quality broad-spectrum contact fungicide for controlling multiple diseases.',
    brand: 'UPL',
  },
  {
    name: 'Copper Oxychloride 50% WP',
    type: 'fungicide',
    cropType: ['Tomato', 'Peach', 'Cherry'],
    diseaseTarget: ['Tomato Bacterial Spot', 'Peach Bacterial Spot', 'Cherry Powdery Mildew'],
    dosage: '3g per Litre of water',
    price: { mrp: 550, selling: 490 },
    image: 'https://res.cloudinary.com/demo/image/upload/v1/agrimarket/medicines/copper.jpg',
    description: 'Effective bacterial and fungal control for high-value horticultural crops.',
    brand: 'Dhanuka',
  },
  {
    name: 'Chlorpyriphos 20% EC',
    type: 'pesticide',
    cropType: ['Corn', 'Soybean', 'Cotton'],
    diseaseTarget: ['Corn Cercospora Leaf Spot', 'Corn Northern Leaf Blight', 'Soybean Healthy'],
    dosage: '2ml per Litre of water',
    price: { mrp: 680, selling: 590 },
    image: 'https://res.cloudinary.com/demo/image/upload/v1/agrimarket/medicines/chlorpy.jpg',
    description: 'Powerful insecticide for wide variety of lepidopteran pests and some soil insects.',
    brand: 'Bayer',
  },
  {
    name: 'Hexaconazole 5% SC',
    type: 'fungicide',
    cropType: ['Apple', 'Grape', 'Rice'],
    diseaseTarget: ['Apple Black Rot', 'Cedar Apple Rust', 'Grape Black Rot', 'Grape Esca'],
    dosage: '2ml per Litre of water',
    price: { mrp: 820, selling: 750 },
    image: 'https://res.cloudinary.com/demo/image/upload/v1/agrimarket/medicines/hexa.jpg',
    description: 'Systemic fungicide with protective and curative action for orchards.',
    brand: 'Syngenta',
  },
  {
    name: 'Plant Care Pro (NPK 19:19:19)',
    type: 'fertilizer',
    cropType: ['Tomato', 'Potato', 'Corn', 'Apple', 'Grape'],
    diseaseTarget: ['Tomato Healthy', 'Potato Healthy', 'Corn Healthy', 'Apple Healthy', 'Grape Healthy'],
    dosage: '5g per Litre of water (Foliar spray)',
    price: { mrp: 300, selling: 250 },
    image: 'https://res.cloudinary.com/demo/image/upload/v1/agrimarket/medicines/npk.jpg',
    description: 'Balanced water-soluble fertilizer for overall plant growth and immunity.',
    brand: 'IFFCO',
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for Seeding');

    // Clear existing medicines if any (Optional: check if already exists)
    await Medicine.deleteMany({});
    
    // Insert new medicines
    await Medicine.insertMany(MEDICINES);
    console.log('💊 Success: Medicines Seeded Successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDB();

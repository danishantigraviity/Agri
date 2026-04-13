const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');

const CATEGORIES = ['vegetables', 'fruits', 'dairy', 'grains', 'pulses', 'spices'];

const PRODUCTS = [
  { name: 'Fresh Tomatoes', category: 'vegetables', description: 'Farm-fresh tomatoes, sun-ripened and handpicked.', price: { mrp: 60, selling: 45, unit: 'kg' }, stock: { quantity: 150 }, isOrganic: true, isFeatured: true, tags: ['fresh','tomato','vegetable'] },
  { name: 'Organic Spinach', category: 'vegetables', description: 'Tender organic spinach, rich in iron and nutrients.', price: { mrp: 40, selling: 30, unit: 'bunch' }, stock: { quantity: 80 }, isOrganic: true, tags: ['organic','leafy','green'] },
  { name: 'Alphonso Mangoes', category: 'fruits', description: 'Premium Alphonso mangoes from Ratnagiri, Maharashtra.', price: { mrp: 800, selling: 650, unit: 'dozen' }, stock: { quantity: 40 }, isOrganic: false, isFeatured: true, tags: ['mango','alphonso','seasonal'] },
  { name: 'Desi Cow Milk', category: 'dairy', description: 'Pure desi cow milk, collected fresh every morning.', price: { mrp: 70, selling: 60, unit: 'litre' }, stock: { quantity: 100 }, subscriptionAvailable: true, tags: ['milk','dairy','fresh'] },
  { name: 'Basmati Rice', category: 'grains', description: 'Aged basmati rice, long grain, perfect for biryani.', price: { mrp: 180, selling: 150, unit: 'kg' }, stock: { quantity: 500 }, tags: ['rice','basmati','grain'] },
  { name: 'Red Onions', category: 'vegetables', description: 'Fresh red onions, pungent and perfect for cooking.', price: { mrp: 50, selling: 35, unit: 'kg' }, stock: { quantity: 300 }, tags: ['onion','vegetable','staple'] },
  { name: 'Turmeric Powder', category: 'spices', description: 'Pure organic turmeric powder, high curcumin content.', price: { mrp: 120, selling: 90, unit: 'kg' }, stock: { quantity: 60 }, isOrganic: true, isFeatured: true, tags: ['turmeric','spice','organic'] },
  { name: 'Toor Dal', category: 'pulses', description: 'Premium toor dal, fresh harvest, protein-rich.', price: { mrp: 160, selling: 130, unit: 'kg' }, stock: { quantity: 200 }, tags: ['dal','pulse','protein'] },
  { name: 'Fresh Cauliflower', category: 'vegetables', description: 'White, firm cauliflower heads, no pesticides used.', price: { mrp: 55, selling: 40, unit: 'piece' }, stock: { quantity: 60 }, isOrganic: true, tags: ['cauliflower','vegetable','seasonal'] },
  { name: 'Free-Range Eggs', category: 'dairy', description: 'Country chicken eggs, free-range and high in nutrients.', price: { mrp: 90, selling: 75, unit: 'dozen' }, stock: { quantity: 200 }, isFeatured: true, tags: ['eggs','protein','country'] },
  { name: 'Bottle Gourd', category: 'vegetables', description: 'Fresh lauki straight from the farm.', price: { mrp: 30, selling: 22, unit: 'piece' }, stock: { quantity: 120 }, tags: ['lauki','gourd','vegetable'] },
  { name: 'Cardamom Pods', category: 'spices', description: 'Premium green cardamom from Kerala hills.', price: { mrp: 1200, selling: 950, unit: 'kg' }, stock: { quantity: 20 }, isOrganic: true, tags: ['cardamom','spice','kerala'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑  Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'Demo@1234',
      role: 'admin',
      phone: '9999999999',
      isEmailVerified: true,
    });
    console.log('👤 Admin created:', admin.email);

    // Create Farmers
    const farmerData = [
      { name: 'Ramesh Kumar', email: 'farmer@demo.com', farmName: 'Green Valley Farm', farmLocation: 'Pune, Maharashtra' },
      { name: 'Suresh Patel', email: 'suresh@demo.com', farmName: 'Patel Organic Farm', farmLocation: 'Anand, Gujarat' },
      { name: 'Lakshmi Devi', email: 'lakshmi@demo.com', farmName: 'Lakshmi\'s Garden', farmLocation: 'Madurai, Tamil Nadu' },
    ];

    const farmers = [];
    for (const fd of farmerData) {
      const farmer = await User.create({
        name: fd.name,
        email: fd.email,
        password: 'Demo@1234',
        role: 'farmer',
        phone: `98765${Math.floor(Math.random()*100000).toString().padStart(5,'0')}`,
        isEmailVerified: true,
        farmerProfile: {
          farmName: fd.farmName,
          farmLocation: fd.farmLocation,
          isApproved: true,
          approvedAt: new Date(),
          approvedBy: admin._id,
          totalSales: Math.floor(Math.random() * 200),
          totalRevenue: Math.floor(Math.random() * 50000),
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 50),
        },
      });
      farmers.push(farmer);
      console.log('🌾 Farmer created:', farmer.email);
    }

    // Create Customers
    const customers = [];
    const customerData = [
      { name: 'Priya Sharma', email: 'customer@demo.com' },
      { name: 'Arjun Singh', email: 'arjun@demo.com' },
    ];
    for (const cd of customerData) {
      const customer = await User.create({
        name: cd.name,
        email: cd.email,
        password: 'Demo@1234',
        role: 'customer',
        phone: `87654${Math.floor(Math.random()*100000).toString().padStart(5,'0')}`,
        isEmailVerified: true,
      });
      customers.push(customer);
      console.log('🛒 Customer created:', customer.email);
    }

    // Create Products
    for (let i = 0; i < PRODUCTS.length; i++) {
      const farmer = farmers[i % farmers.length];
      const productData = {
        ...PRODUCTS[i],
        farmer: farmer._id,
        isApproved: 'approved',
        isAvailable: true,
        images: [`https://source.unsplash.com/400x400/?${PRODUCTS[i].tags[0]},food`],
      };
      await Product.create(productData);
      console.log(`📦 Product created: ${PRODUCTS[i].name}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin:    admin@demo.com    / Demo@1234');
    console.log('   Farmer:   farmer@demo.com   / Demo@1234');
    console.log('   Customer: customer@demo.com / Demo@1234');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('../models/Medicine');

dotenv.config({ path: '../.env' });

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const medicines = await Medicine.find();
    console.log('--- Current Medicine Documents ---');
    medicines.forEach(m => console.log(`- ${m.name} (${m.brand || 'No Brand'})` ));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();

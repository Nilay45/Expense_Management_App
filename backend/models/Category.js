// import mongoose from 'mongoose';

// const subcategorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     description: { 
//         type: String 
//     },
// });

// const categorySchema = new mongoose.Schema({
//     name: { 
//         type: String, 
//         required: true, 
//         unique: true 
//     },
//     description: { 
//         type: String 
//     },
//     subcategories: [subcategorySchema], // Array of subcategories
// }, { timestamps: true });

// const Category = mongoose.model('Category', categorySchema);

// export default Category;

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["Income", "Expense"], required: true }, // Defines if it's an income or expense category
  subcategories: [
    {
      name: { type: String, required: true },
    },
  ],
});

const Category = mongoose.model("Category", categorySchema);
export default Category;


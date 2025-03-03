import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }], 
});

const Subcategory = mongoose.model("Subcategory", subcategorySchema);
export default Subcategory;

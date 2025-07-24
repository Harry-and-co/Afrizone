const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'beverage', 'textile', 'beauty', 'art']
  },
  origin: {
    country: {
      type: String,
      required: true
    },
    region: String
  },
  images: [String],
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calcul de la note moyenne avant sauvegarde
productSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectToMongoDB, getDb } = require('../db');

// Load Cloudinary mapping if available
let uploadedImages = {};
try {
  const mappingPath = path.join(__dirname, 'uploaded_combo_images.json');
  if (fs.existsSync(mappingPath)) {
    uploadedImages = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
  }
} catch (e) {
  console.warn('Could not read uploaded_combo_images.json:', e.message);
}

const combosToAdd = [
  // --- Solo Combo Meals ---
  {
    name: 'The Veggie Snack Combo',
    category: "Meal's",
    description: "* Veg Patty Burger\n* Ice Coke",
    mrp: 120,
    offerPrice: 98,
    badge: 'COMBO',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'veggie_snack_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794214472/mjs_corner/food/cwn1nlqsp89rpij5wx5h.jpg'
  },
  {
    name: 'The Classic Burger & Shake Combo',
    category: "Meal's",
    description: "* Burger\n* Milk Shake / Strawberry Shake\n* French Fries",
    mrp: 270,
    offerPrice: 218,
    badge: 'COMBO',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'classic_burger_shake_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794161789/mjs_corner/food/o8trmjc8asdwi7ka7wop.jpg'
  },
  {
    name: 'The Crispy Chicken Combo',
    category: "Meal's",
    description: "* Zinger Burger\n* Chicken Leg\n* Ice Coke",
    mrp: 300,
    offerPrice: 267,
    badge: 'COMBO',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'crispy_chicken_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794162026/mjs_corner/food/rowlkrfzulcftjlliuvj.jpg'
  },
  {
    name: 'The Double Down Feast',
    category: "Meal's",
    description: "* Double Down Burger\n* Chicken Popcorn\n* Cold Coffee",
    mrp: 400,
    offerPrice: 347,
    badge: 'COMBO',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'double_down_feast',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794160338/mjs_corner/food/wxsbkhtvjn4nwqlsm7kq.jpg'
  },

  // --- Pizza Combos ---
  {
    name: 'Margherita Personal Meal',
    category: "Meal's",
    description: "* Margherita Pizza\n* Lassi or Strawberry Shake",
    mrp: 260,
    offerPrice: 198,
    badge: 'COMBO',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'margherita_personal_meal',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481362/mjs_corner/food/rk7iwatfw98gp4g8hqel.jpg'
  },
  {
    name: "Veggie Lover's Duo Combo",
    category: "Meal's",
    description: "* Fresh Veggie Pizza\n* French Fries\n* Kiwi Shake",
    mrp: 420,
    offerPrice: 337,
    badge: 'COMBO',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'veggie_lovers_duo_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481392/mjs_corner/food/svk15j050nxif0kpt3jp.jpg'
  },
  {
    name: 'The Paneer & Pizza Combo',
    category: "Meal's",
    description: "* Peppy Paneer Pizza\n* Cold Coffee\n* Green Mint Mojito",
    mrp: 460,
    offerPrice: 377,
    badge: 'COMBO',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'paneer_pizza_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481418/mjs_corner/food/u6b4io7be7yrsswxevzu.jpg'
  },
  {
    name: 'The Golden Meat Feast',
    category: "Meal's",
    description: "* Chicken Golden Delight Pizza\n* Chicken Popcorn\n* Kiwi Shake",
    mrp: 520,
    offerPrice: 417,
    badge: 'COMBO',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'golden_meat_feast',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481694/mjs_corner/food/viku4ycnpo96fr3rv2tf.jpg'
  },

  // --- Chicken & Sides Combos ---
  {
    name: 'The Wingman Snack Deal',
    category: "Meal's",
    description: "* Wing\n* Chicken Popcorn\n* Cold Coffee",
    mrp: 200,
    offerPrice: 167,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'wingman_snack_deal',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481226/mjs_corner/food/cevto9nvmr4bhdcus4kv.jpg'
  },
  {
    name: 'Fried Chicken Platter Combo',
    category: "Meal's",
    description: "* Chicken Wing & Leg\n* Chicken Leg\n* French Fries\n* Ice Coke",
    mrp: 360,
    offerPrice: 296,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'fried_chicken_platter_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481196/mjs_corner/food/ynrmskaxwiv4a4gwl8yx.jpg'
  },

  // --- Shake & Dessert Refreshers ---
  {
    name: 'Cool Down Pair',
    category: "Meal's",
    description: "* Cold Coffee\n* Green Mint Mojito",
    mrp: 190,
    offerPrice: 148,
    badge: 'COMBO',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'cool_down_pair',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794046733/mjs_corner/food/pdaswan2iyvcj6rc8mhq.jpg'
  },
  {
    name: 'Nutty & Sweet Combo',
    category: "Meal's",
    description: "* Banana Shake\n* Kaju Milk Shake",
    mrp: 300,
    offerPrice: 243,
    badge: 'COMBO',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'nutty_sweet_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794161011/mjs_corner/food/ikkrqllnbhuuivduodr4.jpg'
  },

  // --- 2-Person Burger & Fries Combos ---
  {
    name: 'Classic Twin Veggie Meal',
    category: "Meal's",
    description: "* 2 Veg Patty Burgers\n* 1 French Fries\n* 2 Ice Cokes",
    mrp: 310,
    offerPrice: 245,
    badge: 'DEAL',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'classic_twin_veggie_meal',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794161841/mjs_corner/food/susobf7e2kcy0qfy60im.jpg'
  },
  {
    name: 'Chicken Burger & Snack Meal',
    category: "Meal's",
    description: "* 1 Zinger Burger\n* 1 Paneer Burger\n* 1 Chicken Popcorn\n* 2 Ice Cokes",
    mrp: 580,
    offerPrice: 485,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'chicken_burger_snack_meal',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794162026/mjs_corner/food/rowlkrfzulcftjlliuvj.jpg'
  },
  {
    name: 'Ultimate Loaded Burger Meal',
    category: "Meal's",
    description: "* 1 Double Down Burger\n* 1 Oklahoma Onion Burger\n* 1 French Fries\n* 2 Ice Cokes",
    mrp: 680,
    offerPrice: 554,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'ultimate_loaded_burger_meal',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1794160338/mjs_corner/food/wxsbkhtvjn4nwqlsm7kq.jpg'
  },

  // --- 2-Person Pizza Combos ---
  {
    name: 'Veggie Pizza Double Combo',
    category: "Meal's",
    description: "* 1 Margherita Pizza\n* 1 Fresh Veggie Pizza\n* 1 French Fries\n* 2 Ice Cokes",
    mrp: 540,
    offerPrice: 435,
    badge: 'DEAL',
    isVeg: true,
    dietary: 'veg',
    imageKey: 'veggie_pizza_double_combo',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481392/mjs_corner/food/svk15j050nxif0kpt3jp.jpg'
  },
  {
    name: 'Paneer & Farmhouse Pizza Party',
    category: "Meal's",
    description: "* 1 Farmhouse Pizza\n* 1 Peppy Paneer Pizza\n* 1 Chicken Popcorn / Snack\n* 2 Ice Cokes",
    mrp: 790,
    offerPrice: 655,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'paneer_farmhouse_pizza_party',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481812/mjs_corner/food/jea7gyluct8csdvyp8pd.jpg'
  },
  {
    name: 'Chicken Feast Pizza Pair',
    category: "Meal's",
    description: "* 1 Chicken Sausage Pizza\n* 1 Chicken Golden Delight Pizza\n* 2 Ice Cokes",
    mrp: 780,
    offerPrice: 634,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'chicken_feast_pizza_pair',
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481624/mjs_corner/food/ovjpv913eprbcssgwpn2.jpg'
  },

  // --- 2-Person Fried Chicken Combos ---
  {
    name: 'Fried Chicken Duo Basket',
    category: "Meal's",
    description: "* 2 Chicken Leg pieces\n* 1 Chicken Wing & Leg\n* 1 French Fries\n* 2 Ice Cokes",
    mrp: 460,
    offerPrice: 374,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'fried_chicken_platter_combo', // shares our generated platter photo
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481196/mjs_corner/food/ynrmskaxwiv4a4gwl8yx.jpg'
  },
  {
    name: 'Chicken Lovers Mix',
    category: "Meal's",
    description: "* 1 Chicken Wing & Leg\n* 2 Chicken Wings\n* 1 Chicken Popcorn\n* 2 Ice Cokes",
    mrp: 520,
    offerPrice: 422,
    badge: 'DEAL',
    isVeg: false,
    dietary: 'non-veg',
    imageKey: 'fried_chicken_platter_combo', // crispy chicken feast visual
    fallbackImage: 'https://res.cloudinary.com/nhpdthsp/image/upload/v1793481226/mjs_corner/food/cevto9nvmr4bhdcus4kv.jpg'
  }
];

async function run() {
  await connectToMongoDB();
  const db = getDb();
  const collection = db.collection('menu');

  console.log(`Processing ${combosToAdd.length} combos...`);

  let added = 0;
  let updated = 0;

  for (let i = 0; i < combosToAdd.length; i++) {
    const item = combosToAdd[i];
    const imageUrl = uploadedImages[item.imageKey] || item.fallbackImage;

    const doc = {
      name: item.name,
      category: item.category,
      description: item.description,
      image: imageUrl,
      mrp: item.mrp,
      offerPrice: item.offerPrice,
      badge: item.badge,
      available: true,
      isVeg: item.isVeg,
      dietary: item.dietary,
      sizes: [],
      addons: []
    };

    const existing = await collection.findOne({ name: item.name });
    if (existing) {
      await collection.updateOne({ _id: existing._id }, { $set: doc });
      console.log(`[UPDATED] ${item.name} -> ${imageUrl}`);
      updated++;
    } else {
      doc.id = Date.now() + i;
      await collection.insertOne(doc);
      console.log(`[INSERTED] ${item.name} -> ${imageUrl}`);
      added++;
    }
  }

  console.log(`\n🎉 Success! Added: ${added}, Updated: ${updated}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error inserting combos:', err);
  process.exit(1);
});

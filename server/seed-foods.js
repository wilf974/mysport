const db = require('./database');

// Common foods with nutritional data (per 100g)
const commonFoods = [
  // Proteins
  { name: 'Poulet (poitrine)', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, sugar: 0, sodium: 74, serving_size: '100g' },
  { name: 'Œuf', calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0, sugar: 1.1, sodium: 142, serving_size: '100g' },
  { name: 'Bœuf maigre', calories: 250, protein: 26, carbs: 0, fats: 15, fiber: 0, sugar: 0, sodium: 75, serving_size: '100g' },
  { name: 'Poisson (Saumon)', calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, sugar: 0, sodium: 59, serving_size: '100g' },
  { name: 'Poisson (Cabillaud)', calories: 82, protein: 17, carbs: 0, fats: 0.7, fiber: 0, sugar: 0, sodium: 77, serving_size: '100g' },
  { name: 'Yaourt Grec nature', calories: 59, protein: 10, carbs: 3.3, fats: 0.4, fiber: 0, sugar: 3.3, sodium: 47, serving_size: '100g' },
  { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, fiber: 1.2, sugar: 0.7, sodium: 7, serving_size: '100g' },

  // Carbs
  { name: 'Riz blanc cuit', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, sugar: 0.1, sodium: 2, serving_size: '100g' },
  { name: 'Riz complet cuit', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, fiber: 1.8, sugar: 0.2, sodium: 5, serving_size: '100g' },
  { name: 'Pâtes cuites', calories: 131, protein: 4.3, carbs: 25, fats: 1.1, fiber: 1.8, sugar: 0.6, sodium: 2, serving_size: '100g' },
  { name: 'Pain complet', calories: 247, protein: 8.7, carbs: 41, fats: 3.4, fiber: 6.8, sugar: 3.6, sodium: 420, serving_size: '100g' },
  { name: 'Avoine (flocons)', calories: 389, protein: 16.9, carbs: 66, fats: 6.9, fiber: 10.6, sugar: 0, sodium: 30, serving_size: '100g' },
  { name: 'Pomme de terre cuite', calories: 77, protein: 2.1, carbs: 17, fats: 0.1, fiber: 2.1, sugar: 0.8, sodium: 6, serving_size: '100g' },
  { name: 'Patate douce cuite', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3, sugar: 4.2, sodium: 55, serving_size: '100g' },

  // Fruits
  { name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, sugar: 12, sodium: 1, serving_size: '100g' },
  { name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, sugar: 10, sodium: 1, serving_size: '100g' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, fiber: 2.4, sugar: 9.3, sodium: 0, serving_size: '100g' },
  { name: 'Baies (myrtilles)', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, fiber: 2.4, sugar: 10, sodium: 1, serving_size: '100g' },

  // Légumes
  { name: 'Brocoli cuit', calories: 34, protein: 3.7, carbs: 7, fats: 0.4, fiber: 2.4, sugar: 1.4, sodium: 64, serving_size: '100g' },
  { name: 'Épinards cuits', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79, serving_size: '100g' },
  { name: 'Carotte cuite', calories: 35, protein: 0.8, carbs: 8, fats: 0.2, fiber: 2.3, sugar: 4.7, sodium: 52, serving_size: '100g' },
  { name: 'Chou-fleur cuit', calories: 25, protein: 1.9, carbs: 5, fats: 0.3, fiber: 2.1, sugar: 1.9, sodium: 30, serving_size: '100g' },
  { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, serving_size: '100g' },

  // Graisses saines
  { name: 'Huile d\'olive', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, sugar: 0, sodium: 0, serving_size: '1 cuillère (15ml)' },
  { name: 'Noix', calories: 654, protein: 9.3, carbs: 14, fats: 65, fiber: 6.7, sugar: 2.6, sodium: 2, serving_size: '100g' },
  { name: 'Amandes', calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12.5, sugar: 4.4, sodium: 1, serving_size: '100g' },

  // Produits laitiers
  { name: 'Lait écrémé', calories: 35, protein: 3.4, carbs: 5, fats: 0.1, fiber: 0, sugar: 5, sodium: 49, serving_size: '100g' },
  { name: 'Fromage blanc (0% MG)', calories: 50, protein: 9.5, carbs: 3.2, fats: 0.1, fiber: 0, sugar: 3.2, sodium: 85, serving_size: '100g' },

  // Repas composés populaires
  { name: 'Poulet riz brocoli', calories: 172, protein: 24, carbs: 15, fats: 2.5, fiber: 1.5, sugar: 0.5, sodium: 65, serving_size: '250g' },
  { name: 'Œufs épinards', calories: 110, protein: 12, carbs: 2.5, fats: 6, fiber: 1, sugar: 0.5, sodium: 100, serving_size: '150g' },
  { name: 'Pâtes sauce tomate', calories: 140, protein: 5, carbs: 24, fats: 2, fiber: 1.5, sugar: 2, sodium: 250, serving_size: '200g' },
  { name: 'Salmon patate douce', calories: 210, protein: 23, carbs: 12, fats: 8, fiber: 2, sugar: 2, sodium: 50, serving_size: '200g' },

  // Snacks & Desserts
  { name: 'Barre protéinée', calories: 200, protein: 20, carbs: 20, fats: 5, fiber: 3, sugar: 1, sodium: 200, serving_size: '50g' },
  { name: 'Whey Protein Shake', calories: 120, protein: 25, carbs: 1, fats: 1, fiber: 0, sugar: 0.5, sodium: 100, serving_size: '30g poudre' },
  { name: 'Beurre d\'arachide', calories: 588, protein: 25, carbs: 20, fats: 50, fiber: 6, sugar: 5, sodium: 14, serving_size: '100g' },
  { name: 'Chocolat noir (70%)', calories: 585, protein: 7.5, carbs: 46, fats: 43, fiber: 7, sugar: 24, sodium: 12, serving_size: '100g' },
  { name: 'Miel', calories: 304, protein: 0.3, carbs: 82, fats: 0, fiber: 0.2, sugar: 82, sodium: 4, serving_size: '100g' },

  // Boissons
  { name: 'Café noir', calories: 0, protein: 0.1, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 1, serving_size: '100ml' },
  { name: 'Thé vert', calories: 1, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 1, serving_size: '100ml' },
  { name: 'Jus d\'orange', calories: 45, protein: 0.7, carbs: 11, fats: 0.3, fiber: 0.2, sugar: 9, sodium: 0, serving_size: '100ml' },
];

// Insert foods into database
function seedFoods() {
  let inserted = 0;
  let skipped = 0;

  console.log('🌱 Démarrage du peuplement de la base de données alimentaire...');

  const insertFood = (index) => {
    if (index >= commonFoods.length) {
      console.log(`✅ Peuplement terminé: ${inserted} aliments ajoutés, ${skipped} aliments ignorés (doublons)`);
      process.exit(0);
      return;
    }

    const food = commonFoods[index];
    db.run(
      `INSERT INTO food_items (name, calories, protein, carbs, fats, fiber, sugar, sodium, serving_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        food.name,
        food.calories,
        food.protein,
        food.carbs,
        food.fats,
        food.fiber,
        food.sugar,
        food.sodium,
        food.serving_size
      ],
      (err) => {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            skipped++;
            console.log(`⏭️  ${food.name} (déjà présent)`);
          } else {
            console.error(`❌ Erreur lors de l'ajout de ${food.name}:`, err.message);
          }
        } else {
          inserted++;
          console.log(`✅ ${food.name}`);
        }
        insertFood(index + 1);
      }
    );
  };

  insertFood(0);
}

// Run if called directly
if (require.main === module) {
  seedFoods();
}

module.exports = { seedFoods, commonFoods };

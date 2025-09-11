<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class IngredientesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $response = Http::get('https://dummyjson.com/recipes?sortBy=rating&order=desc');
        $ingredientes = [];

        if ($response->successful()) {
            $recipes = $response->json()['recipes'];

            foreach ($recipes as $recipe) {
                foreach ($recipe['ingredients'] as $ingredient) {
                    $ingredientes[$ingredient] = true;
                }
            }
        }

        $ingredientesAdicionales = [
            'Extra virgin olive oil',
            'Sherry vinegar',
            'Balsamic vinegar',
            'Dijon mustard',
            'Worcestershire sauce',
            'Hot sauce',
            'Sweet paprika',
            'Smoked paprika',
            'Curry powder',
            'Turmeric',
            'Fresh ginger',
            'Fresh cilantro',
            'Fresh parsley',
            'Fresh rosemary',
            'Fresh thyme',
            'Dried oregano',
            'Bay leaves',
            'Saffron',
            'Nutmeg',
            'Ground cinnamon',
            'Fresh yeast',
            'Baking powder',
            'Baking soda',
            'Whole wheat flour',
            'Almond flour',
            'Dark chocolate',
            'Milk chocolate',
            'Heavy whipping cream',
            'Evaporated milk',
            'Condensed milk',
            'Cream cheese',
            'Goat cheese',
            'Cheddar cheese',
            'Swiss cheese',
            'Serrano ham',
            'Chorizo',
            'Bacon',
            'Smoked salmon',
            'Anchovies',
            'Canned tuna',
            'Mussels',
            'Scallops',
            'Lobster',
            'Turkey',
            'Duck',
            'Veal',
            'Pork tenderloin',
            'Lamb chops',
            'Sweet potatoes',
            'Celery',
            'Leeks',
            'Eggplant',
            'Green bell peppers',
            'Yellow bell peppers',
            'Arugula',
            'Romaine lettuce',
            'Avocado',
            'Cauliflower',
            'Green beans',
            'Snow peas',
            'Black beans',
            'Kidney beans',
            'Lentils',
            'Brown rice',
            'Wild rice',
            'Whole wheat pasta',
            'Breadcrumbs',
            'Almonds',
            'Walnuts',
            'Pecans',
            'Pistachios',
            'Pine nuts',
            'Sunflower seeds',
            'Pumpkin seeds',
            'Lemons',
            'Limes',
            'Oranges',
            'Apples',
            'Pears',
            'Bananas',
            'Strawberries',
            'Blackberries',
            'Raspberries',
            'Dates',
            'Raisins',
            'Shredded coconut',
            'Coconut oil',
            'Sunflower oil',
            'Canola oil',
            'White wine',
            'Red wine',
            'Brandy',
            'Rum',
            'Vodka',
            'Whiskey',
            'Apple cider vinegar',
            'Rice vinegar',
            'Maple syrup',
            'Agave nectar',
            'Vanilla extract',
            'Almond extract',
            'Ground allspice',
            'Ground cardamom',
            'Ground cloves',
            'Star anise',
            'Fennel seeds',
            'Mustard seeds',
            'Poppy seeds',
            'Capers',
            'Sun-dried tomatoes',
            'Roasted bell peppers',
            'Artichoke hearts',
            'Hearts of palm'
        ];

        foreach ($ingredientesAdicionales as $ingrediente) {
            $ingredientes[$ingrediente] = true;
        }

        $ingredientes = array_keys($ingredientes);

        foreach ($ingredientes as $ingrediente) {
            DB::table('ingredientes')->insert([
                'nombre' => $ingrediente,
            ]);
        }
    }
}

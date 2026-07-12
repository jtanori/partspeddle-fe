import { supabaseAdmin } from '../../apps/web/src/lib/supabase-admin';

const VEHICLE_DATA = [
  {
    make: 'Ford',
    models: [
      { name: 'F-150', years: [2018, 2019, 2020, 2021, 2022] },
      { name: 'Mustang', years: [2017, 2018, 2019, 2020, 2021] },
      { name: 'Escape', years: [2016, 2017, 2018, 2019, 2020] },
    ],
  },
  {
    make: 'Chevrolet',
    models: [
      { name: 'Silverado', years: [2017, 2018, 2019, 2020, 2021] },
      { name: 'Camaro', years: [2016, 2017, 2018, 2019, 2020] },
      { name: 'Equinox', years: [2015, 2016, 2017, 2018, 2019] },
    ],
  },
  {
    make: 'Toyota',
    models: [
      { name: 'Camry', years: [2016, 2017, 2018, 2019, 2020] },
      { name: 'Corolla', years: [2015, 2016, 2017, 2018, 2019] },
      { name: 'RAV4', years: [2016, 2017, 2018, 2019, 2020] },
    ],
  },
  {
    make: 'Honda',
    models: [
      { name: 'Civic', years: [2015, 2016, 2017, 2018, 2019] },
      { name: 'Accord', years: [2016, 2017, 2018, 2019, 2020] },
      { name: 'CR-V', years: [2015, 2016, 2017, 2018, 2019] },
    ],
  },
  {
    make: 'Nissan',
    models: [
      { name: 'Altima', years: [2016, 2017, 2018, 2019, 2020] },
      { name: 'Sentra', years: [2015, 2016, 2017, 2018, 2019] },
      { name: 'Rogue', years: [2015, 2016, 2017, 2018, 2019] },
    ],
  },
];

async function seedVehicles() {
  console.log('🌱 Seeding vehicle taxonomy (makes, models, variants)...');

  for (const makeData of VEHICLE_DATA) {
    const { data: make, error: makeError } = await supabaseAdmin
      .from('makes')
      .upsert({ name: makeData.make }, { onConflict: 'name' })
      .select()
      .single();

    if (makeError || !make) {
      console.error(`❌ Failed to seed make ${makeData.make}:`, makeError?.message);
      continue;
    }

    for (const modelData of makeData.models) {
      const { data: model, error: modelError } = await supabaseAdmin
        .from('models')
        .upsert({ make_id: make.id, name: modelData.name }, { onConflict: 'make_id,name' })
        .select()
        .single();

      if (modelError || !model) {
        console.error(
          `❌ Failed to seed model ${makeData.make} ${modelData.name}:`,
          modelError?.message,
        );
        continue;
      }

      for (const year of modelData.years) {
        const { error: variantError } = await supabaseAdmin
          .from('vehicle_variants')
          .upsert({ model_id: model.id, year }, { onConflict: 'model_id,year' });

        if (variantError) {
          console.error(
            `❌ Failed to seed variant ${makeData.make} ${modelData.name} ${year}:`,
            variantError.message,
          );
        }
      }
    }
  }

  console.log('✅ Vehicle taxonomy seeded.');
}

seedVehicles().catch((err) => {
  console.error('💥 Critical failure seeding vehicles:', err);
  process.exit(1);
});

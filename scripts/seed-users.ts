import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ Error: Variables de entorno de Supabase faltantes en el entorno local.",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const MOCK_USERS = [
  // VENDEDORES (Sellers) - Usando Alias de Gmail
  {
    email: "jaime.tanori+seller1@gmail.com",
    password: "TestPassword2026!",
    role: "seller",
    meta: {
      full_name: "Jaime Tanori (Seller 1)",
      company: "Desert Auto Spares",
    },
  },
  {
    email: "jaime.tanori+seller2@gmail.com",
    password: "TestPassword2026!",
    role: "seller",
    meta: {
      full_name: "Jaime Tanori (Seller 2)",
      company: "Baja Pacific Parts",
    },
  },
  {
    email: "jaime.tanori+seller3@gmail.com",
    password: "TestPassword2026!",
    role: "seller",
    meta: {
      full_name: "Jaime Tanori (Seller 3)",
      company: "Borderline Dismantlers",
    },
  },
  // COMPRADORES (Buyers) - Usando Alias de Gmail
  {
    email: "jaime.tanori+buyer1@gmail.com",
    password: "TestPassword2026!",
    role: "buyer",
    meta: {
      full_name: "Jaime Tanori (Buyer 1)",
      company: "Taller Mecánico Ruiz",
    },
  },
  {
    email: "jaime.tanori+buyer2@gmail.com",
    password: "TestPassword2026!",
    role: "buyer",
    meta: { full_name: "Jaime Tanori (Buyer 2)", company: "Particular" },
  },
  {
    email: "jaime.tanori+buyer3@gmail.com",
    password: "TestPassword2026!",
    role: "buyer",
    meta: {
      full_name: "Jaime Tanori (Buyer 3)",
      company: "Arce Reconstructores",
    },
  },
];

async function seedUsers() {
  console.log(
    "🌱 Iniciando la siembra de usuarios con alias personalizados...",
  );

  for (const mockUser of MOCK_USERS) {
    console.log(`\n🔄 Creando cuenta de autenticación para: ${mockUser.email}`);

    // 1. Inserción directa en el esquema auth.users
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: mockUser.email,
        password: mockUser.password,
        email_confirm: true,
        user_metadata: { role: mockUser.role, ...mockUser.meta },
      });

    if (authError) {
      if (
        authError.message.includes("already exists") ||
        (authError as any).status === 422
      ) {
        console.log(
          `⚠️ El alias ${mockUser.email} ya está registrado. Saltando al siguiente...`,
        );
        continue;
      }
      console.error(
        `❌ Error al registrar en auth para ${mockUser.email}:`,
        authError.message,
      );
      continue;
    }

    const userId = authData.user?.id;
    if (!userId) continue;
    console.log(`✅ Registro de autenticación exitoso (ID: ${userId})`);

    // 1.5. Hidratar la tabla public.users para todos los usuarios
    console.log(`📤 Sincronizando en 'public.users' para: ${mockUser.email}`);
    const { error: userSyncError } = await supabaseAdmin.from("users").upsert(
      {
        id: userId,
        email: mockUser.email,
        full_name: mockUser.meta.full_name,
        role: mockUser.role,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (userSyncError) {
      console.error(
        `❌ Error al sincronizar public.users para ${mockUser.email}:`,
        userSyncError.message,
      );
    }

    // 2. Hidratación de tablas públicas de perfiles según el rol
    if (mockUser.role === "seller") {
      console.log(
        `📤 Creando registro en 'seller_profiles' para el negocio: ${mockUser.meta.company}`,
      );

      const { error: sellerError } = await supabaseAdmin
        .from("seller_profiles")
        .upsert(
          {
            user_id: userId,
            business_name: mockUser.meta.company,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (sellerError) {
        console.error(
          `❌ Error en tabla 'seller_profiles' para ID ${userId}:`,
          sellerError.message,
        );
      }
    }
  }

  console.log("\n✨ Proceso de siembra de usuarios finalizado con éxito.");
}

seedUsers().catch((err) => {
  console.error(
    "💥 Fallo crítico en el hilo de ejecución del script de usuarios:",
    err,
  );
});

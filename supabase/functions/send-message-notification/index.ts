import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch: fetch.bind(globalThis) },
  auth: { persistSession: false },
});

function unauthorized(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyUserJwt(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { fetch: fetch.bind(globalThis) },
    auth: { persistSession: false },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const callerId = await verifyUserJwt(req);
  if (!callerId) {
    return unauthorized("Missing or invalid authorization token");
  }

  try {
    const payload = await req.json();
    const { record } = payload; // El registro insertado en 'messages'

    if (!record) {
      throw new Error("No record found in payload");
    }

    // 1. Obtener los detalles de la conversación y quién es el otro participante
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("buyer_id, seller_id")
      .eq("id", record.conversation_id)
      .single();

    if (convError) throw convError;

    // 2. Determinar el destinatario (quien no envió el mensaje)
    const recipientId = record.sender_id === conversation.buyer_id
      ? conversation.seller_id
      : conversation.buyer_id;

    // 3. Verificar que el usuario autenticado participa en la conversación
    if (callerId !== record.sender_id && callerId !== recipientId) {
      return unauthorized("User is not a participant in this conversation");
    }

    // 4. Obtener el email del destinatario para la notificación
    const { error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", recipientId)
      .single();

    if (userError) throw userError;

    // Evitar loggear PII; solo registramos identificadores opacos
    console.log(
      `Notification queued: conversation=${record.conversation_id}, recipient=${recipientId}`,
    );

    // 5. Implementación de la notificación (aquí integrarías Resend, SendGrid o Firebase Push)
    // Por ahora, simulamos el log de envío
    // await sendEmail(user.email, "Nuevo mensaje en PartsPeddle", record.content);

    return new Response(JSON.stringify({ message: "Notification processed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Notification Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

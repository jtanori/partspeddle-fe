export interface SellerProfile {
  id: string;
  business_name: string | null;
  location: string | null;
  whatsapp: string | null;
  verification_status: string | null;
  created_at: string;
  users?: { avatar_url: string | null }[] | null;
}

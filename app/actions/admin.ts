'use server';

import { createClient } from '@supabase/supabase-js';

function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está configurada no .env.local");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function deleteUserAction(userId: string) {
  try {
    const supabase = getServiceRoleClient();
    
    const { data, error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error("Erro ao deletar usuário pelo admin API:", error);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
    }
    
    return { success: true };
  } catch (err: any) {
    console.error("Erro em deleteUserAction:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteEntityAction(entityId: string) {
  try {
    const supabase = getServiceRoleClient();
    
    const { error } = await supabase
      .from('entidades')
      .delete()
      .eq('id', entityId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (err: any) {
    console.error("Erro em deleteEntityAction:", err);
    return { success: false, error: err.message };
  }
}

export async function approveClaim(claimId: string, reviewedBy?: string) {
  try {
    const supabase = getServiceRoleClient();

    const { data: claim, error: fetchError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .single();

    if (fetchError || !claim) throw fetchError || new Error('Claim não encontrada');

    const { error: updateError } = await supabase
      .from(claim.target_table)
      .update({
        claimed_by: claim.user_id,
        claimed_at: new Date().toISOString(),
        is_claimed: true
      })
      .eq('id', claim.target_id);

    if (updateError) throw updateError;

    const { error: claimError } = await supabase
      .from('claims')
      .update({
        status: 'approved',
        reviewed_by: reviewedBy || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (claimError) throw claimError;

    return { success: true };
  } catch (err: any) {
    console.error("Erro em approveClaim:", err);
    return { success: false, error: err.message };
  }
}

export async function rejectClaim(claimId: string, reviewedBy?: string) {
  try {
    const supabase = getServiceRoleClient();

    const { error } = await supabase
      .from('claims')
      .update({
        status: 'rejected',
        reviewed_by: reviewedBy || null,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', claimId);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Erro em rejectClaim:", err);
    return { success: false, error: err.message };
  }
}

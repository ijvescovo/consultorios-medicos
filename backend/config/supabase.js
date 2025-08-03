const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'tu-anon-key';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    realtime: {
        enabled: true
    }
});

// Cliente con privilegios de servicio (para operaciones admin)
const supabaseAdmin = createClient(
    supabaseUrl, 
    process.env.SUPABASE_SERVICE_KEY || 'tu-service-key',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

module.exports = {
    supabase,
    supabaseAdmin
};

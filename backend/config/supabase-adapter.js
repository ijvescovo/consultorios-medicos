const { supabase, supabaseAdmin } = require('./supabase');

/**
 * Adaptador para mantener compatibilidad con Sequelize
 * mientras usamos Supabase como backend
 */

class SupabaseAdapter {
    constructor(tableName) {
        this.tableName = tableName;
        this.client = supabase;
        this.adminClient = supabaseAdmin;
    }

    // Simular Sequelize.findOne()
    async findOne(options = {}) {
        let query = this.client.from(this.tableName).select('*');
        
        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') { // No rows found
            throw error;
        }
        
        return data;
    }

    // Simular Sequelize.findAll()
    async findAll(options = {}) {
        let query = this.client.from(this.tableName).select('*');
        
        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                if (typeof value === 'object' && value.iLike) {
                    query = query.ilike(key, value.iLike);
                } else {
                    query = query.eq(key, value);
                }
            });
        }
        
        if (options.order) {
            const [column, direction] = options.order[0];
            query = query.order(column, { ascending: direction === 'ASC' });
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        if (options.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        return data;
    }

    // Simular Sequelize.findAndCountAll()
    async findAndCountAll(options = {}) {
        const rows = await this.findAll(options);
        
        // Contar total sin límites
        let countQuery = this.client.from(this.tableName).select('*', { count: 'exact', head: true });
        
        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                if (typeof value === 'object' && value.iLike) {
                    countQuery = countQuery.ilike(key, value.iLike);
                } else {
                    countQuery = countQuery.eq(key, value);
                }
            });
        }
        
        const { count, error } = await countQuery;
        if (error) throw error;
        
        return { rows, count };
    }

    // Simular Sequelize.create()
    async create(data) {
        const { data: result, error } = await this.adminClient
            .from(this.tableName)
            .insert(data)
            .select()
            .single();
            
        if (error) throw error;
        return result;
    }

    // Simular Sequelize.findByPk()
    async findByPk(id, options = {}) {
        let query = this.client.from(this.tableName).select('*').eq('id', id);
        
        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        return data;
    }

    // Simular Sequelize.update()
    async update(data, options = {}) {
        let query = this.adminClient.from(this.tableName).update(data);
        
        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data: result, error } = await query.select();
        if (error) throw error;
        
        return [result.length, result];
    }

    // Simular Sequelize.destroy()
    async destroy(options = {}) {
        let query = this.adminClient.from(this.tableName).delete();
        
        if (options.where) {
            Object.entries(options.where).forEach(([key, value]) => {
                query = query.eq(key, value);
            });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        return data ? data.length : 0;
    }
}

// Crear modelos compatibles
const Usuario = new SupabaseAdapter('usuarios');
const Medico = new SupabaseAdapter('medicos');
const Paciente = new SupabaseAdapter('pacientes');
const Cita = new SupabaseAdapter('citas');
const HistorialMedico = new SupabaseAdapter('historiales_medicos');
const LogAuditoria = new SupabaseAdapter('logs_auditoria');

module.exports = {
    Usuario,
    Medico,
    Paciente,
    Cita,
    HistorialMedico,
    LogAuditoria,
    supabase,
    supabaseAdmin
};

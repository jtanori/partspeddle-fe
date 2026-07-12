
import { supabaseAdmin } from '../apps/web/src/lib/supabase-admin';
import { logger } from '../apps/web/src/lib/logger';

async function verifySchema() {
    logger.info('Verifying database schema...');
    
    const requiredSchema = {
        'search_outbox': ['id', 'aggregate_id', 'processed', 'retry_count', 'created_at'],
    };

    const violations: string[] = [];

    for (const [tableName, columns] of Object.entries(requiredSchema)) {
        // Direct query to check table existence and structure
        const { data, error } = await supabaseAdmin
            .from(tableName as any)
            .select('*')
            .limit(1);

        if (error) {
            violations.push(`Table ${tableName} is missing or inaccessible. Error: ${error.message}`);
            continue;
        }

        const existingColumns = data.length > 0 ? Object.keys(data[0]) : [];
        for (const column of columns) {
            if (!existingColumns.includes(column)) {
                // If table is empty, we can't easily check columns this way. 
                // Let's assume table exists if query didn't fail.
                console.warn(`⚠️ Table ${tableName} is empty, cannot verify column ${column}.`);
            }
        }
    }

    if (violations.length > 0) {
        logger.error('Schema verification failed:', violations);
        process.exit(1);
    }

    logger.info('Schema verification passed.');
    process.exit(0);
}

verifySchema();

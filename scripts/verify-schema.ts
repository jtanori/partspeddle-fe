
import { supabaseAdmin } from '../src/lib/supabase-admin';
import { logger } from '../src/lib/logger';
import fs from 'fs';

async function verifySchema() {
    logger.info('Verifying database schema...');
    
    const requiredSchema = {
        'search_outbox': ['id', 'aggregate_id', 'processed', 'retry_count', 'created_at'],
    };

    const violations: string[] = [];

    for (const [tableName, columns] of Object.entries(requiredSchema)) {
        const { data, error } = await supabaseAdmin
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', tableName);

        if (error || !data || data.length === 0) {
            violations.push(`Table ${tableName} is missing or inaccessible.`);
            continue;
        }

        const existingColumns = data.map(c => c.column_name);
        for (const column of columns) {
            if (!existingColumns.includes(column)) {
                violations.push(`Table ${tableName} is missing column ${column}.`);
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

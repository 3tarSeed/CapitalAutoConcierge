import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const leads=sqliteTable('leads',{
 id:text('id').primaryKey(), owner:text('owner').notNull(), created:integer('created').notNull(),
 data:text('data').notNull(),status:text('status').notNull().default('New'),notes:text('notes').notNull().default(''),
 assignee:text('assignee').notNull().default(''),followup:text('followup').notNull().default('')
},t=>[index('leads_owner_created').on(t.owner,t.created)]);

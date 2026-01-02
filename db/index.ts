import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

// Import all schema files
import * as authSchema from './schema/auth';
import * as profilesSchema from './schema/profiles';
import * as portfolioProjectsSchema from './schema/portfolio-projects';
import * as skillsSchema from './schema/skills';
import * as portfolioProjectSkillsSchema from './schema/portfolio-project-skills'; // Added this
import * as experiencesSchema from './schema/experiences';
import * as testimonialsSchema from './schema/testimonials';
import * as serviceCategoriesSchema from './schema/service-categories';
import * as servicesSchema from './schema/services';
import * as ordersSchema from './schema/orders';
import * as digitalProductsSchema from './schema/digital-products';
import * as purchasesSchema from './schema/purchases';
import * as paymentsSchema from './schema/payments';
import * as announcementsSchema from './schema/announcements';
import * as messagesSchema from './schema/messages';
import * as notificationsSchema from './schema/notifications';

export const db = drizzle(process.env.DATABASE_URL!);

// Export all schemas for migration
export const schema = {
    ...authSchema,
    ...profilesSchema,
    ...portfolioProjectsSchema,
    ...skillsSchema,
    ...portfolioProjectSkillsSchema,
    ...experiencesSchema,
    ...testimonialsSchema,
    ...serviceCategoriesSchema,
    ...servicesSchema,
    ...ordersSchema,
    ...digitalProductsSchema,
    ...purchasesSchema,
    ...paymentsSchema,
    ...announcementsSchema,
    ...messagesSchema,
    ...notificationsSchema,
};
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// This file is created to handle the many-to-many relationship between portfolio projects and skills
// It's separate to avoid circular dependencies between the portfolio-projects and skills schemas
export const portfolioProjectSkills = pgTable("portfolio_project_skills", {
    id: text("id").primaryKey().notNull(),
    projectId: text("project_id").notNull(), // Will reference portfolio_projects.id
    skillId: text("skill_id").notNull(), // Will reference skills.id
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Indexes
export const idxPortfolioProjectSkillsProjectId = portfolioProjectSkills.projectId;
export const idxPortfolioProjectSkillsSkillId = portfolioProjectSkills.skillId;
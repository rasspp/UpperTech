"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Code,
  Monitor,
  Database,
  Cloud,
  Palette,
  Wrench,
  type LucideIcon 
} from "lucide-react";
import { Skill } from "@/types/skill";

interface SkillsMatrixProps {
  skills: Skill[];
  loading?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "design" | "other";
  level: number; // 1-100 percentage
  icon?: string;
  description?: string;
  yearsOfExperience?: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function SkillsMatrix({ skills, loading = false }: SkillsMatrixProps) {
  const getCategoryIcon = (category: string): LucideIcon => {
    switch (category) {
      case "frontend": return Code;
      case "backend": return Monitor;
      case "database": return Database;
      case "devops": return Cloud;
      case "design": return Palette;
      default: return Wrench;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "frontend": return "from-blue-500 to-cyan-500";
      case "backend": return "from-purple-500 to-indigo-500";
      case "database": return "from-emerald-500 to-teal-500";
      case "devops": return "from-amber-500 to-orange-500";
      case "design": return "from-pink-500 to-rose-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 rounded-full w-10 h-10" />
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded-full mb-2" />
              <div className="h-3 bg-gray-200 rounded-full w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory: Record<string, Skill[]> = {};
  skills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  return (
    <div className="space-y-8">
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => {
        const IconComponent = getCategoryIcon(category);
        const colorClass = getCategoryColor(category);
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClass}`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold capitalize">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySkills.map((skill) => (
                <Card key={skill.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{skill.name}</span>
                      <Badge variant="secondary">{skill.level}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Proficiency</span>
                        <span>{skill.yearsOfExperience ? `${skill.yearsOfExperience} years` : ""}</span>
                      </div>
                      <Progress value={skill.level} className="h-2" />
                    </div>
                    {skill.description && (
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Github, 
  Calendar,
  User,
  Code,
  Monitor,
  Smartphone,
  Globe,
  Star,
  Eye,
  Download,
  Play
} from "lucide-react";
import { PortfolioProject } from "@/types/portfolio";

interface PortfolioShowcaseProps {
  projects: PortfolioProject[];
  loading?: boolean;
  showAll?: boolean;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  imageUrl?: string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  technologies: string[];
  category: "web" | "mobile" | "desktop" | "other";
  featured: boolean;
  status: "completed" | "in_progress" | "planned";
  startDate?: string;
  endDate?: string;
  client?: string;
  projectType?: "freelance" | "personal" | "open_source" | "commercial";
  tags: string[];
  slug: string;
  views: number;
  likes: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function PortfolioShowcase({ projects, loading = false, showAll = true }: PortfolioShowcaseProps) {
  const [displayedProjects, setDisplayedProjects] = useState<PortfolioProject[]>([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (showAll) {
      setDisplayedProjects(projects);
    } else {
      // Show only featured projects
      setDisplayedProjects(projects.filter(project => project.featured));
    }
  }, [projects, showAll]);

  const handleShowMore = () => {
    if (showMore) {
      setDisplayedProjects(projects.slice(0, 6));
    } else {
      setDisplayedProjects(projects);
    }
    setShowMore(!showMore);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "web": return <Globe className="w-4 h-4" />;
      case "mobile": return <Smartphone className="w-4 h-4" />;
      case "desktop": return <Monitor className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "planned": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="bg-gray-200 h-48 w-full" />
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-20 bg-gray-200 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProjects.map((project) => (
          <Card key={project.id} className="overflow-hidden flex flex-col h-full">
            {project.imageUrl && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {project.demoUrl && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(project.demoUrl, "_blank")}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  {project.sourceCodeUrl && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(project.sourceCodeUrl, "_blank")}
                    >
                      <Github className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <Badge className={getStatusBadgeVariant(project.status)}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getCategoryIcon(project.category)}
                <span className="capitalize">{project.category}</span>
                {project.client && (
                  <>
                    <User className="w-4 h-4" />
                    <span>{project.client}</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="mb-4">
                {project.shortDescription || project.description.substring(0, 120) + "..."}
              </CardDescription>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="secondary">{tech}</Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="outline">+{project.technologies.length - 3} more</Badge>
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{project.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{project.likes}</span>
                  </div>
                </div>
                {project.startDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString()}
                      {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {showAll && projects.length > 6 && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleShowMore} variant="outline">
            {showMore ? "Show Less" : `Show All (${projects.length}) Projects`}
          </Button>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Download,
  Code,
  Eye,
  FileText,
  Star,
  Shield,
  Key,
  Package,
  ExternalLink,
  ShoppingCart
} from "lucide-react";
import { DigitalProduct } from "@/types/digital-product";

interface DigitalProductMarketplaceProps {
  products: DigitalProduct[];
  loading?: boolean;
  onPurchase?: (productId: string) => void;
}

export interface DigitalProduct {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: "template" | "script" | "full_project" | "plugin" | "theme" | "other";
  price: string; // Stored as string to handle decimal values
  currency: string;
  thumbnailUrl?: string;
  demoUrl?: string;
  downloadUrl: string;
  sourceCodeUrl?: string;
  previewCode?: string;
  documentationUrl?: string;
  techStack: string[];
  features: string[];
  licenseType: "personal" | "commercial" | "extended" | "open_source";
  licenseTerms?: string;
  fileSize?: number; // File size in bytes
  downloadLimit?: number;
  salesCount: number;
  isActive: boolean;
  isPublic: boolean;
  tags: string[];
  version: string;
  changelog?: Array<{ version: string; date: string; changes: string[] }>;
  supportEmail?: string;
  demoCredentials?: { username?: string; password?: string };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function DigitalProductMarketplace({ products, loading = false, onPurchase }: DigitalProductMarketplaceProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="bg-gray-200 h-48 w-full" />
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col h-full">
          {product.thumbnailUrl && (
            <div className="h-48 overflow-hidden">
              <img 
                src={product.thumbnailUrl} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{product.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize">
                    {product.category.replace('_', ' ')}
                  </Badge>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{product.currency} {product.price}</div>
                <div className="text-xs text-muted-foreground">{product.salesCount} sales</div>
              </div>
            </div>
            <CardDescription>
              {product.shortDescription || product.description.substring(0, 80) + "..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Tech Stack:</h4>
              <div className="flex flex-wrap gap-1">
                {product.techStack.slice(0, 3).map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {product.techStack.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.techStack.length - 3}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                {product.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Package className="w-3 h-3 text-blue-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                {product.features.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    +{product.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{product.licenseType}</span>
              </div>
              {product.version && (
                <div className="flex items-center gap-1">
                  <span>v{product.version}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              {product.demoUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(product.demoUrl, "_blank")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Demo
                </Button>
              )}
              {product.documentationUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(product.documentationUrl, "_blank")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Docs
                </Button>
              )}
            </div>
            <Button 
              className="w-full mt-2" 
              onClick={() => onPurchase?.(product.id)}
              disabled={!product.isActive}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {product.isActive ? "Purchase" : "Unavailable"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
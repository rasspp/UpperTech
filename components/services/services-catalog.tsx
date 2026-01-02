"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Star,
  Calendar,
  FileText,
  MessageCircle,
  ShoppingCart
} from "lucide-react";
import { Service } from "@/types/service";

interface ServicesCatalogProps {
  services: Service[];
  loading?: boolean;
  onBookService?: (serviceId: string) => void;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  price: string; // Stored as string to handle decimal values
  currency: string;
  duration?: number; // Duration in days
  deliveryTime?: number; // Delivery time in days
  features: string[];
  revisions?: number;
  isActive: boolean;
  isPublic: boolean;
  thumbnailUrl?: string;
  faqs?: Array<{ question: string; answer: string }>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesCatalog({ services, loading = false, onBookService }: ServicesCatalogProps) {
  const [expandedFaq, setExpandedFaq] = useState<Record<string, boolean>>({});

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

  const toggleFaq = (serviceId: string, index: number) => {
    const key = `${serviceId}-${index}`;
    setExpandedFaq(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <Card key={service.id} className="flex flex-col h-full">
          {service.thumbnailUrl && (
            <div className="h-48 overflow-hidden">
              <img 
                src={service.thumbnailUrl} 
                alt={service.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{service.title}</CardTitle>
              <Badge variant={service.isActive ? "default" : "secondary"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <CardDescription>
              {service.shortDescription || service.description.substring(0, 100) + "..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold">{service.currency} {service.price}</span>
              </div>
              {service.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} days</span>
                </div>
              )}
              {service.deliveryTime && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{service.deliveryTime} days delivery</span>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                {service.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                {service.features.length > 3 && (
                  <li className="text-sm text-muted-foreground">
                    +{service.features.length - 3} more features
                  </li>
                )}
              </ul>
            </div>
            
            {service.faqs && service.faqs.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">FAQs:</h4>
                <div className="space-y-2">
                  {service.faqs.slice(0, 2).map((faq, index) => (
                    <div key={index} className="border rounded-lg">
                      <button
                        className="w-full p-3 text-left flex justify-between items-center"
                        onClick={() => toggleFaq(service.id, index)}
                      >
                        <span className="font-medium">{faq.question}</span>
                        <span>{expandedFaq[`${service.id}-${index}`] ? "−" : "+"}</span>
                      </button>
                      {expandedFaq[`${service.id}-${index}`] && (
                        <div className="p-3 pt-0 text-sm text-muted-foreground border-t">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              onClick={() => onBookService?.(service.id)}
              disabled={!service.isActive}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {service.isActive ? "Book Service" : "Service Unavailable"}
            </Button>
            {service.revisions !== undefined && (
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <Star className="w-4 h-4 mr-1" />
                <span>{service.revisions} revision{service.revisions !== 1 ? 's' : ''}</span>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
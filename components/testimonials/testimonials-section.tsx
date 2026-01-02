"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { Testimonial } from "@/types/testimonial";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  loading?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  title?: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number; // 1-5 stars
  isPublic: boolean;
  verified: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function TestimonialsSection({ testimonials, loading = false }: TestimonialsSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 rounded-full w-12 h-12" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-gray-200 rounded-full mr-1" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-4/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <Avatar>
                {testimonial.avatar ? (
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                ) : null}
                <AvatarFallback>
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {testimonial.title && <p>{testimonial.title}</p>}
                  {testimonial.company && <p>{testimonial.company}</p>}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < testimonial.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-muted-foreground italic">"{testimonial.content}"</p>
            {testimonial.verified && (
              <div className="mt-3 flex items-center text-xs text-green-600">
                <span className="h-2 w-2 bg-green-600 rounded-full mr-2"></span>
                Verified Customer
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
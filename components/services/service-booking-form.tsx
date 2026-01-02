"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, MessageCircle, ShoppingCart, CheckCircle } from "lucide-react";
import { Service } from "@/types/service";

interface ServiceBookingFormProps {
  service: Service;
  onSubmit: (bookingData: any) => void;
  onCancel: () => void;
}

export default function ServiceBookingForm({ service, onSubmit, onCancel }: ServiceBookingFormProps) {
  const [requirements, setRequirements] = useState("");
  const [attachments, setAttachments] = useState<FileList | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData = {
      serviceId: service.id,
      title: service.title,
      description: service.description,
      amount: parseFloat(service.price),
      currency: service.currency,
      requirements: { 
        requirements,
        estimatedDelivery,
        notes
      },
      attachments: attachments ? Array.from(attachments).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      })) : [],
    };
    
    onSubmit(bookingData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <CardTitle>Book Service: {service.title}</CardTitle>
        </div>
        <CardDescription>
          Fill out the details below to book this service
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{service.currency} {service.price}</p>
              {service.duration && (
                <p className="text-sm text-muted-foreground">{service.duration} days</p>
              )}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="requirements">Project Requirements</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe your project requirements in detail..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  id="estimatedDelivery"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={(e) => setAttachments(e.target.files)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Upload any documents, designs, or specifications that will help with your project
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <CheckCircle className="w-4 h-4 mr-2" />
            Confirm Booking
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
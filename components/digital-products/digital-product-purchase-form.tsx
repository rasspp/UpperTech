"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, CreditCard, Key, ShoppingCart, CheckCircle } from "lucide-react";
import { DigitalProduct } from "@/types/digital-product";

interface DigitalProductPurchaseFormProps {
  product: DigitalProduct;
  onSubmit: (purchaseData: any) => void;
  onCancel: () => void;
}

export default function DigitalProductPurchaseForm({ product, onSubmit, onCancel }: DigitalProductPurchaseFormProps) {
  const [licenseType, setLicenseType] = useState<"personal" | "commercial" | "extended">("personal");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const licenseOptions = [
    { 
      type: "personal", 
      name: "Personal License", 
      description: "For single personal project use",
      price: parseFloat(product.price),
      features: ["1 project", "No commercial use", "Basic support"]
    },
    { 
      type: "commercial", 
      name: "Commercial License", 
      description: "For single commercial project use",
      price: parseFloat(product.price) * 2,
      features: ["1 commercial project", "Commercial use allowed", "Priority support"]
    },
    { 
      type: "extended", 
      name: "Extended License", 
      description: "For multiple commercial project use",
      price: parseFloat(product.price) * 5,
      features: ["Unlimited projects", "Commercial use allowed", "Premium support", "Source code included"]
    }
  ];

  const selectedLicense = licenseOptions.find(option => option.type === licenseType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      alert("Please accept the license terms and conditions");
      return;
    }
    
    const purchaseData = {
      productId: product.id,
      licenseType,
      amount: selectedLicense?.price,
      currency: product.currency,
    };
    
    onSubmit(purchaseData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <CardTitle>Purchase: {product.title}</CardTitle>
        </div>
        <CardDescription>
          Select your license type and complete the purchase
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">{product.title}</h3>
              <p className="text-sm text-muted-foreground">{product.shortDescription}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Starting at</p>
              <p className="text-2xl font-bold">{product.currency} {product.price}</p>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-4">Select License Type</h3>
            <RadioGroup value={licenseType} onValueChange={(value) => setLicenseType(value as any)} className="grid gap-4">
              {licenseOptions.map((option) => (
                <div 
                  key={option.type} 
                  className={`flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                    licenseType === option.type ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem 
                    value={option.type} 
                    id={option.type}
                    className="mt-0.5"
                  />
                  <div className="space-y-1 flex-1">
                    <Label htmlFor={option.type} className="text-sm font-medium">
                      {option.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {option.description} • {option.price.toFixed(2)} {product.currency}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1"
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                I agree to the <a href="#" className="text-primary hover:underline">license terms and conditions</a>
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="w-full flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Total</p>
              <p className="text-sm text-muted-foreground">License: {selectedLicense?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{product.currency} {selectedLicense?.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">VAT included</p>
            </div>
          </div>
          <div className="flex justify-between w-full">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!acceptTerms}>
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Purchase
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
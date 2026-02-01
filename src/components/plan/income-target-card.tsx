"use client";

/**
 * Income Target Card Component
 * Displays and allows editing of expected monthly income
 */

import { useState } from "react";
import { Pencil, Check, X, Loader2, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { createPlanService } from "@/lib/services";

interface IncomeTargetCardProps {
  expectedIncome: number;
  onUpdate: () => void;
}

export function IncomeTargetCard({
  expectedIncome,
  onUpdate,
}: IncomeTargetCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState(expectedIncome.toString());

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const service = createPlanService(supabase);

      const numValue = parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
      const result = await service.updateExpectedIncome(numValue);

      if (!result.error) {
        setIsEditing(false);
        onUpdate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(expectedIncome.toString());
    setIsEditing(false);
  };

  return (
    <Card className="bg-linear-to-br from-card to-card/80 border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Expected Income
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="font-mono-numbers text-lg"
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 text-chart-2" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold font-mono-numbers">
              {formatCurrency(expectedIncome, "CZK")}
            </p>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

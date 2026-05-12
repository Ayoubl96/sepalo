'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeneficiarySchema } from '@sepalo/core';
import type { Beneficiary } from '@sepalo/core';
import { useForm } from 'react-hook-form';

interface BeneficiaryFormProps {
  defaultValues?: Beneficiary | undefined;
  onSave: (data: Beneficiary) => Promise<void>;
  onCancel: () => void;
}

const EMPTY: Beneficiary = { name: '', iban: '', bic: '' };

export function BeneficiaryForm({ defaultValues, onSave, onCancel }: BeneficiaryFormProps) {
  const form = useForm<Beneficiary>({
    resolver: zodResolver(BeneficiarySchema),
    defaultValues: defaultValues ?? EMPTY,
  });

  async function handleSubmit(data: Beneficiary) {
    const cleaned = { ...data, bic: data.bic || undefined };
    await onSave(cleaned);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Rossi Mario" maxLength={70} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iban"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IBAN</FormLabel>
              <FormControl>
                <Input
                  placeholder="IT60 X054 2811 1010 0000 0123 456"
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>BIC / SWIFT (optional)</FormLabel>
              <FormControl>
                <Input placeholder="BCITITMM" className="font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}

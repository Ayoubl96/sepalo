'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { InitiatorSchema } from '@sepalo/core';
import type { Initiator } from '@sepalo/core';
import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ProfileFormProps {
  defaultValues?: Initiator | null;
  onSave: (data: Initiator) => Promise<void>;
}

const EMPTY: Initiator = {
  name: '',
  identifier: { type: 'CUC', value: '' },
  iban: '',
  abi: '',
};

export function ProfileForm({ defaultValues, onSave }: ProfileFormProps) {
  const [saved, setSaved] = useState(false);

  const form = useForm<Initiator>({
    resolver: zodResolver(InitiatorSchema),
    defaultValues: defaultValues ?? EMPTY,
  });

  async function handleSubmit(data: Initiator) {
    await onSave(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company / Account holder name</FormLabel>
              <FormControl>
                <Input placeholder="Acme S.r.l." maxLength={70} {...field} />
              </FormControl>
              <FormDescription>
                Appears in the XML as initiator and debtor name (max 70 chars).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-[160px_1fr] gap-3 items-start">
          <FormField
            control={form.control}
            name="identifier.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID type</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v);
                    form.setValue('identifier.value', '');
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CUC">CUC</SelectItem>
                    <SelectItem value="CF">CF</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identifier.value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {form.watch('identifier.type') === 'CUC' ? 'CUC code' : 'Codice Fiscale'}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      form.watch('identifier.type') === 'CUC' ? 'ABCD1234' : 'RSSMRA80A01H501U'
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              <FormDescription>Your bank account from which payments are debited.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="abi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ABI code</FormLabel>
              <FormControl>
                <Input placeholder="05428" maxLength={5} className="font-mono w-32" {...field} />
              </FormControl>
              <FormDescription>5-digit Italian bank code (ABI).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting || saved}>
          {saved ? (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Saved
            </>
          ) : (
            'Save profile'
          )}
        </Button>
      </form>
    </Form>
  );
}

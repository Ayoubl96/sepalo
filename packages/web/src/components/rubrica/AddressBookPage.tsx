'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAddressBook } from '@/hooks/useAddressBook';
import type { BookEntry } from '@/hooks/useAddressBook';
import type { Beneficiary } from '@sepalo/core';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { BeneficiaryForm } from './BeneficiaryForm';

type DialogState = { mode: 'closed' } | { mode: 'add' } | { mode: 'edit'; entry: BookEntry };

export function AddressBookPage() {
  const { entries, loading, addEntry, updateEntry, removeEntry } = useAddressBook();
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });

  async function handleSave(data: Beneficiary) {
    if (dialog.mode === 'add') {
      await addEntry(data);
    } else if (dialog.mode === 'edit') {
      await updateEntry(dialog.entry.id, data);
    }
    setDialog({ mode: 'closed' });
  }

  const isOpen = dialog.mode !== 'closed';
  const editDefaults = dialog.mode === 'edit' ? dialog.entry : undefined;

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Address book</h1>
          <p className="mt-1 text-sm text-muted">Saved beneficiaries for quick payment setup.</p>
        </div>
        <Button onClick={() => setDialog({ mode: 'add' })}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add beneficiary
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-16 text-center">
          <p className="text-sm text-muted">No beneficiaries yet.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-primary"
            onClick={() => setDialog({ mode: 'add' })}
          >
            Add your first beneficiary
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-line overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IBAN</TableHead>
                <TableHead>BIC</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.name}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.iban}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.bic ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDialog({ mode: 'edit', entry })}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-error hover:text-error"
                            onClick={() => removeEntry(entry.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open && setDialog({ mode: 'closed' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.mode === 'edit' ? 'Edit beneficiary' : 'Add beneficiary'}
            </DialogTitle>
          </DialogHeader>
          {isOpen && (
            <BeneficiaryForm
              key={dialog.mode === 'edit' ? dialog.entry.id : 'add'}
              defaultValues={editDefaults}
              onSave={handleSave}
              onCancel={() => setDialog({ mode: 'closed' })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

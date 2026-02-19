'use client';

import { useActionState } from 'react';
import { createProjectAction } from '@/app/actions/project.actions';
import Button from '@/app/components/ui/Button';
import InputField from '@/app/components/ui/InputField';
import Link from 'next/link';

const initialState = {
  success: false,
  error: '',
};

export default function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction as any, initialState);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
      
      <form action={formAction} className="space-y-6">
        <InputField
          label="Project Name"
          name="name"
          placeholder="e.g. My Awesome App"
          required
        />
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">
            Description / Prompt
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
            placeholder="Describe what you want to build..."
            required
          />
        </div>

        {state?.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {state.error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}

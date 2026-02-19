'use client';

import { useActionState } from 'react';
import { updateProjectAction } from '@/app/actions/project.actions';
import Button from '@/app/components/ui/Button';
import InputField from '@/app/components/ui/InputField';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';

const initialState = {
  success: false,
  error: '',
};

interface EditFormProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function EditProjectForm({ project }: EditFormProps) {
  const [state, formAction] = useActionState(updateProjectAction as any, initialState);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-xl border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6">Edit Project</h2>
      
      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={project.id} />
        
        <InputField
          label="Project Name"
          name="name"
          defaultValue={project.name}
          required
        />
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={project.description}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
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
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save Changes'}
    </Button>
  );
}

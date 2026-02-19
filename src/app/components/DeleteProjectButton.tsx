import { deleteProjectAction } from '@/app/actions/project.actions';
import Button from '@/app/components/ui/Button';

export default function DeleteProjectButton({ id }: { id: string }) {
  // We use a form to invoke server action
  const deleteWithId = deleteProjectAction.bind(null, id);
  
  return (
    <form action={deleteWithId as any}>
      <button 
        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
        type="submit"
      >
        Delete
      </button>
    </form>
  );
}

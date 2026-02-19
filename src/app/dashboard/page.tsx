import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';
import { projectService } from '@/lib/services/project.service';
import { ProjectModel } from '@/models/project.model';
import Button from '../components/ui/Button';
import DeleteProjectButton from '../components/DeleteProjectButton';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  let user = null;
  let projects: ProjectModel[] = [];

  try {
    const payload = authService.verifyToken(token);
    // Assuming token payload has { id: string }
    const userId = (payload as any).id;
    
    // Fetch user specific data
    // We can add userService.findById(userId) if we need name, etc.
    // For now, let's fetch projects
    projects = await projectService.getUserProjects(userId);
    user = { id: userId }; // minimal user info
  } catch (error) {
    console.error('Dashboard Error:', error);
    // Invalid token
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Samanta
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="font-medium text-sm">U</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Projects</h1>
            <p className="text-slate-400 mt-1">Manage and create your AI-generated applications</p>
          </div>
          <Link href="/project/create">
             <Button>
              + New Project
            </Button>
          </Link>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-2xl border border-slate-800 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              Ready to create something amazing? Start by describing your idea to Samanta.
            </p>
            <Link href="/jadiin">
              <Button variant="outline">
                Create First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <div 
                key={project.id} 
                className="group block p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${project.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                      project.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                      project.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                      'bg-slate-700 text-slate-300'}
                  `}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <Link href={`/dashboard/${project.id}`}>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors cursor-pointer">
                    {project.name}
                  </h3>
                </Link>
                
                <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="flex justify-between items-center text-sm text-slate-500 mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex gap-4">
                    <Link href={`/project/${project.id}/edit`} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Edit
                    </Link>
                    <DeleteProjectButton id={project.id} />
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <span>App</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

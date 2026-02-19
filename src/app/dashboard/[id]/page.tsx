import React from 'react';
import { notFound } from 'next/navigation';
import { projectService } from '@/lib/services/project.service';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  const params = await props.params;
  const project = await projectService.getProject(params.id);

  if (!project) {
    notFound();
  }

  const spec = project.openSpec as any;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Navbar (reused or imported layout if available, reusing minimalistic header here) */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {project.name}
            </span>
            <div className="w-20"></div> {/* Spacer */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{project.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${project.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                  project.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  'bg-slate-700 text-slate-300 border-slate-600'}
              `}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-400 max-w-2xl">{project.description}</p>
          </div>
          
          <div className="flex gap-3">
             <Button variant="primary">
               Generate Web App
             </Button>
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Spec Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Database Schema */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Database Schema
              </h3>
              
              {spec?.database?.tables?.length > 0 ? (
                <div className="space-y-4">
                  {spec.database.tables.map((table: any) => (
                    <div key={table.name} className="border border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 font-medium text-slate-200">
                        {table.name}
                      </div>
                      <div className="p-4 space-y-2">
                        {table.columns.map((col: any) => (
                          <div key={col.name} className="flex justify-between text-sm">
                            <span className="text-slate-300 font-mono">{col.name}</span>
                            <span className="text-slate-500 font-mono text-xs">{col.type}{col.primary ? ' (PK)' : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No database schema defined yet.</p>
              )}
            </div>

            {/* API Routes */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                API Routes
              </h3>
              
              {spec?.routes?.length > 0 ? (
                <div className="space-y-2">
                   {spec.routes.map((route: any, idx: number) => (
                     <div key={idx} className="flex items-center p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                       <span className={`
                         px-2 py-0.5 rounded text-xs font-bold mr-3 w-16 text-center
                         ${route.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                           route.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                           route.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                           'bg-red-500/20 text-red-400'}
                       `}>
                         {route.method}
                       </span>
                       <span className="text-slate-300 font-mono text-sm">{route.uri}</span>
                     </div>
                   ))}
                </div>
              ) : (
                 <p className="text-slate-500 italic">No API routes defined yet.</p>
              )}
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Project Stats</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-slate-500">Created At</dt>
                  <dd className="text-slate-200 mt-1">{new Date(project.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Namespace</dt>
                  <dd className="text-slate-200 mt-1">{spec?.project?.namespace || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Database</dt>
                  <dd className="text-slate-200 mt-1 capitalize">{spec?.database?.connection || 'None'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
               <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
               <div className="space-y-3">
                 <Link href={`/project/${project.id}/edit`}>
                   <Button variant="outline" fullWidth>Edit Project</Button>
                 </Link>
                 <Button variant="outline" fullWidth className="text-red-400 border-red-900/50 hover:bg-red-900/20">
                    Delete Project
                 </Button>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

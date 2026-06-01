import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    link: '',
    repoLink: ''
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const techArray = newProject.technologies.split(',').map(t => t.trim());
      const res = await api.post('/projects', {
        ...newProject,
        technologies: techArray
      });
      setProjects([...projects, res.data]);
      setIsAdding(false);
      setNewProject({ title: '', description: '', technologies: '', link: '', repoLink: '' });
    } catch (err) {
      console.error('Failed to add project', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div className="dashboard-container container flex gap-lg animate-fade-in">
      <aside className="dashboard-sidebar">
        <Card className="profile-card text-center">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <h3>{user?.name}</h3>
          <p className="text-muted">{user?.title}</p>
          <a href={`/profile/${user?._id}`} className="btn btn-secondary btn-block mt-md">View Public Portfolio</a>
          <a href="/settings" className="btn btn-primary btn-block mt-sm">Edit Profile</a>
        </Card>
      </aside>
      
      <main className="dashboard-main flex-1">
        <div className="dashboard-header flex justify-between items-center mb-lg">
          <h2>My Projects</h2>
          <button className="btn btn-primary" onClick={() => setIsAdding(!isAdding)}>
            {isAdding ? 'Cancel' : 'Add Project'}
          </button>
        </div>

        {isAdding && (
          <Card className="mb-lg animate-slide-up">
            <h3>Add New Project</h3>
            <form onSubmit={handleAddProject} className="mt-md">
              <Input label="Title" name="title" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} required />
              <Input label="Description" name="description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} required />
              <Input label="Technologies (comma separated)" name="technologies" value={newProject.technologies} onChange={e => setNewProject({...newProject, technologies: e.target.value})} required placeholder="React, Node.js, MongoDB" />
              <Input label="Live Link" name="link" value={newProject.link} onChange={e => setNewProject({...newProject, link: e.target.value})} placeholder="https://..." />
              <Input label="Repo Link" name="repoLink" value={newProject.repoLink} onChange={e => setNewProject({...newProject, repoLink: e.target.value})} placeholder="https://github.com/..." />
              <button type="submit" className="btn btn-primary mt-sm">Save Project</button>
            </form>
          </Card>
        )}

        <div className="projects-grid">
          {projects.length === 0 && !isAdding && (
            <p className="text-muted">You have no projects yet. Add one to get started!</p>
          )}
          {projects.map(project => (
            <Card key={project._id} className="project-card animate-slide-up">
              <h3>{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <div className="project-tech">
                {project.technologies.map((tech, i) => (
                  <span key={i} className="tech-badge">{tech}</span>
                ))}
              </div>
              <div className="project-links flex gap-sm mt-md">
                {project.link && <a href={project.link} target="_blank" rel="noreferrer" className="btn btn-secondary">Live</a>}
                {project.repoLink && <a href={project.repoLink} target="_blank" rel="noreferrer" className="btn btn-secondary">Code</a>}
                <button onClick={() => handleDelete(project._id)} className="btn btn-danger ml-auto">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

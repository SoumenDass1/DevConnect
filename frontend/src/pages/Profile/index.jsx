import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/Card';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileRes, projectsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/projects/user/${id}`)
        ]);
        setProfile(profileRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  if (loading) return <div className="text-center mt-xl">Loading portfolio...</div>;
  if (!profile) return <div className="text-center mt-xl text-danger">Profile not found.</div>;

  return (
    <div className="portfolio-container">
      <div className="container animate-fade-in">
        <header className="portfolio-header text-center">
          <div className="portfolio-avatar mx-auto mb-md animate-slide-up">{profile.name.charAt(0).toUpperCase()}</div>
          <h1 className="portfolio-name animate-slide-up-delay-1">{profile.name}</h1>
          <h2 className="portfolio-title text-primary animate-slide-up-delay-1">{profile.title}</h2>
          {profile.bio && <p className="portfolio-bio mx-auto mt-md animate-slide-up-delay-2">{profile.bio}</p>}
          
          <div className="portfolio-links flex justify-center gap-md mt-lg animate-slide-up-delay-2">
            {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="btn btn-secondary">GitHub</a>}
            {profile.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary">LinkedIn</a>}
            {profile.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="btn btn-secondary">Twitter</a>}
            {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Download Resume</a>}
          </div>
        </header>

        <section className="portfolio-skills mt-xxl text-center animate-slide-up">
          <h3 className="mb-md">Skills & Technologies</h3>
          <div className="flex justify-center flex-wrap gap-sm">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span key={index} className="tech-badge-large">{skill}</span>
              ))
            ) : (
              <p className="text-muted">No skills listed yet.</p>
            )}
          </div>
        </section>

        <section className="portfolio-projects mt-xxl">
          <h3 className="text-center mb-lg">Projects</h3>
          <div className="projects-grid">
            {projects.length === 0 && <p className="text-center w-full text-muted">No projects added yet.</p>}
            {projects.map((project, i) => (
              <Card key={project._id} className={`project-card animate-slide-up-delay-${i % 3 === 0 ? '1' : '2'}`}>
                <h3>{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tech">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="tech-badge">{tech}</span>
                  ))}
                </div>
                <div className="project-links flex gap-sm mt-md">
                  {project.link && <a href={project.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">View Live</a>}
                  {project.repoLink && <a href={project.repoLink} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">GitHub</a>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;

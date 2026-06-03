import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState(''); // '', 'pending', 'accepted', 'incoming_pending'
  const [connectionId, setConnectionId] = useState('');

  const fetchProfileData = async () => {
    try {
      const [profileRes, projectsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/projects/user/${id}`)
      ]);
      setProfile(profileRes.data);
      setProjects(projectsRes.data);

      // If viewing someone else, check connection status
      if (currentUser && currentUser._id !== id) {
        const connRes = await api.get('/connections');
        const activeConn = connRes.data.find(c => 
          (c.requester._id === currentUser._id && c.recipient._id === id) ||
          (c.requester._id === id && c.recipient._id === currentUser._id)
        );

        if (activeConn) {
          setConnectionId(activeConn._id);
          if (activeConn.status === 'accepted') {
            setConnectionStatus('accepted');
          } else if (activeConn.status === 'pending') {
            if (activeConn.requester._id === currentUser._id) {
              setConnectionStatus('pending'); // sent request
            } else {
              setConnectionStatus('incoming_pending'); // received request
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, currentUser]);

  const handleConnect = async () => {
    try {
      await api.post('/connections', { recipientId: id });
      setConnectionStatus('pending');
    } catch (err) {
      console.error('Failed to send connection request', err);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await api.put(`/connections/${connectionId}`, { status: 'accepted' });
      setConnectionStatus('accepted');
    } catch (err) {
      console.error('Failed to accept request', err);
    }
  };

  if (loading) return <div className="text-center mt-xl">Loading portfolio...</div>;
  if (!profile) return <div className="text-center mt-xl text-danger">Profile not found.</div>;

  const isOwnProfile = currentUser && currentUser._id === id;

  return (
    <div className="portfolio-container">
      <div className="container animate-fade-in">
        
        {/* Profile Header */}
        <header className="portfolio-header text-center relative">
          
          {/* Edit settings/connect triggers */}
          <div className="absolute top-0 right-0 p-md">
            {isOwnProfile ? (
              <Link to="/settings" className="btn btn-secondary flex items-center gap-xs">
                ⚙️ Edit Profile
              </Link>
            ) : (
              currentUser && (
                <>
                  {connectionStatus === '' && (
                    <button className="btn btn-primary" onClick={handleConnect}>➕ Connect</button>
                  )}
                  {connectionStatus === 'pending' && (
                    <button className="btn btn-secondary" disabled>⏳ Pending Request</button>
                  )}
                  {connectionStatus === 'incoming_pending' && (
                    <button className="btn btn-primary" onClick={handleAcceptRequest}>✓ Accept Request</button>
                  )}
                  {connectionStatus === 'accepted' && (
                    <span className="badge-connected">🤝 Connected</span>
                  )}
                </>
              )
            )}
          </div>

          {/* Profile Picture */}
          <div className="portfolio-avatar mx-auto mb-md animate-slide-up overflow-hidden border-2">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Avatar" className="avatar-img-full" />
            ) : (
              <span className="avatar-initial">{profile.name.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <h1 className="portfolio-name animate-slide-up-delay-1">{profile.name}</h1>
          <h2 className="portfolio-title text-primary animate-slide-up-delay-1">
            {profile.headline || profile.title}
          </h2>
          {profile.bio && <p className="portfolio-bio mx-auto mt-md animate-slide-up-delay-2">{profile.bio}</p>}
          
          <div className="portfolio-links flex justify-center gap-md mt-lg animate-slide-up-delay-2">
            {profile.socialLinks?.github && <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="btn btn-secondary">GitHub</a>}
            {profile.socialLinks?.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary">LinkedIn</a>}
            {profile.socialLinks?.twitter && <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="btn btn-secondary">Twitter</a>}
            {profile.resumeUrl && <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn btn-primary">Download Resume</a>}
          </div>
        </header>

        {/* Skills Section */}
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

        {/* Experience Timeline Section */}
        <section className="portfolio-experience mt-xxl">
          <h3 className="text-center mb-lg">Work Experience</h3>
          <div className="timeline-layout max-w-lg mx-auto">
            {(!profile.experience || profile.experience.length === 0) ? (
              <p className="text-center text-muted">No experience entries added yet.</p>
            ) : (
              <div className="timeline-list flex flex-col gap-md">
                {profile.experience.map((exp, idx) => (
                  <Card key={exp._id || idx} className="timeline-card animate-slide-up">
                    <div className="flex justify-between items-start flex-wrap gap-xs">
                      <div>
                        <h4 className="timeline-role text-primary">{exp.position}</h4>
                        <strong className="timeline-company">{exp.company}</strong>
                      </div>
                      <span className="timeline-duration text-muted" style={{ fontSize: '0.82rem' }}>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                      </span>
                    </div>
                    {exp.description && <p className="timeline-desc mt-sm text-secondary">{exp.description}</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Education History Section */}
        <section className="portfolio-education mt-xxl">
          <h3 className="text-center mb-lg">Education</h3>
          <div className="timeline-layout max-w-lg mx-auto">
            {(!profile.education || profile.education.length === 0) ? (
              <p className="text-center text-muted">No education entries added yet.</p>
            ) : (
              <div className="timeline-list flex flex-col gap-md">
                {profile.education.map((edu, idx) => (
                  <Card key={edu._id || idx} className="timeline-card animate-slide-up">
                    <div className="flex justify-between items-start flex-wrap gap-xs">
                      <div>
                        <h4 className="timeline-role text-primary">{edu.degree || 'Degree'}</h4>
                        <strong className="timeline-company">{edu.school}</strong>
                        {edu.field && <p className="text-muted" style={{ fontSize: '0.85rem' }}>Field: {edu.field}</p>}
                      </div>
                      {edu.graduationDate && (
                        <span className="timeline-duration text-muted" style={{ fontSize: '0.82rem' }}>
                          Graduation: {new Date(edu.graduationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Projects Showcase Section */}
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

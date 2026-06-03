import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import './Settings.css';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  
  // Profile settings state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    headline: '',
    bio: '',
    resumeUrl: '',
    skills: '',
    github: '',
    linkedin: '',
    twitter: ''
  });
  
  const [avatarUrl, setAvatarUrl] = useState('');
  const [message, setMessage] = useState('');
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);

  // Form states for adding entry
  const [newExp, setNewExp] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [newEdu, setNewEdu] = useState({
    school: '',
    degree: '',
    field: '',
    graduationDate: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      const data = res.data;
      setFormData({
        name: data.name || '',
        title: data.title || '',
        headline: data.headline || '',
        bio: data.bio || '',
        resumeUrl: data.resumeUrl || '',
        skills: data.skills ? data.skills.join(', ') : '',
        github: data.socialLinks?.github || '',
        linkedin: data.socialLinks?.linkedin || '',
        twitter: data.socialLinks?.twitter || '',
      });
      setAvatarUrl(data.profilePicture || '');
      setExperiences(data.experience || []);
      setEducations(data.education || []);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    try {
      const res = await api.post('/users/profile-picture', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarUrl(res.data.profilePicture);
      setUser({ ...user, profilePicture: res.data.profilePicture });
      setMessage('Profile picture updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Avatar upload failed', err);
      setMessage('Failed to upload image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const updateData = {
        name: formData.name,
        title: formData.title,
        headline: formData.headline || formData.title,
        bio: formData.bio,
        resumeUrl: formData.resumeUrl,
        skills: skillsArray,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter
        }
      };

      const res = await api.put('/users/profile', updateData);
      setUser({ 
        ...user, 
        name: res.data.name, 
        title: res.data.title, 
        profilePicture: res.data.profilePicture 
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage('Failed to update profile.');
    }
  };

  // Experience addition & deletion
  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!newExp.company || !newExp.position) return;
    try {
      const res = await api.post('/users/experience', newExp);
      setExperiences(res.data.experience);
      setNewExp({ company: '', position: '', startDate: '', endDate: '', description: '' });
      setMessage('Experience added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add experience', err);
    }
  };

  const handleDeleteExperience = async (expId) => {
    try {
      const res = await api.delete(`/users/experience/${expId}`);
      setExperiences(res.data.experience);
      setMessage('Experience deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete experience', err);
    }
  };

  // Education addition & deletion
  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!newEdu.school) return;
    try {
      const res = await api.post('/users/education', newEdu);
      setEducations(res.data.education);
      setNewEdu({ school: '', degree: '', field: '', graduationDate: '' });
      setMessage('Education added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to add education', err);
    }
  };

  const handleDeleteEducation = async (eduId) => {
    try {
      const res = await api.delete(`/users/education/${eduId}`);
      setEducations(res.data.education);
      setMessage('Education deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete education', err);
    }
  };

  return (
    <div className="settings-container container animate-fade-in flex flex-col gap-lg">
      <div className="settings-grid">
        
        {/* Main Settings Panel */}
        <Card className="settings-card flex-1">
          <h2>Profile Settings</h2>
          {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
          
          {/* Profile Picture Section */}
          <div className="avatar-upload-container text-center mb-lg">
            <div className="avatar-preview mx-auto">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="avatar-img" />
              ) : (
                <span className="avatar-placeholder">{formData.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <label className="btn btn-secondary mt-sm pointer">
              Change Profile Picture
              <input type="file" onChange={handleAvatarUpload} accept="image/*" className="hidden" />
            </label>
          </div>

          <form onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Professional Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
            <Input label="Headline / Current Role" name="headline" value={formData.headline} onChange={handleChange} placeholder="e.g. Senior Developer at Google" />
            
            <div className="input-group">
              <label className="input-label">Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="form-input" rows="4" placeholder="Tell us about yourself..."></textarea>
            </div>

            <Input label="Skills (comma separated)" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python" />
            
            <div className="input-group">
              <label className="input-label">Resume URL (S3 Mock)</label>
              <div className="flex gap-sm">
                 <input type="text" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} className="form-input flex-1" placeholder="https://s3.amazonaws.com/..." />
                 <button type="button" className="btn btn-secondary" onClick={() => setFormData({...formData, resumeUrl: 'https://s3.amazonaws.com/dummy-bucket/resume.pdf'})}>Mock Upload</button>
              </div>
            </div>

            <h3 className="mt-lg mb-md">Social Links</h3>
            <Input label="GitHub Profile URL" name="github" value={formData.github} onChange={handleChange} />
            <Input label="LinkedIn Profile URL" name="linkedin" value={formData.linkedin} onChange={handleChange} />
            <Input label="Twitter Profile URL" name="twitter" value={formData.twitter} onChange={handleChange} />

            <button type="submit" className="btn btn-primary btn-block mt-lg">Save Settings</button>
          </form>
        </Card>

        {/* Experience & Education Management Side-by-Side */}
        <div className="additional-sections flex-col gap-lg">
          
          {/* Experience Section */}
          <Card className="settings-card">
            <h3>Manage Experience</h3>
            
            {/* Added Experiences list */}
            {experiences.length > 0 && (
              <div className="items-list mb-lg">
                {experiences.map((exp) => (
                  <div key={exp._id} className="item-entry flex justify-between items-center p-sm mb-xs">
                    <div>
                      <strong>{exp.position}</strong> at {exp.company}
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                      </div>
                    </div>
                    <button className="btn-action text-error" onClick={() => handleDeleteExperience(exp._id)}>🗑️ Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Experience form */}
            <form onSubmit={handleAddExperience} className="nested-form flex-col gap-sm">
              <Input label="Company Name" name="company" value={newExp.company} onChange={(e) => setNewExp({...newExp, company: e.target.value})} placeholder="e.g. Google" required />
              <Input label="Position/Role" name="position" value={newExp.position} onChange={(e) => setNewExp({...newExp, position: e.target.value})} placeholder="e.g. Senior Frontend Developer" required />
              
              <div className="flex gap-sm">
                <div className="flex-1">
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>Start Date</label>
                  <input type="date" className="form-input" value={newExp.startDate} onChange={(e) => setNewExp({...newExp, startDate: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="input-label" style={{ fontSize: '0.8rem' }}>End Date (leave blank if present)</label>
                  <input type="date" className="form-input" value={newExp.endDate} onChange={(e) => setNewExp({...newExp, endDate: e.target.value})} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontSize: '0.8rem' }}>Description</label>
                <textarea className="form-input" value={newExp.description} onChange={(e) => setNewExp({...newExp, description: e.target.value})} rows="2" placeholder="Responsibilities and accomplishments..."></textarea>
              </div>

              <button type="submit" className="btn btn-secondary btn-block">➕ Add Experience</button>
            </form>
          </Card>

          {/* Education Section */}
          <Card className="settings-card">
            <h3>Manage Education</h3>

            {/* Added Educations list */}
            {educations.length > 0 && (
              <div className="items-list mb-lg">
                {educations.map((edu) => (
                  <div key={edu._id} className="item-entry flex justify-between items-center p-sm mb-xs">
                    <div>
                      <strong>{edu.degree || 'Degree'}</strong> in {edu.field || 'Field'}
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {edu.school} {edu.graduationDate && `(Graduated: ${new Date(edu.graduationDate).getFullYear()})`}
                      </div>
                    </div>
                    <button className="btn-action text-error" onClick={() => handleDeleteEducation(edu._id)}>🗑️ Delete</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Education form */}
            <form onSubmit={handleAddEducation} className="nested-form flex-col gap-sm">
              <Input label="School Name" name="school" value={newEdu.school} onChange={(e) => setNewEdu({...newEdu, school: e.target.value})} placeholder="e.g. Stanford University" required />
              <Input label="Degree" name="degree" value={newEdu.degree} onChange={(e) => setNewEdu({...newEdu, degree: e.target.value})} placeholder="e.g. Bachelor of Science" />
              <Input label="Field of Study" name="field" value={newEdu.field} onChange={(e) => setNewEdu({...newEdu, field: e.target.value})} placeholder="e.g. Computer Science" />
              
              <div>
                <label className="input-label" style={{ fontSize: '0.8rem' }}>Graduation Date</label>
                <input type="date" className="form-input" value={newEdu.graduationDate} onChange={(e) => setNewEdu({...newEdu, graduationDate: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-secondary btn-block">➕ Add Education</button>
            </form>
          </Card>

        </div>

      </div>
    </div>
  );
};

export default Settings;

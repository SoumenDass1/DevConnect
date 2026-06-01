import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/Card';
import Input from '../../components/Input';
import './Settings.css';

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    resumeUrl: '',
    skills: '',
    github: '',
    linkedin: '',
    twitter: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        const data = res.data;
        setFormData({
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          resumeUrl: data.resumeUrl || '',
          skills: data.skills ? data.skills.join(', ') : '',
          github: data.socialLinks?.github || '',
          linkedin: data.socialLinks?.linkedin || '',
          twitter: data.socialLinks?.twitter || '',
        });
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const updateData = {
        name: formData.name,
        title: formData.title,
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
      setUser({ ...user, name: res.data.name, title: res.data.title });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update profile', err);
      setMessage('Failed to update profile.');
    }
  };

  return (
    <div className="settings-container container animate-fade-in">
      <Card className="settings-card mx-auto">
        <h2>Profile Settings</h2>
        {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit} className="mt-md">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
          <Input label="Professional Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Full Stack Developer" />
          
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
    </div>
  );
};

export default Settings;

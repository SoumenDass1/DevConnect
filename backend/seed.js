const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const connectDB = require('./config/db');

dotenv.config();

const usersData = [
  {
    name: 'Alice Classic',
    email: 'alice@example.com',
    password: 'password123',
    title: 'Senior Frontend Developer',
    bio: 'Passionate about building classic, elegant web interfaces with a focus on modern typography and smooth interactions.',
    skills: ['React', 'CSS', 'Figma', 'UI/UX'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' }
  },
  {
    name: 'Bob Builder',
    email: 'bob@example.com',
    password: 'password123',
    title: 'Full Stack Engineer',
    bio: 'I build robust backends and elegant frontends. I believe in clean code and scalable architecture.',
    skills: ['Node.js', 'Express', 'React', 'MongoDB'],
    socialLinks: { github: 'https://github.com' }
  },
  {
    name: 'Charlie Design',
    email: 'charlie@example.com',
    password: 'password123',
    title: 'UI/UX Designer & Developer',
    bio: 'Creating beautiful digital experiences. I love golden aesthetics and serif fonts.',
    skills: ['Figma', 'CSS', 'JavaScript', 'Tailwind'],
    socialLinks: { twitter: 'https://twitter.com' }
  },
  {
    name: 'Diana Data',
    email: 'diana@example.com',
    password: 'password123',
    title: 'Data Scientist',
    bio: 'Turning data into insights. Exploring the intersection of design and data visualization.',
    skills: ['Python', 'Pandas', 'TensorFlow', 'SQL'],
    socialLinks: { linkedin: 'https://linkedin.com' }
  },
  {
    name: 'Eve Backend',
    email: 'eve@example.com',
    password: 'password123',
    title: 'Backend Specialist',
    bio: 'Performance and security are my top priorities. Building the foundation for great web apps.',
    skills: ['Go', 'Rust', 'PostgreSQL', 'Docker'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' }
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Project.deleteMany();

    const createdUsers = await User.insertMany(usersData);

    const projectsData = [
      {
        user: createdUsers[0]._id,
        title: 'Elegant Portfolio Theme',
        description: 'A classic, cream-colored portfolio template for creatives.',
        technologies: ['React', 'CSS Variables'],
        link: 'https://example.com',
      },
      {
        user: createdUsers[1]._id,
        title: 'E-commerce API',
        description: 'A scalable REST API for e-commerce platforms.',
        technologies: ['Node.js', 'MongoDB', 'Express'],
        repoLink: 'https://github.com',
      },
      {
        user: createdUsers[2]._id,
        title: 'Golden UI Kit',
        description: 'A UI kit featuring warm tones and glowing animations.',
        technologies: ['Figma', 'CSS'],
      }
    ];

    await Project.insertMany(projectsData);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedDatabase();

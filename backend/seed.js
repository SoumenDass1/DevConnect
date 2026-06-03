const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Post = require('./models/Post');
const Connection = require('./models/Connection');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const connectDB = require('./config/db');

dotenv.config();

const usersData = [];

// Generate 1000 dummy user profiles
for (let i = 1; i <= 1000; i++) {
  usersData.push({
    name: `User ${i}`,
    email: `user${i}@example.com`,
    password: 'password123',
    title: 'Software Engineer',
    bio: `Hello! I am User ${i}, a passionate developer.`,
    skills: ['JavaScript', 'Node.js', 'React'],
    socialLinks: {}
  });
}

// Add a few realistic seed users for richer data
usersData.push(
  {
    name: 'Alice Classic',
    email: 'alice@example.com',
    password: 'password123',
    title: 'Senior Frontend Developer',
    headline: 'Senior Frontend Architect | Google Developer Expert',
    bio: 'Passionate about building classic, elegant web interfaces with a focus on modern typography and smooth interactions.',
    profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg',
    skills: ['React', 'CSS', 'Figma', 'UI/UX'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    experience: [
      {
        company: 'Google',
        position: 'Senior Frontend Developer',
        startDate: '2022-03-01',
        description: 'Lead engineering for next-gen Search & Design System tools. Mentor a team of 6 engineers.'
      },
      {
        company: 'Classic Web Inc',
        position: 'UI Developer',
        startDate: '2020-01-01',
        endDate: '2022-02-28',
        description: 'Developed ivory and warm-themed premium UI components used by 100K+ developers.'
      }
    ],
    education: [
      {
        school: 'Stanford University',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: '2019-06-15'
      }
    ]
  },
  {
    name: 'Bob Builder',
    email: 'bob@example.com',
    password: 'password123',
    title: 'Full Stack Engineer',
    headline: 'Full Stack Tech Lead at Amazon | Cloud Solutions Architect',
    bio: 'I build robust backends and elegant frontends. I believe in clean code and scalable architecture.',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    skills: ['Node.js', 'Express', 'React', 'MongoDB'],
    socialLinks: { github: 'https://github.com' },
    experience: [
      {
        company: 'Amazon Web Services',
        position: 'Full Stack Tech Lead',
        startDate: '2021-06-01',
        description: 'Architecting scalable serverless platforms and cloud operations.'
      }
    ],
    education: [
      {
        school: 'MIT',
        degree: 'Master of Science',
        field: 'Software Engineering',
        graduationDate: '2021-05-30'
      }
    ]
  },
  {
    name: 'Charlie Design',
    email: 'charlie@example.com',
    password: 'password123',
    title: 'UI/UX Designer & Developer',
    headline: 'Award-winning Product Designer | Red Dot Winner 2025',
    bio: 'Creating beautiful digital experiences. I love golden aesthetics and serif fonts.',
    profilePicture: 'https://randomuser.me/api/portraits/men/44.jpg',
    skills: ['Figma', 'CSS', 'JavaScript', 'Tailwind'],
    socialLinks: { twitter: 'https://twitter.com' },
    experience: [
      {
        company: 'Vogue Tech Studios',
        position: 'Lead UX Designer',
        startDate: '2023-01-01',
        description: 'Redesigned FinTech mobile applications and luxury lifestyle systems.'
      }
    ],
    education: [
      {
        school: 'Rhode Island School of Design',
        degree: 'Bachelor of Fine Arts',
        field: 'Graphic & Digital Design',
        graduationDate: '2022-06-01'
      }
    ]
  },
  {
    name: 'Diana Data',
    email: 'diana@example.com',
    password: 'password123',
    title: 'Data Scientist',
    headline: 'Lead Data Scientist at Netflix | AI Researcher',
    bio: 'Turning data into insights. Exploring the intersection of design and data visualization.',
    profilePicture: 'https://randomuser.me/api/portraits/women/48.jpg',
    skills: ['Python', 'Pandas', 'TensorFlow', 'SQL'],
    socialLinks: { linkedin: 'https://linkedin.com' },
    experience: [
      {
        company: 'Netflix',
        position: 'Lead Data Scientist',
        startDate: '2022-09-01',
        description: 'Designing recommendation algorithms and user retention ML frameworks.'
      }
    ],
    education: [
      {
        school: 'UC Berkeley',
        degree: 'Ph.D.',
        field: 'Data Science & Machine Learning',
        graduationDate: '2022-05-15'
      }
    ]
  },
  {
    name: 'Eve Backend',
    email: 'eve@example.com',
    password: 'password123',
    title: 'Backend Specialist',
    headline: 'Core Rust contributor | Infrastructure Engineer',
    bio: 'Performance and security are my top priorities. Building the foundation for great web apps.',
    profilePicture: 'https://randomuser.me/api/portraits/women/65.jpg',
    skills: ['Go', 'Rust', 'PostgreSQL', 'Docker'],
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    experience: [
      {
        company: 'Cloudflare',
        position: 'Infrastructure Engineer',
        startDate: '2020-08-01',
        description: 'Building serverless runtimes and core edge routing APIs using Rust.'
      }
    ],
    education: [
      {
        school: 'Carnegie Mellon University',
        degree: 'Master of Science',
        field: 'Computer Science',
        graduationDate: '2020-05-10'
      }
    ]
  }
);

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Project.deleteMany();
    await Post.deleteMany();
    await Connection.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();

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



    await Post.insertMany(postsData);

    // Seed some accepted connections
    const connectionsData = [
      { requester: createdUsers[0]._id, recipient: createdUsers[1]._id, status: 'accepted' },
      { requester: createdUsers[0]._id, recipient: createdUsers[2]._id, status: 'accepted' },
      { requester: createdUsers[0]._id, recipient: createdUsers[3]._id, status: 'accepted' },
      { requester: createdUsers[1]._id, recipient: createdUsers[4]._id, status: 'accepted' }
    ];

    await Connection.insertMany(connectionsData);

    // Update connections field in User model for each seeded accepted connection
    await User.findByIdAndUpdate(createdUsers[0]._id, { $addToSet: { connections: [createdUsers[1]._id, createdUsers[2]._id, createdUsers[3]._id] } });
    await User.findByIdAndUpdate(createdUsers[1]._id, { $addToSet: { connections: [createdUsers[0]._id, createdUsers[4]._id] } });
    await User.findByIdAndUpdate(createdUsers[2]._id, { $addToSet: { connections: [createdUsers[0]._id] } });
    await User.findByIdAndUpdate(createdUsers[3]._id, { $addToSet: { connections: [createdUsers[0]._id] } });
    await User.findByIdAndUpdate(createdUsers[4]._id, { $addToSet: { connections: [createdUsers[1]._id] } });

    console.log('Database Seeded Successfully with LinkedIn profile data, experiences, educations, and accepted connections!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedDatabase();

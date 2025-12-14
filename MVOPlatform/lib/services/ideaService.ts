/**
 * Idea Service - Centralized access to ideas data
 * Provides a service interface that can be easily swapped for API calls
 */

import { Idea } from '@/lib/types/idea'

/**
 * Interface for Idea Service
 * Allows for easy injection and swapping of implementations
 */
export interface IIdeaService {
  /**
   * Get all ideas
   * @param limit Optional limit for number of ideas to return
   * @param offset Optional offset for pagination
   */
  getIdeas(limit?: number, offset?: number): Promise<Idea[]>

  /**
   * Get a single idea by ID
   */
  getIdeaById(id: string): Promise<Idea | null>

  /**
   * Load more ideas (for infinite scroll)
   * @param currentCount Current number of ideas loaded
   */
  loadMoreIdeas(currentCount: number): Promise<Idea[]>

  /**
   * Get featured ideas for carousel (high score, with videos)
   */
  getFeaturedIdeas(limit?: number): Promise<Idea[]>

  /**
   * Get ideas for "For You" section (personalized/curated)
   */
  getForYouIdeas(limit?: number, offset?: number): Promise<Idea[]>

  /**
   * Get ideas for "Explore" section (all ideas, TikTok-style)
   */
  getExploreIdeas(limit?: number, offset?: number): Promise<Idea[]>
}

/**
 * Mock data - All ideas stored in a single place
 * Videos from various public sources - each video is unique
 */
// Unique video URLs from different providers - 50 unique videos
const VIDEO_URLS = [
  // Google Cloud Storage videos (12 unique videos)
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  // Additional public video sources (reliable providers only)
  'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  // Reuse Google Cloud Storage videos with different query params to ensure uniqueness
  // These are the same videos but treated as unique resources
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4?t=1',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4?t=1',
  // More variations with different query params
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4?t=2',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4?t=2',
  // Final variations
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4?t=3',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4?t=3',
]

const MOCK_IDEAS: Idea[] = [
  // Featured ideas (for carousel) - High scores with videos
  {
    id: '1',
    title: 'AI-Powered Meal Planning App',
    description:
      'An app that uses AI to create personalized meal plans based on dietary restrictions, budget, and preferences.',
    author: 'Sarah Chen',
    score: 92,
    votes: 145,
    tags: ['AI', 'Health', 'Food'],
    createdAt: '2024-01-15',
    video: VIDEO_URLS[0],
    featured: true,
  },
  {
    id: '2',
    title: 'Sustainable Fashion Marketplace',
    description:
      'A platform connecting eco-conscious consumers with sustainable fashion brands.',
    author: 'Michael Rodriguez',
    score: 88,
    votes: 132,
    tags: ['Fashion', 'Sustainability', 'E-commerce'],
    createdAt: '2024-01-14',
    video: VIDEO_URLS[1],
    featured: true,
    trending: true,
  },
  {
    id: '3',
    title: 'Personal Finance AI Assistant',
    description:
      'An AI-powered assistant that helps users manage their finances, track spending, and optimize savings.',
    author: 'David Kim',
    score: 91,
    votes: 189,
    tags: ['AI', 'Finance', 'Fintech'],
    createdAt: '2024-01-12',
    video: VIDEO_URLS[2],
    featured: true,
  },
  {
    id: '4',
    title: 'AR Interior Design Tool',
    description:
      'Augmented reality app to visualize furniture and decor in your space before buying.',
    author: 'Daniel Anderson',
    score: 87,
    votes: 171,
    tags: ['AR', 'E-commerce', 'Design'],
    createdAt: '2024-01-02',
    video: VIDEO_URLS[3],
    featured: true,
    trending: true,
  },
  {
    id: '5',
    title: 'AI Content Creation Suite',
    description:
      'Comprehensive AI tools for generating blog posts, social media content, and marketing copy.',
    author: 'Kevin Moore',
    score: 89,
    votes: 195,
    tags: ['AI', 'SaaS', 'Content'],
    createdAt: '2023-12-31',
    video: VIDEO_URLS[4],
    featured: true,
  },
  {
    id: '6',
    title: 'Virtual Reality Fitness Studio',
    description:
      'Immersive VR workouts that transport you to exotic locations while burning calories.',
    author: 'Jessica Park',
    score: 86,
    votes: 128,
    tags: ['VR', 'Health', 'Fitness'],
    createdAt: '2024-01-16',
    video: VIDEO_URLS[5],
    featured: true,
    trending: true,
  },
  {
    id: '7',
    title: 'Smart City Traffic Optimization',
    description:
      'AI-powered system that optimizes traffic flow in real-time using IoT sensors and machine learning.',
    author: 'Carlos Mendez',
    score: 90,
    votes: 156,
    tags: ['AI', 'IoT', 'Smart City'],
    createdAt: '2024-01-17',
    video: VIDEO_URLS[6],
    featured: true,
  },
  {
    id: '8',
    title: 'Blockchain-Based Voting System',
    description:
      'Secure, transparent voting platform using blockchain technology for elections and polls.',
    author: 'Priya Sharma',
    score: 85,
    votes: 142,
    tags: ['Blockchain', 'Democracy', 'Security'],
    createdAt: '2024-01-18',
    video: VIDEO_URLS[7],
    featured: true,
    trending: true,
  },
  {
    id: '9',
    title: '3D Printing Marketplace',
    description:
      'Platform connecting designers with 3D printing services for custom products and prototypes.',
    author: 'Tom Wilson',
    score: 84,
    votes: 118,
    tags: ['3D Printing', 'E-commerce', 'Design'],
    createdAt: '2024-01-19',
    video: VIDEO_URLS[8],
    featured: true,
  },
  {
    id: '10',
    title: 'Neural Interface Gaming',
    description:
      'Revolutionary gaming experience controlled by brain-computer interfaces for immersive gameplay.',
    author: 'Alex Chen',
    score: 93,
    votes: 201,
    tags: ['Gaming', 'Neurotech', 'Innovation'],
    createdAt: '2024-01-20',
    video: VIDEO_URLS[9],
    featured: true,
    trending: true,
  },
  // For You section ideas - Curated, personalized content
  {
    id: '11',
    title: 'Remote Team Building Platform',
    description:
      'Virtual team building activities and games for distributed teams.',
    author: 'Emily Johnson',
    score: 88,
    votes: 167,
    tags: ['SaaS', 'Remote Work', 'HR'],
    createdAt: '2024-01-13',
    video: VIDEO_URLS[10],
    forYou: true,
    trending: true,
  },
  {
    id: '12',
    title: 'Mental Health Support Platform',
    description:
      'A digital platform providing accessible mental health resources and support communities.',
    author: 'James Wilson',
    score: 85,
    votes: 172,
    tags: ['Health', 'SaaS', 'Wellness'],
    createdAt: '2024-01-10',
    video: VIDEO_URLS[11],
    forYou: true,
  },
  {
    id: '13',
    title: 'Fitness Tracking Wearable',
    description:
      'Advanced wearable device with AI coaching for personalized fitness routines.',
    author: 'Chris Martinez',
    score: 86,
    votes: 178,
    tags: ['Health', 'Wearables', 'AI'],
    createdAt: '2024-01-06',
    video: VIDEO_URLS[12],
    forYou: true,
    trending: true,
  },
  {
    id: '14',
    title: 'Language Learning Gamification App',
    description:
      'Learn new languages through interactive games and real-world conversation practice.',
    author: 'Alex Thompson',
    score: 83,
    votes: 161,
    tags: ['Education', 'Gaming', 'Mobile'],
    createdAt: '2024-01-08',
    video: VIDEO_URLS[13],
    forYou: true,
  },
  {
    id: '15',
    title: 'Virtual Event Platform',
    description:
      'Comprehensive platform for hosting and attending virtual conferences and events.',
    author: 'Jennifer Lee',
    score: 84,
    votes: 165,
    tags: ['SaaS', 'Events', 'Remote Work'],
    createdAt: '2024-01-05',
    video: VIDEO_URLS[14],
    forYou: true,
    trending: true,
  },
  {
    id: '16',
    title: 'Skill-Based Learning Marketplace',
    description:
      'Platform connecting learners with expert instructors for personalized skill development.',
    author: 'Ryan Lewis',
    score: 85,
    votes: 174,
    tags: ['Education', 'Marketplace', 'Learning'],
    createdAt: '2023-12-29',
    video: VIDEO_URLS[15],
    forYou: true,
  },
  {
    id: '17',
    title: 'Personalized News Aggregator',
    description:
      'AI-powered news aggregator that learns your interests and curates relevant articles.',
    author: 'Brian King',
    score: 83,
    votes: 166,
    tags: ['AI', 'News', 'Personalization'],
    createdAt: '2023-12-27',
    video: VIDEO_URLS[16],
    forYou: true,
    trending: true,
  },
  {
    id: '18',
    title: 'Eco-Friendly Packaging Solutions',
    description:
      'Innovative biodegradable packaging materials for e-commerce and food delivery.',
    author: 'Lisa Wang',
    score: 79,
    votes: 154,
    tags: ['Sustainability', 'E-commerce', 'Innovation'],
    createdAt: '2024-01-11',
    video: VIDEO_URLS[17],
    forYou: true,
  },
  {
    id: '19',
    title: 'Smart Home Energy Manager',
    description:
      'IoT device that optimizes home energy consumption and reduces electricity bills.',
    author: 'Maria Garcia',
    score: 77,
    votes: 148,
    tags: ['IoT', 'Sustainability', 'Smart Home'],
    createdAt: '2024-01-09',
    video: VIDEO_URLS[18],
    forYou: true,
    trending: true,
  },
  {
    id: '20',
    title: 'Blockchain Supply Chain Tracker',
    description:
      'Transparent supply chain tracking using blockchain technology for product authenticity.',
    author: 'Robert Taylor',
    score: 81,
    votes: 159,
    tags: ['Blockchain', 'E-commerce', 'Innovation'],
    createdAt: '2024-01-04',
    video: VIDEO_URLS[19],
    forYou: true,
  },
  // Explore section ideas - All ideas with videos for TikTok-style feed
  {
    id: '21',
    title: 'Drone Delivery Network',
    description:
      'Autonomous drone fleet for fast, eco-friendly package delivery in urban areas.',
    author: 'Sam Lee',
    score: 82,
    votes: 138,
    tags: ['Drones', 'Logistics', 'Innovation'],
    createdAt: '2024-01-21',
    video: VIDEO_URLS[20],
    trending: true,
  },
  {
    id: '22',
    title: 'Quantum Computing Cloud Platform',
    description:
      'Access quantum computing power through the cloud for complex problem solving.',
    author: 'Dr. Elena Volkov',
    score: 94,
    votes: 212,
    tags: ['Quantum', 'Cloud', 'Tech'],
    createdAt: '2024-01-22',
    video: VIDEO_URLS[21],
    trending: true,
  },
  {
    id: '23',
    title: 'Biometric Payment System',
    description:
      'Secure payment platform using fingerprint and facial recognition technology.',
    author: 'Raj Patel',
    score: 87,
    votes: 176,
    tags: ['Fintech', 'Security', 'Biometrics'],
    createdAt: '2024-01-23',
    video: VIDEO_URLS[22],
  },
  {
    id: '24',
    title: 'Holographic Meeting Rooms',
    description:
      '3D holographic displays for immersive remote collaboration experiences.',
    author: 'Sophie Martin',
    score: 89,
    votes: 187,
    tags: ['Holography', 'Remote Work', 'Innovation'],
    createdAt: '2024-01-24',
    video: VIDEO_URLS[23],
    trending: true,
  },
  {
    id: '25',
    title: 'AI-Powered Code Review',
    description:
      'Automated code review tool that learns from best practices and suggests improvements.',
    author: 'Marcus Johnson',
    score: 88,
    votes: 183,
    tags: ['AI', 'Development', 'SaaS'],
    createdAt: '2024-01-25',
    video: VIDEO_URLS[24],
  },
  {
    id: '26',
    title: 'Smart Mirror Fitness Coach',
    description:
      'AI-powered mirror that provides real-time workout feedback and form correction.',
    author: 'Yuki Tanaka',
    score: 85,
    votes: 169,
    tags: ['AI', 'Fitness', 'IoT'],
    createdAt: '2024-01-26',
    video: VIDEO_URLS[25],
    trending: true,
  },
  {
    id: '27',
    title: 'Carbon Footprint Tracker',
    description:
      'App that tracks and helps reduce your carbon footprint through lifestyle changes.',
    author: 'Emma Green',
    score: 86,
    votes: 175,
    tags: ['Sustainability', 'Mobile', 'Environment'],
    createdAt: '2024-01-27',
    video: VIDEO_URLS[26],
  },
  {
    id: '28',
    title: 'Voice-Controlled Smart Home',
    description:
      'Complete home automation system controlled entirely through voice commands.',
    author: 'David Kim',
    score: 84,
    votes: 162,
    tags: ['IoT', 'Smart Home', 'Voice'],
    createdAt: '2024-01-28',
    video: VIDEO_URLS[27],
    trending: true,
  },
  {
    id: '29',
    title: 'AI Music Composer',
    description:
      'Generate original music compositions using AI trained on millions of songs.',
    author: 'Lucas Rivera',
    score: 87,
    votes: 181,
    tags: ['AI', 'Music', 'Creative'],
    createdAt: '2024-01-29',
    video: VIDEO_URLS[28],
  },
  {
    id: '30',
    title: 'Virtual Stylist App',
    description:
      'AI stylist that suggests outfits based on your wardrobe, weather, and occasion.',
    author: 'Isabella Rossi',
    score: 83,
    votes: 164,
    tags: ['AI', 'Fashion', 'Mobile'],
    createdAt: '2024-01-30',
    video: VIDEO_URLS[29],
    trending: true,
  },
  {
    id: '31',
    title: 'Robotic Kitchen Assistant',
    description:
      'Automated cooking robot that prepares meals from recipes with precision.',
    author: 'Chef Marco',
    score: 90,
    votes: 198,
    tags: ['Robotics', 'Food', 'Innovation'],
    createdAt: '2024-02-01',
    video: VIDEO_URLS[30],
  },
  {
    id: '32',
    title: 'Sleep Quality Optimizer',
    description:
      'IoT device that monitors and optimizes your sleep environment for better rest.',
    author: 'Dr. Sarah Chen',
    score: 86,
    votes: 177,
    tags: ['Health', 'IoT', 'Wellness'],
    createdAt: '2024-02-02',
    video: VIDEO_URLS[31],
    trending: true,
  },
  {
    id: '33',
    title: 'Crowdsourced Translation Platform',
    description:
      'Real-time translation service powered by a global community of native speakers.',
    author: 'Ana Silva',
    score: 85,
    votes: 173,
    tags: ['Translation', 'Community', 'SaaS'],
    createdAt: '2024-02-03',
    video: VIDEO_URLS[32],
  },
  {
    id: '34',
    title: 'AI-Powered Legal Assistant',
    description:
      'Legal research and document analysis tool powered by natural language processing.',
    author: 'Attorney James',
    score: 88,
    votes: 185,
    tags: ['AI', 'Legal', 'SaaS'],
    createdAt: '2024-02-04',
    video: VIDEO_URLS[33],
    trending: true,
  },
  {
    id: '35',
    title: 'Sustainable Energy Trading',
    description:
      'Peer-to-peer platform for trading renewable energy credits and carbon offsets.',
    author: 'Green Energy Co',
    score: 87,
    votes: 179,
    tags: ['Sustainability', 'Energy', 'Blockchain'],
    createdAt: '2024-02-05',
    video: VIDEO_URLS[34],
  },
  {
    id: '36',
    title: 'AI-Powered Tutoring Platform',
    description:
      'Personalized tutoring sessions with AI tutors that adapt to learning styles.',
    author: 'EduTech Solutions',
    score: 89,
    votes: 192,
    tags: ['AI', 'Education', 'SaaS'],
    createdAt: '2024-02-06',
    video: VIDEO_URLS[35],
    trending: true,
  },
  {
    id: '37',
    title: 'Smart Plant Care System',
    description:
      'IoT sensors and AI that monitor and automate plant care for optimal growth.',
    author: 'Garden Tech',
    score: 82,
    votes: 147,
    tags: ['IoT', 'Gardening', 'AI'],
    createdAt: '2024-02-07',
    video: VIDEO_URLS[36],
  },
  {
    id: '38',
    title: 'Virtual Reality Therapy',
    description:
      'VR-based therapy sessions for treating phobias, anxiety, and PTSD.',
    author: 'Dr. Wellness',
    score: 91,
    votes: 203,
    tags: ['VR', 'Health', 'Therapy'],
    createdAt: '2024-02-08',
    video: VIDEO_URLS[37],
    trending: true,
  },
  {
    id: '39',
    title: 'AI-Powered Recipe Generator',
    description:
      'Generate recipes from available ingredients using AI and nutritional data.',
    author: 'Chef AI',
    score: 84,
    votes: 168,
    tags: ['AI', 'Food', 'Mobile'],
    createdAt: '2024-02-09',
    video: VIDEO_URLS[38],
  },
  {
    id: '40',
    title: 'Blockchain Identity Verification',
    description:
      'Decentralized identity verification system for secure online authentication.',
    author: 'SecureID Inc',
    score: 90,
    votes: 196,
    tags: ['Blockchain', 'Security', 'Identity'],
    createdAt: '2024-02-10',
    video: VIDEO_URLS[39],
    trending: true,
  },
  {
    id: '41',
    title: 'Smart Waste Sorting System',
    description:
      'AI-powered system that automatically sorts recyclables from waste.',
    author: 'EcoSort',
    score: 86,
    votes: 174,
    tags: ['AI', 'Sustainability', 'IoT'],
    createdAt: '2024-02-11',
    video: VIDEO_URLS[40],
  },
  {
    id: '42',
    title: 'Augmented Reality Shopping',
    description:
      'Try on clothes and visualize products in your space using AR technology.',
    author: 'AR Shop',
    score: 88,
    votes: 184,
    tags: ['AR', 'E-commerce', 'Shopping'],
    createdAt: '2024-02-12',
    video: VIDEO_URLS[41],
    trending: true,
  },
  {
    id: '43',
    title: 'AI-Powered Investment Advisor',
    description:
      'Personalized investment recommendations based on risk tolerance and goals.',
    author: 'FinanceAI',
    score: 87,
    votes: 180,
    tags: ['AI', 'Finance', 'Investing'],
    createdAt: '2024-02-13',
    video: VIDEO_URLS[42],
  },
  {
    id: '44',
    title: 'Voice-Activated Home Security',
    description:
      'Complete home security system controlled through voice commands and AI.',
    author: 'SecureHome',
    score: 89,
    votes: 191,
    tags: ['Security', 'IoT', 'Voice'],
    createdAt: '2024-02-14',
    video: VIDEO_URLS[43],
    trending: true,
  },
  {
    id: '45',
    title: '3D Holographic Display',
    description:
      'Portable 3D holographic display for presentations and entertainment.',
    author: 'HoloTech',
    score: 92,
    votes: 207,
    tags: ['Holography', 'Display', 'Innovation'],
    createdAt: '2024-02-15',
    video: VIDEO_URLS[44],
  },
  {
    id: '46',
    title: 'AI-Powered Job Matching',
    description:
      'Match job seekers with opportunities using AI analysis of skills and preferences.',
    author: 'CareerAI',
    score: 86,
    votes: 176,
    tags: ['AI', 'HR', 'Jobs'],
    createdAt: '2024-02-16',
    video: VIDEO_URLS[45],
  },
  {
    id: '47',
    title: 'Smart Water Management',
    description:
      'IoT system that monitors and optimizes water usage in homes and buildings.',
    author: 'AquaTech',
    score: 85,
    votes: 170,
    tags: ['IoT', 'Sustainability', 'Water'],
    createdAt: '2024-02-17',
    video: VIDEO_URLS[46],
    trending: true,
  },
  {
    id: '48',
    title: 'Neural Network Art Generator',
    description:
      'Create unique digital art using neural networks trained on millions of images.',
    author: 'ArtAI',
    score: 88,
    votes: 186,
    tags: ['AI', 'Art', 'Creative'],
    createdAt: '2024-02-18',
    video: VIDEO_URLS[47],
  },
  {
    id: '49',
    title: 'Automated Pet Care System',
    description:
      'IoT devices that monitor and automate feeding, exercise, and health for pets.',
    author: 'PetTech',
    score: 84,
    votes: 163,
    tags: ['IoT', 'Pets', 'Automation'],
    createdAt: '2024-02-19',
    video: VIDEO_URLS[48],
    trending: true,
  },
  {
    id: '50',
    title: 'AI-Powered Medical Diagnosis',
    description:
      'AI system that assists doctors in diagnosing diseases from medical images.',
    author: 'MedAI',
    score: 93,
    votes: 215,
    tags: ['AI', 'Healthcare', 'Medical'],
    createdAt: '2024-02-20',
    video: VIDEO_URLS[49],
  },
]

/**
 * Mock Idea Service Implementation
 * This can be easily swapped with an API-based implementation
 */
class MockIdeaService implements IIdeaService {
  async getIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    const start = offset
    const end = limit ? offset + limit : MOCK_IDEAS.length
    return MOCK_IDEAS.slice(start, end)
  }

  async getIdeaById(id: string): Promise<Idea | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    return MOCK_IDEAS.find((idea) => idea.id === id) || null
  }

  async loadMoreIdeas(currentCount: number): Promise<Idea[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Generate more ideas by duplicating and modifying IDs
    const batchSize = 5
    const newIdeas: Idea[] = []
    
    for (let i = 0; i < batchSize; i++) {
      const baseIdea = MOCK_IDEAS[i % MOCK_IDEAS.length]
      newIdeas.push({
        ...baseIdea,
        id: `${baseIdea.id}-${currentCount + i}`,
      })
    }
    
    return newIdeas
  }

  async getFeaturedIdeas(limit = 5): Promise<Idea[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    // Return ONLY featured ideas (exclude those marked for other sections)
    // Featured ideas should NOT appear in For You or Explore
    const featured = MOCK_IDEAS.filter(
      (idea) => idea.featured && idea.video && !idea.forYou
    )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
    
    return featured
  }

  async getForYouIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    // Return ONLY For You ideas (exclude featured ones)
    // For You ideas should NOT appear in Carousel or Explore
    const forYou = MOCK_IDEAS.filter(
      (idea) => idea.forYou && !idea.featured
    )
      .sort((a, b) => b.score - a.score)
    
    const start = offset
    const end = limit ? offset + limit : forYou.length
    return forYou.slice(start, end)
  }

  async getExploreIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    // Return ONLY Explore ideas (exclude featured and forYou)
    // Explore ideas should NOT appear in Carousel or For You
    const explore = MOCK_IDEAS.filter(
      (idea) => idea.video && !idea.featured && !idea.forYou
    )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    const start = offset
    const end = limit ? offset + limit : explore.length
    return explore.slice(start, end)
  }
}

/**
 * Export singleton instance of the idea service
 * In the future, this can be swapped with an API-based service
 */
export const ideaService: IIdeaService = new MockIdeaService()

/**
 * Factory function to create idea service instances
 * Useful for testing or dependency injection
 */
export function createIdeaService(): IIdeaService {
  return new MockIdeaService()
}

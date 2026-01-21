-- Insert mock data for testing

-- First, create users in auth.users (required for foreign key constraint)
-- Note: In production, users are created through Supabase Auth, but for testing we insert directly
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data) VALUES
('550e8400-e29b-41d4-a716-446655440200', 'sarah.chen@example.com', NOW(), NOW(), NOW(), '{"full_name": "Sarah Chen", "username": "sarah_chen"}'),
('550e8400-e29b-41d4-a716-446655440201', 'michael.rodriguez@example.com', NOW(), NOW(), NOW(), '{"full_name": "Michael Rodriguez", "username": "michael_rodriguez"}'),
('550e8400-e29b-41d4-a716-446655440202', 'david.kim@example.com', NOW(), NOW(), NOW(), '{"full_name": "David Kim", "username": "david_kim"}'),
('550e8400-e29b-41d4-a716-446655440203', 'daniel.anderson@example.com', NOW(), NOW(), NOW(), '{"full_name": "Daniel Anderson", "username": "daniel_anderson"}'),
('550e8400-e29b-41d4-a716-446655440204', 'kevin.moore@example.com', NOW(), NOW(), NOW(), '{"full_name": "Kevin Moore", "username": "kevin_moore"}'),
('550e8400-e29b-41d4-a716-446655440205', 'jessica.park@example.com', NOW(), NOW(), NOW(), '{"full_name": "Jessica Park", "username": "jessica_park"}'),
('550e8400-e29b-41d4-a716-446655440206', 'carlos.mendez@example.com', NOW(), NOW(), NOW(), '{"full_name": "Carlos Mendez", "username": "carlos_mendez"}'),
('550e8400-e29b-41d4-a716-446655440207', 'priya.sharma@example.com', NOW(), NOW(), NOW(), '{"full_name": "Priya Sharma", "username": "priya_sharma"}'),
('550e8400-e29b-41d4-a716-446655440208', 'tom.wilson@example.com', NOW(), NOW(), NOW(), '{"full_name": "Tom Wilson", "username": "tom_wilson"}'),
('550e8400-e29b-41d4-a716-446655440209', 'alex.chen@example.com', NOW(), NOW(), NOW(), '{"full_name": "Alex Chen", "username": "alex_chen"}'),
('550e8400-e29b-41d4-a716-446655440210', 'emily.johnson@example.com', NOW(), NOW(), NOW(), '{"full_name": "Emily Johnson", "username": "emily_johnson"}'),
('550e8400-e29b-41d4-a716-446655440211', 'james.wilson@example.com', NOW(), NOW(), NOW(), '{"full_name": "James Wilson", "username": "james_wilson"}'),
('550e8400-e29b-41d4-a716-446655440212', 'chris.martinez@example.com', NOW(), NOW(), NOW(), '{"full_name": "Chris Martinez", "username": "chris_martinez"}'),
('550e8400-e29b-41d4-a716-446655440213', 'alex.thompson@example.com', NOW(), NOW(), NOW(), '{"full_name": "Alex Thompson", "username": "alex_thompson"}'),
('550e8400-e29b-41d4-a716-446655440214', 'jennifer.lee@example.com', NOW(), NOW(), NOW(), '{"full_name": "Jennifer Lee", "username": "jennifer_lee"}'),
('550e8400-e29b-41d4-a716-446655440215', 'ryan.lewis@example.com', NOW(), NOW(), NOW(), '{"full_name": "Ryan Lewis", "username": "ryan_lewis"}'),
('550e8400-e29b-41d4-a716-446655440216', 'brian.king@example.com', NOW(), NOW(), NOW(), '{"full_name": "Brian King", "username": "brian_king"}'),
('550e8400-e29b-41d4-a716-446655440217', 'lisa.wang@example.com', NOW(), NOW(), NOW(), '{"full_name": "Lisa Wang", "username": "lisa_wang"}'),
('550e8400-e29b-41d4-a716-446655440218', 'maria.garcia@example.com', NOW(), NOW(), NOW(), '{"full_name": "Maria Garcia", "username": "maria_garcia"}'),
('550e8400-e29b-41d4-a716-446655440219', 'robert.taylor@example.com', NOW(), NOW(), NOW(), '{"full_name": "Robert Taylor", "username": "robert_taylor"}'),
('550e8400-e29b-41d4-a716-446655440220', 'sam.lee@example.com', NOW(), NOW(), NOW(), '{"full_name": "Sam Lee", "username": "sam_lee"}'),
('550e8400-e29b-41d4-a716-446655440221', 'elena.volkov@example.com', NOW(), NOW(), NOW(), '{"full_name": "Dr. Elena Volkov", "username": "elena_volkov"}'),
('550e8400-e29b-41d4-a716-446655440222', 'raj.patel@example.com', NOW(), NOW(), NOW(), '{"full_name": "Raj Patel", "username": "raj_patel"}'),
('550e8400-e29b-41d4-a716-446655440223', 'sophie.martin@example.com', NOW(), NOW(), NOW(), '{"full_name": "Sophie Martin", "username": "sophie_martin"}'),
('550e8400-e29b-41d4-a716-446655440224', 'marcus.johnson@example.com', NOW(), NOW(), NOW(), '{"full_name": "Marcus Johnson", "username": "marcus_johnson"}'),
('550e8400-e29b-41d4-a716-446655440225', 'yuki.tanaka@example.com', NOW(), NOW(), NOW(), '{"full_name": "Yuki Tanaka", "username": "yuki_tanaka"}'),
('550e8400-e29b-41d4-a716-446655440226', 'emma.green@example.com', NOW(), NOW(), NOW(), '{"full_name": "Emma Green", "username": "emma_green"}'),
('550e8400-e29b-41d4-a716-446655440227', 'david.kim2@example.com', NOW(), NOW(), NOW(), '{"full_name": "David Kim", "username": "david_kim2"}'),
('550e8400-e29b-41d4-a716-446655440228', 'lucas.rivera@example.com', NOW(), NOW(), NOW(), '{"full_name": "Lucas Rivera", "username": "lucas_rivera"}'),
('550e8400-e29b-41d4-a716-446655440229', 'isabella.rossi@example.com', NOW(), NOW(), NOW(), '{"full_name": "Isabella Rossi", "username": "isabella_rossi"}'),
('550e8400-e29b-41d4-a716-446655440230', 'marco.chef@example.com', NOW(), NOW(), NOW(), '{"full_name": "Chef Marco", "username": "marco_chef"}'),
('550e8400-e29b-41d4-a716-446655440231', 'sarah.chen2@example.com', NOW(), NOW(), NOW(), '{"full_name": "Dr. Sarah Chen", "username": "sarah_chen2"}'),
('550e8400-e29b-41d4-a716-446655440232', 'ana.silva@example.com', NOW(), NOW(), NOW(), '{"full_name": "Ana Silva", "username": "ana_silva"}'),
('550e8400-e29b-41d4-a716-446655440233', 'james.attorney@example.com', NOW(), NOW(), NOW(), '{"full_name": "Attorney James", "username": "james_attorney"}'),
('550e8400-e29b-41d4-a716-446655440234', 'green.energy@example.com', NOW(), NOW(), NOW(), '{"full_name": "Green Energy Co", "username": "green_energy"}'),
('550e8400-e29b-41d4-a716-446655440235', 'edutech.solutions@example.com', NOW(), NOW(), NOW(), '{"full_name": "EduTech Solutions", "username": "edutech_solutions"}'),
('550e8400-e29b-41d4-a716-446655440236', 'garden.tech@example.com', NOW(), NOW(), NOW(), '{"full_name": "Garden Tech", "username": "garden_tech"}'),
('550e8400-e29b-41d4-a716-446655440237', 'dr.wellness@example.com', NOW(), NOW(), NOW(), '{"full_name": "Dr. Wellness", "username": "dr_wellness"}'),
('550e8400-e29b-41d4-a716-446655440238', 'chef.ai@example.com', NOW(), NOW(), NOW(), '{"full_name": "Chef AI", "username": "chef_ai"}'),
('550e8400-e29b-41d4-a716-446655440239', 'secure.id@example.com', NOW(), NOW(), NOW(), '{"full_name": "SecureID Inc", "username": "secure_id"}'),
('550e8400-e29b-41d4-a716-446655440240', 'ecosort@example.com', NOW(), NOW(), NOW(), '{"full_name": "EcoSort", "username": "ecosort"}'),
('550e8400-e29b-41d4-a716-446655440241', 'ar.shop@example.com', NOW(), NOW(), NOW(), '{"full_name": "AR Shop", "username": "ar_shop"}'),
('550e8400-e29b-41d4-a716-446655440242', 'finance.ai@example.com', NOW(), NOW(), NOW(), '{"full_name": "FinanceAI", "username": "finance_ai"}'),
('550e8400-e29b-41d4-a716-446655440243', 'secure.home@example.com', NOW(), NOW(), NOW(), '{"full_name": "SecureHome", "username": "secure_home"}'),
('550e8400-e29b-41d4-a716-446655440244', 'holotech@example.com', NOW(), NOW(), NOW(), '{"full_name": "HoloTech", "username": "holotech"}'),
('550e8400-e29b-41d4-a716-446655440245', 'career.ai@example.com', NOW(), NOW(), NOW(), '{"full_name": "CareerAI", "username": "career_ai"}'),
('550e8400-e29b-41d4-a716-446655440246', 'aqua.tech@example.com', NOW(), NOW(), NOW(), '{"full_name": "AquaTech", "username": "aqua_tech"}'),
('550e8400-e29b-41d4-a716-446655440247', 'art.ai@example.com', NOW(), NOW(), NOW(), '{"full_name": "ArtAI", "username": "art_ai"}'),
('550e8400-e29b-41d4-a716-446655440248', 'pet.tech@example.com', NOW(), NOW(), NOW(), '{"full_name": "PetTech", "username": "pet_tech"}'),
('550e8400-e29b-41d4-a716-446655440249', 'med.ai@example.com', NOW(), NOW(), NOW(), '{"full_name": "MedAI", "username": "med_ai"}');



-- Insert ideas with content
INSERT INTO ideas (id, creator_id, title, status_flag, anonymous, content, version_number, idea_group_id, is_active_version, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440200', 'AI-Powered Meal Planning App', 'trending', FALSE,
$tag$[
  {"type": "heading", "level": 2, "text": "Revolutionary Approach to Meal Planning"},
  {"type": "text", "size": "large", "content": "Our AI-powered meal planning app transforms how people approach nutrition and meal preparation. By leveraging advanced machine learning algorithms, we analyze individual dietary needs, preferences, and constraints to create truly personalized meal plans."},
  {"type": "spacer", "height": 32},
  {"type": "heading", "level": 3, "text": "Key Features"},
  {"type": "text", "content": "• Personalized meal recommendations based on dietary restrictions\n• Budget optimization for grocery shopping\n• Integration with local grocery stores for easy ordering\n• Nutritional tracking and health insights\n• Recipe suggestions based on available ingredients"},
  {"type": "carousel", "slides": [
    {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Smart Meal Planning", "description": "Our AI analyzes your preferences and creates weekly meal plans that fit your lifestyle and dietary needs."},
    {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Budget Optimization", "description": "Automatically optimize your grocery list to maximize nutrition while staying within your budget."},
    {"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "title": "See It In Action", "description": "Watch how our app simplifies meal planning and makes healthy eating accessible to everyone."}
  ]},
  {"type": "spacer", "height": 32},
  {"type": "heading", "level": 3, "text": "Market Opportunity"},
  {"type": "text", "content": "The meal planning market is rapidly growing, with an estimated value of $12.5 billion by 2025. Our solution addresses key pain points: time constraints, dietary restrictions, and budget management. With over 60% of consumers expressing interest in personalized nutrition solutions, the market opportunity is substantial."},
  {"type": "button", "text": "Learn More About Our Technology", "variant": "primary", "href": "/technology"},
  {"type": "spacer", "height": 24},
  {"type": "video", "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "title": "Product Demo", "description": "Watch a comprehensive demo of our AI meal planning features and user interface."},
  {"type": "spacer", "height": 32},
  {"type": "heading", "level": 3, "text": "Technical Implementation"},
  {"type": "html", "content": "<div class=\"bg-gray-100 p-6 rounded-lg\"><h4 class=\"text-xl font-semibold mb-4\">Technology Stack</h4><ul class=\"space-y-2\"><li><strong>Backend:</strong> Node.js with Express, PostgreSQL database</li><li><strong>AI/ML:</strong> TensorFlow for recommendation engine, OpenAI API for recipe generation</li><li><strong>Frontend:</strong> React Native for mobile, React for web</li><li><strong>Integrations:</strong> Stripe for payments, Google Maps API for store locations</li></ul></div>"}
]$tag$,
1, '550e8400-e29b-41d4-a716-446655440010', TRUE, '2024-01-15T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440201', 'Sustainable Fashion Marketplace', 'new', FALSE,
$json$[
  {"type": "heading", "level": 2, "text": "Revolutionizing Fashion Through Sustainability"},
  {"type": "text", "size": "large", "content": "Our marketplace bridges the gap between conscious consumers and ethical fashion brands. We curate a selection of verified sustainable brands, making it easier than ever to shop with purpose and style."},
  {"type": "image", "src": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "alt": "Sustainable fashion brands", "caption": "Discover brands that align with your values"},
  {"type": "heading", "level": 3, "text": "Our Mission"},
  {"type": "text", "content": "We believe fashion should be both beautiful and responsible. Our platform ensures every purchase supports:\n\n• Ethical labor practices\n• Sustainable materials and production\n• Carbon-neutral shipping\n• Circular economy principles"},
  {"type": "carousel", "slides": [
    {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Eco-Friendly Materials", "description": "Browse collections made from organic cotton, recycled polyester, and innovative sustainable fabrics."},
    {"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "title": "Brand Stories", "description": "Learn about the artisans and designers behind each sustainable brand."},
    {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Impact Tracking", "description": "See the environmental impact of your purchases in real-time."}
  ]},
  {"type": "button", "text": "Explore Brands", "variant": "primary", "href": "/brands"},
  {"type": "button", "text": "Learn About Sustainability", "variant": "secondary", "href": "/sustainability"}
]$json$,
1, '550e8400-e29b-41d4-a716-446655440011', TRUE, '2024-01-14T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440202', 'Personal Finance AI Assistant', 'active_discussion', FALSE,
$json$[
  {"type": "heading", "level": 2, "text": "Your Personal Financial Advisor, Always Available"},
  {"type": "text", "size": "large", "content": "Take control of your financial future with our AI-powered assistant. Get personalized insights, automated budgeting, and smart savings recommendations tailored to your unique financial situation."},
  {"type": "video", "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", "title": "How It Works", "description": "See how our AI analyzes your spending patterns and provides actionable financial advice."},
  {"type": "heading", "level": 3, "text": "Key Features"},
  {"type": "html", "content": "<div class=\"grid grid-cols-1 md:grid-cols-2 gap-4\"><div class=\"bg-gray-100 p-4 rounded-lg\"><h4 class=\"font-semibold mb-2\">Smart Budgeting</h4><p class=\"text-sm\">Automatically categorize expenses and create personalized budgets</p></div><div class=\"bg-gray-100 p-4 rounded-lg\"><h4 class=\"font-semibold mb-2\">Savings Goals</h4><p class=\"text-sm\">Set and track financial goals with AI-powered recommendations</p></div><div class=\"bg-gray-100 p-4 rounded-lg\"><h4 class=\"font-semibold mb-2\">Bill Reminders</h4><p class=\"text-sm\">Never miss a payment with intelligent reminders</p></div><div class=\"bg-gray-100 p-4 rounded-lg\"><h4 class=\"font-semibold mb-2\">Investment Insights</h4><p class=\"text-sm\">Get personalized investment advice based on your risk profile</p></div></div>"},
  {"type": "spacer", "height": 24},
  {"type": "text", "content": "Our AI learns from your spending habits and provides increasingly accurate predictions and recommendations. The more you use it, the smarter it gets."},
  {"type": "button", "text": "Start Free Trial", "variant": "primary", "href": "/signup"}
]$json$,
1, '550e8400-e29b-41d4-a716-446655440012', TRUE, '2024-01-12T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440203', 'AR Interior Design Tool', 'validated', FALSE,
$json$[
  {"type": "heading", "level": 2, "text": "See It Before You Buy It"},
  {"type": "text", "size": "large", "content": "Transform your home design process with our cutting-edge AR technology. Place virtual furniture in your actual space using your smartphone camera, ensuring perfect fit and style before making a purchase."},
  {"type": "carousel", "slides": [
    {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Real-Time Visualization", "description": "See how furniture looks in your space with accurate scale and lighting."},
    {"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "title": "AR Demo", "description": "Watch how easy it is to place and arrange virtual furniture in any room."},
    {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Style Matching", "description": "Get AI-powered style recommendations based on your existing decor."}
  ]},
  {"type": "heading", "level": 3, "text": "Why Use AR for Interior Design?"},
  {"type": "text", "content": "Traditional furniture shopping involves guesswork and often leads to returns. Our AR tool eliminates uncertainty by:\n\n• Showing true-to-scale furniture placement\n• Matching colors and styles with your existing decor\n• Saving time and reducing returns\n• Enabling confident purchasing decisions"},
  {"type": "image", "src": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "alt": "AR furniture placement", "caption": "Experience the future of home shopping"},
  {"type": "button", "text": "Download App", "variant": "primary", "href": "/download"}
]$json$,
1, '550e8400-e29b-41d4-a716-446655440013', TRUE, '2024-01-02T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440204', 'AI Content Creation Suite', 'validated', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Create Content 10x Faster with AI"}, {"type": "text", "size": "large", "content": "Our comprehensive AI suite empowers content creators, marketers, and businesses to produce high-quality content at scale. From blog posts to social media captions, our AI understands your brand voice and creates content that resonates."}, {"type": "video", "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", "title": "Content Creation Demo", "description": "Watch how our AI generates engaging content in seconds."}, {"type": "heading", "level": 3, "text": "All-in-One Content Platform"}, {"type": "text", "content": "Our suite includes:\n\n• Blog post generator with SEO optimization\n• Social media content creator for all platforms\n• Email marketing copy generator\n• Product descriptions and ad copy\n• Content rewriting and optimization\n• Multi-language support"}, {"type": "html", "content": "<div class=\"bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border border-accent/20\"><h4 class=\"text-xl font-semibold mb-3\">Enterprise Features</h4><ul class=\"space-y-2\"><li>✓ Team collaboration tools</li><li>✓ Brand voice customization</li><li>✓ Content analytics and insights</li><li>✓ API access for integrations</li><li>✓ Priority support</li></ul></div>"}, {"type": "spacer", "height": 24}, {"type": "button", "text": "Try Free", "variant": "primary", "href": "/signup"}, {"type": "button", "text": "View Pricing", "variant": "outline", "href": "/pricing"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440014', TRUE, '2023-12-31T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440205', 'Virtual Reality Fitness Studio', 'new', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Work Out Anywhere, Anytime"}, {"type": "text", "size": "large", "content": "Experience fitness like never before. Our VR fitness studio transports you to breathtaking locations while you work out, making exercise engaging, fun, and effective."}, {"type": "carousel", "slides": [{"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "title": "Mountain Climbing Workout", "description": "Climb virtual mountains while doing cardio and strength training."}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Beach Yoga Sessions", "description": "Practice yoga on virtual beaches around the world."}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Boxing in Virtual Arenas", "description": "Train like a champion in immersive boxing environments."}]}, {"type": "heading", "level": 3, "text": "Workout Programs"}, {"type": "text", "content": "Choose from hundreds of VR workout programs:\n\n• Cardio adventures in exotic locations\n• Strength training with virtual trainers\n• Yoga and meditation in serene environments\n• Competitive sports and challenges\n• Personalized workout plans"}, {"type": "image", "src": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "alt": "VR fitness equipment", "caption": "All you need is a VR headset to get started"}, {"type": "button", "text": "Start Your Journey", "variant": "primary", "href": "/start"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440015', TRUE, '2024-01-16T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440206', 'Smart City Traffic Optimization', 'validated', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Smarter Cities, Smoother Traffic"}, {"type": "text", "size": "large", "content": "Transform urban mobility with our AI-powered traffic optimization system. Using advanced IoT sensors and machine learning, we reduce congestion, improve air quality, and make cities more livable."}, {"type": "video", "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", "title": "System Overview", "description": "See how our AI analyzes traffic patterns and optimizes signal timing in real-time."}, {"type": "heading", "level": 3, "text": "How It Works"}, {"type": "html", "content": "<div class=\"space-y-4\"><div class=\"flex items-start gap-4\"><div class=\"flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-text-primary font-bold\">1</div><div><h4 class=\"font-semibold mb-1\">IoT Sensor Network</h4><p class=\"text-sm text-text-secondary\">Deploy sensors throughout the city to monitor traffic flow, vehicle counts, and congestion patterns.</p></div></div><div class=\"flex items-start gap-4\"><div class=\"flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-text-primary font-bold\">2</div><div><h4 class=\"font-semibold mb-1\">AI Analysis</h4><p class=\"text-sm text-text-secondary\">Machine learning algorithms process data in real-time to predict traffic patterns and optimize signal timing.</p></div></div><div class=\"flex items-start gap-4\"><div class=\"flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-text-primary font-bold\">3</div><div><h4 class=\"font-semibold mb-1\">Dynamic Optimization</h4><p class=\"text-sm text-text-secondary\">Traffic signals adjust automatically to reduce wait times and improve flow.</p></div></div></div>"}, {"type": "spacer", "height": 24}, {"type": "text", "content": "Cities using our system have seen:\n\n• 30% reduction in average commute time\n• 25% decrease in traffic-related emissions\n• 40% improvement in emergency vehicle response times\n• Significant cost savings on infrastructure"}, {"type": "button", "text": "Request Demo", "variant": "primary", "href": "/demo"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440016', TRUE, '2024-01-17T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440207', 'Blockchain-Based Voting System', 'trending', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Democracy Reimagined with Blockchain"}, {"type": "text", "size": "large", "content": "Our blockchain-based voting system ensures transparency, security, and verifiability in elections. Every vote is encrypted, immutable, and publicly auditable while maintaining voter privacy."}, {"type": "carousel", "slides": [{"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Secure Voting", "description": "Military-grade encryption ensures votes cannot be tampered with or altered."}, {"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", "title": "Transparency", "description": "Public blockchain allows anyone to verify election results without compromising voter privacy."}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Accessibility", "description": "Vote from anywhere using your smartphone or computer."}]}, {"type": "heading", "level": 3, "text": "Key Security Features"}, {"type": "text", "content": "• End-to-end encryption protects voter identity\n• Immutable blockchain ledger prevents vote tampering\n• Multi-factor authentication ensures only eligible voters can participate\n• Real-time result verification\n• Audit trail for complete transparency"}, {"type": "html", "content": "<div class=\"bg-gray-100 p-6 rounded-lg\"><h4 class=\"text-lg font-semibold mb-3\">Trusted By</h4><p class=\"text-sm text-text-secondary mb-4\">Our system has been used in:</p><ul class=\"space-y-2 text-sm\"><li>• University student elections</li><li>• Corporate board voting</li><li>• Community association polls</li><li>• Non-profit organization decisions</li></ul></div>"}, {"type": "button", "text": "Learn More", "variant": "primary", "href": "/learn-more"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440017', TRUE, '2024-01-18T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440208', '3D Printing Marketplace', 'validated', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Bring Your Designs to Life"}, {"type": "text", "size": "large", "content": "Connect with professional 3D printing services worldwide. Upload your designs, get instant quotes, and receive high-quality prints delivered to your door."}, {"type": "image", "src": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "alt": "3D printing process", "caption": "Professional 3D printing services at your fingertips"}, {"type": "heading", "level": 3, "text": "What You Can Create"}, {"type": "text", "content": "Our marketplace supports a wide range of 3D printing applications:\n\n• Product prototypes and testing\n• Custom jewelry and accessories\n• Architectural models\n• Medical devices and prosthetics\n• Art and sculptures\n• Replacement parts and components"}, {"type": "video", "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "title": "See It In Action", "description": "Watch how designers use their platform to bring their ideas to reality."}, {"type": "button", "text": "Upload Design", "variant": "primary", "href": "/upload"}, {"type": "button", "text": "Browse Services", "variant": "secondary", "href": "/services"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440018', TRUE, '2024-01-19T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440209', 'Neural Interface Gaming', 'trending', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Control Games with Your Mind"}, {"type": "text", "size": "large", "content": "Experience the future of gaming with our neural interface technology. Control characters, cast spells, and interact with virtual worlds using only your thoughts. This is not science fiction—it's happening now."}, {"type": "carousel", "slides": [{"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4", "title": "Mind Control Demo", "description": "See how players control games using brain-computer interfaces."}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Immersive Experiences", "description": "Feel like you're truly inside the game with neural feedback."}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Accessibility", "description": "Gaming becomes accessible to everyone, regardless of physical limitations."}]}, {"type": "heading", "level": 3, "text": "How Neural Gaming Works"}, {"type": "text", "content": "Our headset reads brain signals through EEG sensors:\n\n1. Think about an action (move left, jump, attack)\n2. Neural patterns are detected and interpreted\n3. Commands are sent to the game in real-time\n4. Visual and haptic feedback enhances immersion"}, {"type": "html", "content": "<div class=\"bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-lg border border-purple-500/20\"><h4 class=\"text-xl font-semibold mb-3\">Supported Games</h4><div class=\"grid grid-cols-2 gap-3 text-sm\"><div>✓ Puzzle Games</div><div>✓ Strategy Games</div><div>✓ Adventure Games</div><div>✓ Racing Games</div><div>✓ VR Experiences</div><div>✓ Educational Apps</div></div></div>"}, {"type": "button", "text": "Pre-Order Now", "variant": "primary", "href": "/preorder"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440019', TRUE, '2024-01-20T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440201', 'Carbon Capture Technology', 'active_discussion', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Direct Air Capture at Scale"}, {"type": "text", "size": "large", "content": "Our breakthrough carbon capture technology removes CO2 directly from the atmosphere at unprecedented efficiency. Using advanced molecular sieves and renewable energy, we can capture carbon at a fraction of current costs."}, {"type": "image", "src": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "alt": "Carbon capture facility", "caption": "Our modular capture units can be deployed anywhere"}, {"type": "heading", "level": 3, "text": "How It Works"}, {"type": "text", "content": "Our system uses:\n\n• Advanced molecular sieves that selectively capture CO2\n• Renewable energy for the capture process\n• Underground storage in basalt formations\n• Real-time monitoring and optimization"}, {"type": "button", "text": "View Technical Details", "variant": "primary", "href": "/technology"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440020', TRUE, '2024-01-21T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440203', 'Autonomous AI Ethics Framework', 'new', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Ethical AI Decision Making"}, {"type": "text", "size": "large", "content": "As AI systems become more autonomous, we need robust ethical frameworks to ensure they make decisions aligned with human values. Our framework provides a comprehensive approach to ethical AI development and deployment."}, {"type": "heading", "level": 3, "text": "Key Components"}, {"type": "text", "content": "• Value alignment algorithms\n• Ethical decision trees\n• Bias detection and mitigation\n• Transparency and explainability\n• Human oversight mechanisms"}, {"type": "button", "text": "Read White Paper", "variant": "primary", "href": "/whitepaper"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440021', TRUE, '2024-01-22T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440205', 'Telemedicine Platform', 'validated', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Healthcare Access Anywhere"}, {"type": "text", "size": "large", "content": "Our telemedicine platform connects patients with healthcare providers worldwide, breaking down geographical barriers and improving access to quality medical care."}, {"type": "video", "src": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", "title": "Platform Demo", "description": "See how our platform works for both patients and providers"}, {"type": "heading", "level": 3, "text": "Features"}, {"type": "text", "content": "• Real-time video consultations\n• AI-powered triage and diagnosis assistance\n• Secure medical record sharing\n• Multi-language support\n• Integration with wearable devices"}, {"type": "button", "text": "Try Demo", "variant": "primary", "href": "/demo"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440022', TRUE, '2024-01-23T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440206', 'Cryptocurrency Risk Assessment', 'trending', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Smart Crypto Investment Decisions"}, {"type": "text", "size": "large", "content": "Our AI-powered platform analyzes cryptocurrency markets, blockchain metrics, and macroeconomic factors to provide comprehensive risk assessments and investment recommendations."}, {"type": "heading", "level": 3, "text": "Risk Analysis"}, {"type": "text", "content": "• On-chain metrics analysis\n• Market sentiment tracking\n• Regulatory risk assessment\n• Technical analysis\n• Portfolio optimization"}, {"type": "button", "text": "Start Analysis", "variant": "primary", "href": "/analyze"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440023', TRUE, '2024-01-24T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440207', 'VR Learning Environments', 'active_discussion', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Immersive Education Revolution"}, {"type": "text", "size": "large", "content": "Transform learning with virtual reality environments that make complex subjects accessible and engaging. From exploring ancient civilizations to understanding molecular structures, VR brings education to life."}, {"type": "carousel", "slides": [{"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Historical Exploration", "description": "Walk through ancient Rome or Victorian London"}, {"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", "title": "Science Labs", "description": "Conduct virtual experiments in safe environments"}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Language Learning", "description": "Practice conversations in virtual cities"}]}, {"type": "button", "text": "Explore Curriculum", "variant": "primary", "href": "/curriculum"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440024', TRUE, '2024-01-25T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440208', 'Smart Traffic Light System', 'validated', FALSE,
$json$[{"type": "heading", "level": 2, "text": "AI-Optimized Traffic Flow"}, {"type": "text", "size": "large", "content": "Our intelligent traffic light system uses computer vision, IoT sensors, and machine learning to optimize traffic flow in real-time, reducing congestion and emissions."}, {"type": "heading", "level": 3, "text": "Benefits"}, {"type": "text", "content": "• 40% reduction in travel time\n• 25% decrease in emissions\n• Emergency vehicle priority\n• Pedestrian safety improvements\n• Adaptive to changing conditions"}, {"type": "button", "text": "See Case Studies", "variant": "primary", "href": "/case-studies"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440025', TRUE, '2024-01-26T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440209', 'Recycling AI Sorter', 'new', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Perfect Recycling Every Time"}, {"type": "text", "size": "large", "content": "Our AI-powered recycling sorter uses advanced computer vision to identify and sort recyclable materials with 99% accuracy, making recycling efficient and profitable."}, {"type": "image", "src": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "alt": "AI recycling sorter", "caption": "Automated sorting at scale"}, {"type": "heading", "level": 3, "text": "Technology"}, {"type": "text", "content": "• Multi-spectral imaging\n• Deep learning classification\n• Robotic sorting arms\n• Real-time quality control\n• Integration with existing facilities"}, {"type": "button", "text": "Schedule Demo", "variant": "primary", "href": "/demo"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440026', TRUE, '2024-01-27T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440210', 'Quantum Computing Applications', 'trending', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Quantum Advantage Today"}, {"type": "text", "size": "large", "content": "While full quantum supremacy is still developing, our hybrid quantum-classical algorithms provide practical advantages for optimization, simulation, and machine learning problems."}, {"type": "heading", "level": 3, "text": "Applications"}, {"type": "text", "content": "• Drug discovery optimization\n• Financial portfolio optimization\n• Supply chain optimization\n• Climate modeling\n• Cryptography research"}, {"type": "button", "text": "Access Quantum Cloud", "variant": "primary", "href": "/quantum-cloud"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440027', TRUE, '2024-01-28T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440211', 'Mental Health AI Companion', 'active_discussion', FALSE,
$json$[{"type": "heading", "level": 2, "text": "24/7 Mental Health Support"}, {"type": "text", "size": "large", "content": "Our AI companion provides personalized mental health support, combining evidence-based techniques with continuous learning from user interactions and clinical research."}, {"type": "heading", "level": 3, "text": "Features"}, {"type": "text", "content": "• Cognitive behavioral therapy techniques\n• Mood tracking and analysis\n• Crisis detection and response\n• Personalized coping strategies\n• Integration with human therapists"}, {"type": "button", "text": "Learn More", "variant": "primary", "href": "/mental-health"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440028', TRUE, '2024-01-29T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440212', 'Blockchain Supply Chain', 'validated', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Transparent Supply Chains"}, {"type": "text", "size": "large", "content": "Our blockchain platform provides end-to-end visibility and traceability for supply chains, ensuring authenticity, reducing fraud, and improving efficiency."}, {"type": "heading", "level": 3, "text": "Benefits"}, {"type": "text", "content": "• Product authenticity verification\n• Real-time tracking\n• Automated compliance\n• Reduced counterfeiting\n• Improved efficiency"}, {"type": "button", "text": "View Demo", "variant": "primary", "href": "/supply-chain-demo"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440029', TRUE, '2024-01-30T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440213', 'Gamified Education Platform', 'new', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Learning Through Play"}, {"type": "text", "size": "large", "content": "Our gamified learning platform makes education engaging and effective by incorporating game mechanics, rewards, and social learning into traditional curricula."}, {"type": "carousel", "slides": [{"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Math Adventures", "description": "Solve math problems while exploring fantasy worlds"}, {"video": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", "title": "Science Quests", "description": "Complete science missions and experiments"}, {"image": "https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg", "title": "Language Challenges", "description": "Learn languages through interactive stories"}]}, {"type": "button", "text": "Try Free Lessons", "variant": "primary", "href": "/try-free"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440030', TRUE, '2024-01-31T00:00:00Z'),

('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440214', 'IoT Water Quality Monitor', 'trending', FALSE,
$json$[{"type": "heading", "level": 2, "text": "Clean Water Intelligence"}, {"type": "text", "size": "large", "content": "Our IoT sensors continuously monitor water quality in real-time, providing early warning systems for contamination and helping maintain safe water supplies worldwide."}, {"type": "heading", "level": 3, "text": "Monitoring Parameters"}, {"type": "text", "content": "• pH levels\n• Turbidity\n• Chemical contaminants\n• Biological indicators\n• Temperature and flow rate"}, {"type": "button", "text": "Install Sensors", "variant": "primary", "href": "/install"}]$json$,
1, '550e8400-e29b-41d4-a716-446655440031', TRUE, '2024-02-01T00:00:00Z');

-- Insert idea votes
INSERT INTO idea_votes (voter_id, idea_id, vote_type) VALUES
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440219', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440220', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440221', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440222', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440223', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440224', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440225', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440226', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440227', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440228', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440229', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440230', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440231', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440232', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440233', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440234', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440235', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440236', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440237', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440238', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440239', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440240', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440241', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440242', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440243', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440244', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440245', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440246', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440247', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440248', '550e8400-e29b-41d4-a716-446655440010', 'use'),
('550e8400-e29b-41d4-a716-446655440249', '550e8400-e29b-41d4-a716-446655440010', 'pay'),
('550e8400-e29b-41d4-a716-446655440200', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440218', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440219', '550e8400-e29b-41d4-a716-446655440010', 'dislike'),
('550e8400-e29b-41d4-a716-446655440220', '550e8400-e29b-41d4-a716-446655440010', 'dislike');

-- Insert tags
INSERT INTO tags (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440300', 'AI'),
('550e8400-e29b-41d4-a716-446655440301', 'Health'),
('550e8400-e29b-41d4-a716-446655440302', 'Food'),
('550e8400-e29b-41d4-a716-446655440303', 'Fashion'),
('550e8400-e29b-41d4-a716-446655440304', 'Sustainability'),
('550e8400-e29b-41d4-a716-446655440305', 'E-commerce'),
('550e8400-e29b-41d4-a716-446655440306', 'Finance'),
('550e8400-e29b-41d4-a716-446655440307', 'Fintech'),
('550e8400-e29b-41d4-a716-446655440308', 'AR'),
('550e8400-e29b-41d4-a716-446655440309', 'Design');

-- Insert idea tags
INSERT INTO idea_tags (idea_id, tag_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440300'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440301'),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440302'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440303'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440304'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440305'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440300'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440306'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440307'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440308'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440305'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440309'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440300'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440305'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440301'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440306'),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440300'),
('550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440305'),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440300'),
('550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440306'),
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440305'),
('550e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440309'),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440300'),
('550e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440306');








-- Insert media assets (must be first due to foreign key constraints)
INSERT INTO media_assets (id, type, url) VALUES
('550e8400-e29b-41d4-a716-446655440320', 'image', 'https://i.pinimg.com/736x/c5/25/79/c52579ef24e8579758053164837b33d2.jpg'),
('550e8400-e29b-41d4-a716-446655440321', 'image', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcowXahnyt_VqT8gHIR0JWcgSl832FAQ6yFQ&s'),
('550e8400-e29b-41d4-a716-446655440322', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
('550e8400-e29b-41d4-a716-446655440323', 'video', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
('550e8400-e29b-41d4-a716-446655440324', 'image', 'https://is1-ssl.mzstatic.com/image/thumb/B0-2kLh7yVSyBsPEiULgHQ/1200x675.jpg');

-- Set profile images for all users
UPDATE users SET profile_media_id = '550e8400-e29b-41d4-a716-446655440324';

-- Insert idea media
INSERT INTO idea_media (idea_id, media_id, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440320', 0),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440322', 1),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440321', 0);


INSERT INTO notifications (id, user_id, type, payload, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440390', '550e8400-e29b-41d4-a716-446655440200', 'idea_vote', '{"idea_id": "550e8400-e29b-41d4-a716-446655440010", "voter_id": "550e8400-e29b-41d4-a716-446655440201"}', false),
('550e8400-e29b-41d4-a716-446655440391', '550e8400-e29b-41d4-a716-446655440200', 'comment', '{"idea_id": "550e8400-e29b-41d4-a716-446655440010", "comment_id": "550e8400-e29b-41d4-a716-446655440100"}', true),
('550e8400-e29b-41d4-a716-446655440392', '550e8400-e29b-41d4-a716-446655440201', 'badge_awarded', '{"badge_id": "550e8400-e29b-41d4-a716-446655440310"}', false);

INSERT INTO comments (id, idea_id, user_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440200', 'Esta es una idea increíble! Me encanta cómo aborda el problema desde una perspectiva única.', '2024-01-15T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440201', '¿Has considerado el impacto en el mercado internacional? Sería interesante explorar esa dimensión.', '2024-01-15T08:00:00Z'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440202', 'La implementación técnica parece sólida. ¿Tienes algún prototipo funcionando?', '2024-01-14T20:00:00Z'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440203', 'El modelo de negocio es prometedor. Creo que hay potencial para escalar esto rápidamente.', '2024-01-14T15:00:00Z');

-- Insert comment votes
INSERT INTO comment_votes (comment_id, user_id, reaction_type) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440201', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440203', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440204', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440205', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440206', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440207', 'upvote'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440200', 'helpful'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440201', 'helpful'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440202', 'helpful'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440203', 'helpful'),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440204', 'helpful'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'upvote'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440203', 'upvote'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440204', 'upvote'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440200', 'helpful'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'helpful'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440202', 'helpful'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440201', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440203', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440204', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440205', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440206', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440207', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440208', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440209', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440210', 'upvote'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440211', 'upvote'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440201', 'upvote'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440203', 'upvote');

-- Insert reply to comment-1-1
INSERT INTO comments (id, idea_id, user_id, parent_comment_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440100', 'Totalmente de acuerdo! La perspectiva es muy innovadora.', '2024-01-15T11:00:00Z');

-- Insert votes for reply
INSERT INTO comment_votes (comment_id, user_id, reaction_type) VALUES
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440200', 'helpful'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440202', 'helpful');

-- Insert deeply nested comments for idea 1 (up to 4 levels)
INSERT INTO comments (id, idea_id, user_id, parent_comment_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440104', 'Sí, especialmente el enfoque en la personalización. ¿Cómo manejan la privacidad de los datos?', '2024-01-15T12:00:00Z'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440105', 'Excelente pregunta. Usamos encriptación end-to-end y cumplimiento GDPR completo.', '2024-01-15T13:00:00Z'),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440106', '¿Y qué pasa con los usuarios en países sin regulaciones de privacidad fuertes?', '2024-01-15T14:00:00Z'),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440107', 'Aplicamos los estándares más altos independientemente de la ubicación del usuario.', '2024-01-15T15:00:00Z');

-- Insert comments for idea 2 (Carbon Capture)
INSERT INTO comments (id, idea_id, user_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440204', '¿Cuál es el costo por tonelada de CO2 capturado?', '2024-01-21T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440205', 'El potencial de escalabilidad es impresionante. ¿Dónde planean ubicar las primeras plantas?', '2024-01-21T11:00:00Z');

-- Nested replies for idea 2
INSERT INTO comments (id, idea_id, user_id, parent_comment_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440110', 'Actualmente estamos en $50-70 por tonelada, con objetivo de bajar a $30 en 2 años.', '2024-01-21T12:00:00Z'),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440112', 'Eso es competitivo con otras tecnologías. ¿Cómo se compara con la captura en plantas de energía?', '2024-01-21T13:00:00Z'),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440113', 'Nuestra tecnología es más eficiente para captura directa del aire, no requiere proximidad a fuentes puntuales.', '2024-01-21T14:00:00Z'),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440114', 'Interesante. ¿Han considerado asociaciones con empresas petroleras para compensación de carbono?', '2024-01-21T15:00:00Z');

-- Insert comments for idea 3 (AI Ethics)
INSERT INTO comments (id, idea_id, user_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440208', '¿Cómo manejan el trade-off entre autonomía y supervisión humana?', '2024-01-22T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440209', 'El framework parece completo. ¿Han probado con casos reales?', '2024-01-22T11:00:00Z');

-- Deep nesting for idea 3
INSERT INTO comments (id, idea_id, user_id, parent_comment_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440120', 'Usamos un sistema de "guardianes éticos" que pueden intervenir en tiempo real.', '2024-01-22T12:00:00Z'),
('550e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440122', '¿Cómo se entrenan estos guardianes? ¿Usan machine learning también?', '2024-01-22T13:00:00Z'),
('550e8400-e29b-41d4-a716-446655440124', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440123', 'Sí, usan reinforcement learning con datasets de dilemas éticos históricos.', '2024-01-22T14:00:00Z'),
('550e8400-e29b-41d4-a716-446655440125', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440124', 'Fascinante. ¿Cómo evitan el sesgo en esos datasets históricos?', '2024-01-22T15:00:00Z'),
('550e8400-e29b-41d4-a716-446655440126', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440125', 'Aplicamos técnicas de debiasing y validación cruzada cultural.', '2024-01-22T16:00:00Z');

-- Insert comments for idea 4 (Telemedicine)
INSERT INTO comments (id, idea_id, user_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440212', '¿Cómo manejan la diagnosis remota en especialidades complejas?', '2024-01-23T10:00:00Z'),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440213', 'La integración con wearables es clave. ¿Qué dispositivos soportan?', '2024-01-23T11:00:00Z');

-- Nested replies for idea 4
INSERT INTO comments (id, idea_id, user_id, parent_comment_id, content, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440130', 'Colaboramos con especialistas para casos complejos, usando IA para pre-diagnosis.', '2024-01-23T12:00:00Z'),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440132', '¿Cómo garantizan la calidad de la pre-diagnosis por IA?', '2024-01-23T13:00:00Z'),
('550e8400-e29b-41d4-a716-446655440134', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440133', 'Validamos contra datasets médicos certificados y tenemos supervisión humana.', '2024-01-23T14:00:00Z'),
('550e8400-e29b-41d4-a716-446655440135', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440134', 'Suena prometedor. ¿Han publicado estudios de precisión?', '2024-01-23T15:00:00Z');

-- Insert votes for new comments
INSERT INTO comment_votes (comment_id, user_id, reaction_type) VALUES
-- Votes for idea 1 deep nesting
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440201', 'helpful'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440203', 'helpful'),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440204', 'upvote'),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440205', 'upvote'),
-- Votes for idea 2
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440206', 'upvote'),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440207', 'upvote'),
('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440208', 'helpful'),
('550e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440209', 'upvote'),
('550e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440210', 'upvote'),
('550e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440211', 'helpful'),
-- Votes for idea 3
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440212', 'upvote'),
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440213', 'upvote'),
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440214', 'helpful'),
('550e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440215', 'upvote'),
('550e8400-e29b-41d4-a716-446655440124', '550e8400-e29b-41d4-a716-446655440200', 'upvote'),
('550e8400-e29b-41d4-a716-446655440125', '550e8400-e29b-41d4-a716-446655440201', 'helpful'),
('550e8400-e29b-41d4-a716-446655440126', '550e8400-e29b-41d4-a716-446655440202', 'upvote'),
-- Votes for idea 4
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440203', 'upvote'),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440204', 'upvote'),
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440205', 'helpful'),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440206', 'upvote'),
('550e8400-e29b-41d4-a716-446655440134', '550e8400-e29b-41d4-a716-446655440207', 'upvote'),
('550e8400-e29b-41d4-a716-446655440135', '550e8400-e29b-41d4-a716-446655440208', 'helpful');

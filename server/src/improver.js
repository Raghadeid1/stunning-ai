/**
 * Deterministic prompt improvement logic
 * Converts rough website ideas into structured website-building prompts
 */

// Industry detection keywords
const INDUSTRY_KEYWORDS = {
    'E-commerce': ['shop', 'store', 'buy', 'sell', 'product', 'cart', 'checkout', 'ecommerce', 'retail', 'merchandise', 'marketplace', 'shopify'],
    'SaaS': ['saas', 'software', 'app', 'platform', 'tool', 'dashboard', 'subscription', 'service', 'application'],
    'Restaurant': ['restaurant', 'cafe', 'food', 'menu', 'dining', 'chef', 'kitchen', 'cuisine', 'meal', 'delivery', 'bistro', 'bar', 'pub', 'fast food'],
    'Fitness': ['gym', 'fitness', 'workout', 'exercise', 'personal trainer', 'yoga', 'pilates', 'health', 'wellness', 'crossfit', 'zumba'],
    'Real Estate': ['property', 'real estate', 'house', 'apartment', 'rent', 'buy', 'agent', 'realtor', 'listing', 'mortgage', 'homes'],
    'Education': ['school', 'course', 'education', 'learn', 'student', 'teacher', 'tutor', 'training', 'academy', 'university', 'college'],
    'Healthcare': ['doctor', 'clinic', 'hospital', 'health', 'medical', 'patient', 'treatment', 'therapy', 'wellness', 'dental', 'pharmacy'],
    'Legal': ['lawyer', 'attorney', 'legal', 'law', 'firm', 'case', 'court', 'advocate', 'litigation'],
    'Beauty': ['salon', 'beauty', 'spa', 'hair', 'nail', 'makeup', 'cosmetic', 'skincare', 'barber', 'stylist'],
    'Automotive': ['car', 'auto', 'vehicle', 'mechanic', 'repair', 'dealership', 'wash', 'garage', 'tire', 'detailing'],
    'Technology': ['tech', 'software', 'development', 'digital', 'it', 'computer', 'code', 'programming'],
    'Travel': ['travel', 'tour', 'vacation', 'hotel', 'booking', 'tourism', 'destination', 'trip', 'airline', 'cruise'],
    'Entertainment': ['entertainment', 'music', 'concert', 'event', 'venue', 'tickets', 'theater', 'movie', 'cinema'],
    'Photography': ['photo', 'photography', 'photographer', 'camera', 'wedding', 'portrait', 'event photography'],
    'Consulting': ['consulting', 'consultant', 'advisor', 'expert', 'consultation', 'strategy'],
    'Non-profit': ['non-profit', 'nonprofit', 'charity', 'donation', 'volunteer', 'cause', 'foundation'],
    'Finance': ['finance', 'financial', 'bank', 'investment', 'accounting', 'tax', 'insurance', 'loan', 'credit'],
    'Marketing': ['marketing', 'advertising', 'agency', 'brand', 'campaign', 'social media', 'seo', 'ppc'],
    'Wedding': ['wedding', 'bride', 'groom', 'ceremony', 'reception', 'planner', 'bridal'],
    'Pet Services': ['pet', 'dog', 'cat', 'veterinary', 'grooming', 'boarding', 'pet care', 'animal'],
    'Home Services': ['plumbing', 'electrical', 'cleaning', 'landscaping', 'home repair', 'maintenance', 'handyman'],
    'Coaching': ['coach', 'coaching', 'mentor', 'life coach', 'business coach', 'career coach'],
    'Art & Design': ['art', 'artist', 'design', 'gallery', 'creative', 'illustration', 'painting'],
    'Music': ['music', 'musician', 'band', 'studio', 'recording', 'lessons', 'instrument'],
    'Food & Beverage': ['bakery', 'catering', 'beverage', 'coffee', 'tea', 'brewery', 'winery'],
    'Sports': ['sports', 'athlete', 'team', 'soccer', 'basketball', 'football', 'tennis', 'golf'],
    'Fashion': ['fashion', 'clothing', 'apparel', 'boutique', 'designer', 'style', 'wardrobe']
};

// Audience detection keywords
const AUDIENCE_KEYWORDS = {
    'Small Business Owners': ['business', 'owner', 'small business', 'entrepreneur', 'startup', 'local business', 'sme'],
    'Consumers': ['customer', 'user', 'client', 'people', 'everyone', 'public', 'shopper', 'buyer'],
    'Professionals': ['professional', 'expert', 'specialist', 'consultant', 'corporate', 'executive'],
    'Students': ['student', 'learner', 'young', 'education', 'school', 'college', 'university'],
    'Seniors': ['senior', 'elderly', 'retired', 'older', 'aged'],
    'Parents': ['parent', 'family', 'kids', 'children', 'mom', 'dad', 'families'],
    'B2B': ['b2b', 'business to business', 'company', 'enterprise', 'corporate', 'organization'],
    'Homeowners': ['homeowner', 'home owner', 'property owner', 'residential'],
    'Travelers': ['traveler', 'tourist', 'visitor', 'vacationer', 'travel'],
    'Artists & Creatives': ['artist', 'creative', 'designer', 'photographer', 'musician'],
    'Athletes': ['athlete', 'player', 'sports', 'fitness enthusiast'],
    'Millennials': ['millennial', 'gen y', 'young adult', 'millennials'],
    'Gen Z': ['gen z', 'gen z', 'teen', 'teenager', 'young'],
    'Tech Enthusiasts': ['tech', 'developer', 'programmer', 'coder', 'technologist']
};

// Tone detection keywords
const TONE_KEYWORDS = {
    'Professional': ['professional', 'corporate', 'serious', 'business', 'formal', 'executive'],
    'Friendly': ['friendly', 'welcoming', 'warm', 'casual', 'approachable', 'inviting'],
    'Modern': ['modern', 'cutting-edge', 'innovative', 'trendy', 'sleek', 'contemporary'],
    'Elegant': ['elegant', 'luxury', 'premium', 'sophisticated', 'refined', 'upscale'],
    'Fun': ['fun', 'playful', 'creative', 'vibrant', 'energetic', 'lively'],
    'Minimalist': ['minimal', 'minimalist', 'simple', 'clean', 'minimalist'],
    'Bold': ['bold', 'dramatic', 'striking', 'powerful', 'confident'],
    'Rustic': ['rustic', 'organic', 'natural', 'earthly', 'handcrafted'],
    'Tech-forward': ['tech', 'digital', 'futuristic', 'high-tech', 'innovative']
};

/**
 * Detect industry from idea text
 */
export function detectIndustry(idea) {
    const lowerIdea = idea.toLowerCase();

    // Count matches for each industry
    const scores = {};
    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
        scores[industry] = keywords.filter(keyword =>
            lowerIdea.includes(keyword.toLowerCase())
        ).length;
    }

    // Find industry with highest score
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) {
        return 'General Business'; // Default
    }

    const detected = Object.keys(scores).find(key => scores[key] === maxScore);
    return detected || 'General Business';
}

/**
 * Detect target audience from idea text
 */
export function detectAudience(idea) {
    const lowerIdea = idea.toLowerCase();

    const scores = {};
    for (const [audience, keywords] of Object.entries(AUDIENCE_KEYWORDS)) {
        scores[audience] = keywords.filter(keyword =>
            lowerIdea.includes(keyword.toLowerCase())
        ).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) {
        return 'General Public';
    }

    const detected = Object.keys(scores).find(key => scores[key] === maxScore);
    return detected || 'General Public';
}

/**
 * Detect tone from idea text
 */
export function detectTone(idea) {
    const lowerIdea = idea.toLowerCase();

    const scores = {};
    for (const [tone, keywords] of Object.entries(TONE_KEYWORDS)) {
        scores[tone] = keywords.filter(keyword =>
            lowerIdea.includes(keyword.toLowerCase())
        ).length;
    }

    const maxScore = Math.max(...Object.values(scores));
    if (maxScore === 0) {
        return 'Professional'; // Default
    }

    const detected = Object.keys(scores).find(key => scores[key] === maxScore);
    return detected || 'Professional';
}

/**
 * Extract key phrases from idea for goal and features
 */
function extractKeyPhrases(idea) {
    // Simple extraction: look for common patterns
    const sentences = idea.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 3); // Take first 3 sentences as key points
}

/**
 * Generate SEO keywords based on industry and idea
 */
function generateSEOKeywords(industry, idea) {
    const lowerIdea = idea.toLowerCase();
    const baseKeywords = [];

    // Extract nouns and important words (simple heuristic)
    const words = idea.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)].slice(0, 5);

    baseKeywords.push(...uniqueWords);
    baseKeywords.push(industry.toLowerCase());

    // Add common industry-specific keywords
    const industrySEO = {
        'E-commerce': ['online shopping', 'buy online', 'secure checkout', 'free shipping'],
        'SaaS': ['software solution', 'cloud-based', 'automation', 'productivity'],
        'Restaurant': ['food delivery', 'dine in', 'reservations', 'online ordering'],
        'Fitness': ['fitness training', 'health goals', 'workout plans', 'personal training'],
        'Real Estate': ['property listings', 'home search', 'real estate', 'property search'],
        'Education': ['online learning', 'courses', 'education', 'e-learning'],
        'Healthcare': ['medical care', 'health services', 'patient care', 'healthcare'],
        'Automotive': ['car services', 'auto repair', 'vehicle maintenance', 'car repair'],
        'Travel': ['travel booking', 'hotel reservations', 'vacation packages', 'travel deals'],
        'Entertainment': ['event tickets', 'live events', 'entertainment', 'shows'],
        'Photography': ['photography services', 'photo shoots', 'wedding photography', 'portrait photography'],
        'Consulting': ['business consulting', 'consultation', 'expert advice', 'strategy'],
        'Non-profit': ['donate', 'charity', 'volunteer', 'non-profit organization'],
        'Finance': ['financial planning', 'investment', 'banking', 'financial services'],
        'Marketing': ['digital marketing', 'advertising', 'branding', 'marketing agency'],
        'Wedding': ['wedding planning', 'bridal services', 'wedding venue', 'wedding vendors'],
        'Pet Services': ['pet care', 'veterinary services', 'pet grooming', 'pet boarding'],
        'Home Services': ['home repair', 'home maintenance', 'plumbing', 'home services'],
        'Coaching': ['life coaching', 'business coaching', 'career coaching', 'personal development'],
        'Art & Design': ['art gallery', 'custom art', 'design services', 'artwork'],
        'Music': ['music lessons', 'recording studio', 'music production', 'music services'],
        'Food & Beverage': ['catering', 'bakery', 'coffee shop', 'beverages'],
        'Sports': ['sports training', 'athletic services', 'sports facilities', 'sports coaching'],
        'Fashion': ['fashion boutique', 'clothing store', 'style', 'apparel']
    };

    if (industrySEO[industry]) {
        baseKeywords.push(...industrySEO[industry]);
    }

    return [...new Set(baseKeywords)].slice(0, 8);
}

/**
 * Suggest tech stack based on industry
 */
function suggestTechStack(industry) {
    const techStacks = {
        'E-commerce': ['React', 'Node.js', 'Stripe API', 'MongoDB', 'AWS', 'Payment Gateway'],
        'SaaS': ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS', 'Authentication'],
        'Restaurant': ['React', 'Node.js', 'MongoDB', 'Payment Gateway', 'Google Maps API'],
        'Fitness': ['React', 'Node.js', 'MongoDB', 'Calendar API', 'Payment Gateway'],
        'Real Estate': ['React', 'Node.js', 'PostgreSQL', 'Google Maps API', 'Image CDN'],
        'Education': ['React', 'Node.js', 'MongoDB', 'Video Streaming', 'Payment Gateway'],
        'Healthcare': ['React', 'Node.js', 'PostgreSQL', 'HIPAA-compliant hosting', 'Encryption'],
        'Automotive': ['React', 'Node.js', 'MongoDB', 'Google Maps API', 'SMS API'],
        'Travel': ['React', 'Node.js', 'PostgreSQL', 'Payment Gateway', 'Booking API'],
        'Entertainment': ['React', 'Node.js', 'MongoDB', 'Ticket API', 'Payment Gateway'],
        'Photography': ['React', 'Node.js', 'Image CDN', 'MongoDB', 'Gallery API'],
        'Consulting': ['React', 'Node.js', 'MongoDB', 'Calendar API', 'Email Service'],
        'Non-profit': ['React', 'Node.js', 'MongoDB', 'Payment Gateway', 'Email Service'],
        'Finance': ['React', 'Node.js', 'PostgreSQL', 'Security APIs', 'Encryption'],
        'Marketing': ['React', 'Node.js', 'MongoDB', 'Analytics API', 'Email Service'],
        'Wedding': ['React', 'Node.js', 'MongoDB', 'Calendar API', 'Image CDN'],
        'Pet Services': ['React', 'Node.js', 'MongoDB', 'Calendar API', 'Payment Gateway'],
        'Home Services': ['React', 'Node.js', 'MongoDB', 'Google Maps API', 'SMS API'],
        'Coaching': ['React', 'Node.js', 'MongoDB', 'Video API', 'Payment Gateway'],
        'Art & Design': ['React', 'Node.js', 'Image CDN', 'MongoDB', 'Gallery'],
        'Music': ['React', 'Node.js', 'MongoDB', 'Audio API', 'Payment Gateway'],
        'Food & Beverage': ['React', 'Node.js', 'MongoDB', 'Payment Gateway', 'Delivery API'],
        'Sports': ['React', 'Node.js', 'MongoDB', 'Calendar API', 'Payment Gateway'],
        'Fashion': ['React', 'Node.js', 'MongoDB', 'Image CDN', 'Payment Gateway'],
        'General Business': ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']
    };

    return techStacks[industry] || techStacks['General Business'];
}

/**
 * Build the improved prompt structure
 */
export function buildPrompt({ idea, industry, audience, tone }) {
    const keyPhrases = extractKeyPhrases(idea);
    const seoKeywords = generateSEOKeywords(industry, idea);
    const techStack = suggestTechStack(industry);

    // Build goal from first sentence or key phrase
    const goal = keyPhrases[0] || idea.split('.')[0] || idea.substring(0, 100);

    // Extract features/key points
    const features = keyPhrases.slice(1).map(phrase => {
        const cleaned = phrase.trim();
        if (cleaned.length > 80) {
            return cleaned.substring(0, 77) + '...';
        }
        return cleaned;
    });

    // If we don't have enough features, generate some based on industry
    if (features.length < 3) {
        const defaultFeatures = {
            'E-commerce': [
                'Product catalog with categories and filters',
                'Shopping cart and secure checkout',
                'User accounts and order history'
            ],
            'SaaS': [
                'User authentication and dashboard',
                'Core feature implementation',
                'Subscription management and billing'
            ],
            'Restaurant': [
                'Menu display with categories',
                'Online ordering system',
                'Reservation booking system'
            ],
            'Fitness': [
                'Class schedules and booking',
                'Member profiles and progress tracking',
                'Payment processing for memberships'
            ],
            'Real Estate': [
                'Property listings with search and filters',
                'Property detail pages with images',
                'Contact forms for inquiries'
            ],
            'Education': [
                'Course catalog and enrollment',
                'Student dashboard and progress tracking',
                'Payment processing for courses'
            ],
            'Travel': [
                'Destination listings with search',
                'Booking system with calendar',
                'Payment processing and confirmation'
            ],
            'Entertainment': [
                'Event listings and calendar',
                'Ticket purchase system',
                'Event details and information'
            ],
            'Photography': [
                'Portfolio gallery display',
                'Booking system for sessions',
                'Client portal for viewing photos'
            ],
            'Consulting': [
                'Service offerings display',
                'Appointment booking system',
                'Contact forms for inquiries'
            ],
            'Non-profit': [
                'Mission and impact stories',
                'Donation processing system',
                'Volunteer registration'
            ],
            'Finance': [
                'Service offerings display',
                'Contact and consultation booking',
                'Resource library and tools'
            ],
            'Marketing': [
                'Portfolio and case studies',
                'Service packages display',
                'Contact forms for proposals'
            ],
            'Wedding': [
                'Services and packages display',
                'Gallery of past weddings',
                'Booking and inquiry forms'
            ],
            'Pet Services': [
                'Service offerings display',
                'Appointment booking system',
                'Pet profiles and records'
            ],
            'Home Services': [
                'Service listings with pricing',
                'Request quote/booking system',
                'Service area coverage map'
            ],
            'Coaching': [
                'Program offerings display',
                'Session booking system',
                'Client portal for resources'
            ],
            'Art & Design': [
                'Portfolio gallery',
                'Commission request system',
                'Artwork purchase/contact forms'
            ],
            'Music': [
                'Audio samples and portfolio',
                'Lesson booking system',
                'Event calendar and bookings'
            ],
            'Food & Beverage': [
                'Product/menu display',
                'Ordering system',
                'Catering inquiry forms'
            ],
            'Sports': [
                'Program and training offerings',
                'Class/session booking',
                'Facility information and hours'
            ],
            'Fashion': [
                'Product catalog with categories',
                'Shopping cart and checkout',
                'Lookbook and style inspiration'
            ],
            'Healthcare': [
                'Service offerings display',
                'Appointment booking system',
                'Patient portal access'
            ],
            'Legal': [
                'Practice areas display',
                'Consultation booking',
                'Resource library and forms'
            ],
            'Beauty': [
                'Service menu with pricing',
                'Appointment booking system',
                'Service portfolio/gallery'
            ],
            'Automotive': [
                'Service offerings display',
                'Appointment booking system',
                'Service area and location info'
            ]
        };

        if (defaultFeatures[industry]) {
            features.push(...defaultFeatures[industry].slice(0, 3 - features.length));
        }
    }

    // Determine brand vibe from tone
    const brandVibe = {
        'Professional': 'Clean, trustworthy, corporate',
        'Friendly': 'Warm, approachable, welcoming',
        'Modern': 'Sleek, contemporary, minimalist',
        'Elegant': 'Sophisticated, refined, premium',
        'Fun': 'Vibrant, playful, energetic',
        'Minimalist': 'Simple, clean, uncluttered',
        'Bold': 'Striking, confident, impactful',
        'Rustic': 'Organic, natural, authentic',
        'Tech-forward': 'Cutting-edge, innovative, digital-first'
    }[tone] || 'Professional and clean';

    // Build pages based on industry
    const pageTemplates = {
        'E-commerce': [
            'Home - Product showcase and featured items',
            'Products - Catalog with filtering and search',
            'Product Detail - Individual product information and purchase',
            'Cart - Shopping cart review',
            'Checkout - Secure payment processing',
            'About - Brand story and mission'
        ],
        'SaaS': [
            'Home - Value proposition and features',
            'Pricing - Subscription plans and tiers',
            'Features - Detailed feature descriptions',
            'Sign Up - User registration',
            'Dashboard - User interface (protected)',
            'Support - Help and documentation'
        ],
        'Restaurant': [
            'Home - Hero section with ambiance and featured dishes',
            'Menu - Full menu with categories',
            'Reservations - Booking system',
            'About - Restaurant story and team',
            'Contact - Location and hours',
            'Order Online - Ordering system'
        ],
        'Travel': [
            'Home - Featured destinations and deals',
            'Destinations - List of available locations',
            'Bookings - Reservation system',
            'About - Company story and values',
            'Contact - Support and information'
        ],
        'Entertainment': [
            'Home - Upcoming events and featured shows',
            'Events - Event listings and calendar',
            'Tickets - Purchase system',
            'Venue - Location and amenities',
            'Contact - Booking and inquiries'
        ],
        'Photography': [
            'Home - Portfolio showcase',
            'Portfolio - Gallery of work by category',
            'Services - Packages and pricing',
            'Booking - Session request form',
            'About - Photographer story and style'
        ],
        'Consulting': [
            'Home - Value proposition and expertise',
            'Services - Detailed service offerings',
            'About - Consultant background and approach',
            'Contact - Consultation booking',
            'Resources - Articles and insights'
        ],
        'Non-profit': [
            'Home - Mission and impact',
            'About - Organization story and values',
            'Donate - Donation processing',
            'Programs - Initiatives and services',
            'Get Involved - Volunteer opportunities'
        ],
        'Fitness': [
            'Home - Facilities and programs overview',
            'Classes - Schedule and descriptions',
            'Membership - Plans and pricing',
            'About - Facility and trainers',
            'Contact - Location and hours'
        ],
        'Wedding': [
            'Home - Services and portfolio',
            'Services - Package offerings',
            'Portfolio - Past wedding galleries',
            'Pricing - Packages and customization',
            'Contact - Consultation booking'
        ],
        'Pet Services': [
            'Home - Services overview',
            'Services - Detailed service offerings',
            'Booking - Appointment system',
            'About - Staff and facility',
            'Contact - Location and hours'
        ],
        'Home Services': [
            'Home - Service offerings',
            'Services - Detailed service listings',
            'Request Quote - Service inquiry form',
            'Service Areas - Coverage map',
            'About - Company and guarantees'
        ],
        'Coaching': [
            'Home - Coaching approach and benefits',
            'Programs - Available coaching programs',
            'About - Coach background and methodology',
            'Testimonials - Client success stories',
            'Contact - Consultation booking'
        ],
        'Real Estate': [
            'Home - Featured properties',
            'Properties - Search and filter listings',
            'Property Detail - Individual property pages',
            'About - Agent/agency information',
            'Contact - Inquiry forms'
        ],
        'Education': [
            'Home - Course offerings overview',
            'Courses - Catalog with enrollment',
            'About - Institution and instructors',
            'Contact - Admissions and support'
        ],
        'Healthcare': [
            'Home - Services and facilities',
            'Services - Medical services offered',
            'Providers - Doctor and staff profiles',
            'Appointments - Booking system',
            'Contact - Location and hours'
        ],
        'Legal': [
            'Home - Practice areas and expertise',
            'Practice Areas - Legal services offered',
            'About - Attorney/team profiles',
            'Contact - Consultation booking',
            'Resources - Legal information and forms'
        ],
        'Beauty': [
            'Home - Services and salon atmosphere',
            'Services - Service menu with pricing',
            'Booking - Appointment system',
            'About - Stylists and salon story',
            'Contact - Location and hours'
        ],
        'Automotive': [
            'Home - Services and facilities',
            'Services - Service offerings and pricing',
            'Booking - Appointment system',
            'About - Shop and mechanics',
            'Contact - Location and hours'
        ],
        'Finance': [
            'Home - Financial services overview',
            'Services - Service offerings',
            'About - Company and advisors',
            'Resources - Financial tools and articles',
            'Contact - Consultation booking'
        ],
        'Marketing': [
            'Home - Agency capabilities and portfolio',
            'Services - Marketing service offerings',
            'Portfolio - Case studies and results',
            'About - Team and approach',
            'Contact - Project inquiry'
        ],
        'Art & Design': [
            'Home - Portfolio showcase',
            'Portfolio - Artwork gallery',
            'About - Artist story and style',
            'Commission - Custom work inquiry',
            'Contact - Purchase and inquiries'
        ],
        'Music': [
            'Home - Music samples and services',
            'Services - Lessons and performance offerings',
            'Portfolio - Audio samples and videos',
            'Booking - Lesson or event booking',
            'About - Musician background'
        ],
        'Food & Beverage': [
            'Home - Products and offerings',
            'Menu - Product catalog',
            'Catering - Catering services and booking',
            'About - Company story and values',
            'Contact - Orders and inquiries'
        ],
        'Sports': [
            'Home - Programs and facilities',
            'Programs - Training and class offerings',
            'Facilities - Location and amenities',
            'Booking - Class registration',
            'About - Coaches and philosophy'
        ],
        'Fashion': [
            'Home - Latest collections',
            'Shop - Product catalog',
            'Lookbook - Style inspiration',
            'About - Brand story',
            'Contact - Customer service'
        ],
        'General Business': [
            'Home - Hero section and key value propositions',
            'Services - Detailed service offerings',
            'About - Company story and team',
            'Contact - Contact form and information',
            'Testimonials - Client reviews and case studies'
        ]
    };

    const pages = pageTemplates[industry] || pageTemplates['General Business'];

    // Core homepage sections
    const homepageSections = [
        'Hero - Compelling headline and primary CTA',
        'Features/Benefits - Key value propositions (3-4 items)',
        'About/Story - Brief introduction to the business',
        'Services/Products - Highlights of main offerings',
        'Testimonials - Social proof from customers',
        'Call-to-Action - Conversion-focused section',
        'Footer - Contact info, social links, navigation'
    ];

    // Content inputs needed
    const contentInputs = [
        'Company/business name and tagline',
        'About section text (2-3 paragraphs)',
        'Service/product descriptions',
        'High-quality images (logo, hero image, product/service photos)',
        'Contact information (address, phone, email)',
        'Social media links',
        'Testimonials or reviews (if available)'
    ];

    // Build the formatted prompt
    const prompt = `# Website Build Prompt

## Goal
${goal}

## Target Audience
${audience}

## Brand Vibe / Visual Style
${brandVibe}

## Key Pages
${pages.map(page => `- ${page}`).join('\n')}

## Core Sections for Homepage
${homepageSections.map(section => `- ${section}`).join('\n')}

## Key Features / Functionality
${features.map(feature => `- ${feature}`).join('\n')}
${features.length < 3 ? '- Contact form for inquiries\n- Responsive mobile design\n- SEO optimization' : ''}

## Content Inputs Needed
${contentInputs.map(input => `- ${input}`).join('\n')}

## SEO Keywords Suggestions
${seoKeywords.map(keyword => `- ${keyword}`).join('\n')}

## Suggested Tech Stack
${techStack.map(tech => `- ${tech}`).join('\n')}
`;

    return {
        prompt,
        industry,
        audience,
        tone
    };
}

/**
 * Main function to improve a prompt
 */
export function improvePrompt(idea) {
    const industry = detectIndustry(idea);
    const audience = detectAudience(idea);
    const tone = detectTone(idea);

    return buildPrompt({ idea, industry, audience, tone });
}


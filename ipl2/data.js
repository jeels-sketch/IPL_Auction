// Team Data with Real Logos and Colors
const teams = [
    { 
        name: 'Chennai Super Kings', 
        key: 'c', 
        logo: 'https://documents.iplt20.com/ipl/CSK/logos/Logooutline/CSKoutline.png',
        color: '#fdb913',
        shortName: 'CSK',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Delhi Capitals', 
        key: 'd', 
        logo: 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png',
        color: '#004c93',
        shortName: 'DC',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Gujarat Titans', 
        key: 'g', 
        logo: 'https://documents.iplt20.com/ipl/GT/Logos/Logooutline/GToutline.png',
        color: '#0d223f',
        shortName: 'GT',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Kolkata Knight Riders', 
        key: 'k', 
        logo: 'https://documents.iplt20.com/ipl/KKR/Logos/Logooutline/KKRoutline.png',
        color: '#3a225d',
        shortName: 'KKR',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Lucknow Super Giants', 
        key: 'l', 
        logo: 'https://documents.iplt20.com/ipl/LSG/Logos/Logooutline/LSGoutline.png',
        color: '#00a6ff',
        shortName: 'LSG',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Mumbai Indians', 
        key: 'm', 
        logo: 'https://documents.iplt20.com/ipl/MI/Logos/Logooutline/MIoutline.png',
        color: '#004ba0',
        shortName: 'MI',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Punjab Kings', 
        key: 'p', 
        logo: 'https://documents.iplt20.com/ipl/PBKS/Logos/Logooutline/PBKSoutline.png',
        color: '#ed1b24',
        shortName: 'PBKS',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Rajasthan Royals', 
        key: 'r', 
        logo: 'https://documents.iplt20.com/ipl/RR/Logos/RR_Logo.png',
        color: '#e73895',
        shortName: 'RR',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Royal Challengers Bangalore', 
        key: 'b', 
        logo: 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png',
        color: '#ec1c24',
        shortName: 'RCB',
        purse: 110, 
        players: [],
        overseasCount: 0
    },
    { 
        name: 'Sunrisers Hyderabad', 
        key: 'h', 
        logo: 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png',
        color: '#ff6f00',
        shortName: 'SRH',
        purse: 110, 
        players: [],
        overseasCount: 0
    }
];

// Helper function to determine overseas status
function isOverseas(playerName) {
    const overseasPlayers = [
        'Trent Boult', 'Jofra Archer', 'Pat Cummins', 'Josh Hazlewood',
        'Mitchell Starc', 'Kagiso Rabada', 'Lockie Ferguson', 'Anrich Nortje',
        'Wanindu Hasaranga', 'Adam Zampa', 'Maheesh Theekshana', 'Noor Ahmad',
        'Matheesha Pathirana'
    ];
    return overseasPlayers.includes(playerName);
}

// Helper function to extract numeric value from price string
function getBasePrice(priceStr) {
    if (!priceStr) return 3; // Default to 3 CR
    const match = priceStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 3;
}

// Player Sets with data from Excel
const playerSets = {
    premiumPacers: {
        name: '⚡ Premium Pacers',
        emoji: '⚡',
        players: [
            { name: 'Jasprit Bumrah', emoji: '🏏', matches: 120, wickets: 183, avg: 22.02, sr: 0, econ: 7.25, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/9.png', role: 'Bowler', overseas: false },
            { name: 'Trent Boult', emoji: '🇳🇿', matches: 88, wickets: 143, avg: 26.2, sr: 0, econ: 8.38, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/66.png', role: 'Bowler', overseas: true },
            { name: 'Mohammed Siraj', emoji: '🏏', matches: 79, wickets: 109, avg: 30.73, sr: 0, econ: 8.74, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/63.png', role: 'Bowler', overseas: false },
            { name: 'Jofra Archer', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', matches: 35, wickets: 59, avg: 27.15, sr: 0, econ: 7.89, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/181.png', role: 'Bowler', overseas: true },
            { name: 'Harshal Patel', emoji: '🏏', matches: 91, wickets: 151, avg: 23.7, sr: 0, econ: 8.85, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/114.png', role: 'Bowler', overseas: false },
            { name: 'Arshdeep Singh', emoji: '🏏', matches: 57, wickets: 97, avg: 26.49, sr: 0, econ: 9.0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/125.png', role: 'Bowler', overseas: false },
            { name: 'Prasidh Krishna', emoji: '🏏', matches: 52, wickets: 74, avg: 29.61, sr: 0, econ: 8.77, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/150.png', role: 'Bowler', overseas: false },
            { name: 'Pat Cummins', emoji: '🇦🇺', matches: 42, wickets: 79, avg: 30.04, sr: 0, econ: 8.81, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/33.png', role: 'Bowler', overseas: true },
            { name: 'Bhuvneshwar Kumar', emoji: '🏏', matches: 160, wickets: 198, avg: 27.33, sr: 0, econ: 7.69, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/15.png', role: 'Bowler', overseas: false },
            { name: 'Mohammed Shami', emoji: '🏏', matches: 110, wickets: 133, avg: 28.19, sr: 0, econ: 8.63, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/47.png', role: 'Bowler', overseas: false },
            { name: 'Josh Hazlewood', emoji: '🇦🇺', matches: 27, wickets: 57, avg: 20.98, sr: 0, econ: 8.28, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/36.png', role: 'Bowler', overseas: true },
            { name: 'Mitchell Starc', emoji: '🇦🇺', matches: 27, wickets: 65, avg: 23.12, sr: 0, econ: 8.61, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/31.png', role: 'Bowler', overseas: true },
            { name: 'Kagiso Rabada', emoji: '🇿🇦', matches: 69, wickets: 119, avg: 22.96, sr: 0, econ: 8.62, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/116.png', role: 'Bowler', overseas: true }
        ],
        currentIndex: 0
    },
    midTierPacers: {
        name: '🎯 Mid-tier Pacers',
        emoji: '🎯',
        players: [
            { name: 'Harshit Rana', emoji: '🏏', matches: 15, wickets: 40, avg: 25.72, sr: 0, econ: 9.51, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/1013.png', role: 'Bowler', overseas: false },
            { name: 'Deepak Chahar', emoji: '🏏', matches: 73, wickets: 88, avg: 29.51, sr: 0, econ: 8.14, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/91.png', role: 'Bowler', overseas: false },
            { name: 'Lockie Ferguson', emoji: '🇳🇿', matches: 30, wickets: 51, avg: 30.0, sr: 0, econ: 8.97, basePrice: 2, photo: 'https://www.gujarattitansipl.com/static-assets/images/players/63719.png?v=5.88', role: 'Bowler', overseas: true },
            { name: 'T Natarajan', emoji: '🏏', matches: 50, wickets: 67, avg: 30.12, sr: 0, econ: 8.94, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/224.png', role: 'Bowler', overseas: false },
            { name: 'Shardul Thakur', emoji: '🏏', matches: 79, wickets: 107, avg: 30.32, sr: 0, econ: 9.4, basePrice: 2, photo: '/static-assets/images/players/large/63345.png?v=7.32&w=200', role: 'Bowler', overseas: false },
            { name: 'Matheesha Pathirana', emoji: '🇱🇰', matches: 12, wickets: 47, avg: 21.61, sr: 0, econ: 8.68, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/1014.png', role: 'Bowler', overseas: true },
            { name: 'Anrich Nortje', emoji: '🇿🇦', matches: 40, wickets: 61, avg: 27.16, sr: 0, econ: 9.07, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/142.png', role: 'Bowler', overseas: true },
            { name: 'Avesh Khan', emoji: '🏏', matches: 61, wickets: 87, avg: 28.28, sr: 0, econ: 9.12, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/109.png', role: 'Bowler', overseas: false },
            { name: 'Yash Dayal', emoji: '🏏', matches: 23, wickets: 41, avg: 33.9, sr: 0, econ: 9.57, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/978.png', role: 'Bowler', overseas: false },
            { name: 'Sandeep Sharma', emoji: '🏏', matches: 110, wickets: 146, avg: 27.88, sr: 0, econ: 8.03, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/220.png', role: 'Bowler', overseas: false },
            { name: 'Khaleel Ahmed', emoji: '🏏', matches: 55, wickets: 89, avg: 26.16, sr: 0, econ: 8.98, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/8.png', role: 'Bowler', overseas: false },
            { name: 'Tushar Deshpande', emoji: '🏏', matches: 30, wickets: 51, avg: 31.03, sr: 0, econ: 9.84, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/539.png', role: 'Bowler', overseas: false },
            { name: 'Vaibhav Arora', emoji: '🏏', matches: 20, wickets: 36, avg: 28.22, sr: 0, econ: 9.55, basePrice: 2, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/583.png', role: 'Bowler', overseas: false }
        ],
        currentIndex: 0
    },
    spinners: {
        name: '🔄 Spinners',
        emoji: '🔄',
        players: [
            { name: 'Yuzvendra Chahal', emoji: '🏏', matches: 145, wickets: 221, avg: 22.76, sr: 0, econ: 7.96, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/10.png', role: 'Bowler', overseas: false },
            { name: 'Rashid Khan', emoji: '🇦🇫', matches: 109, wickets: 158, avg: 23.83, sr: 0, econ: 7.08, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/218.png', role: 'Bowler', overseas: true },
            { name: 'Ravi Bishnoi', emoji: '🏏', matches: 48, wickets: 72, avg: 31.06, sr: 0, econ: 8.21, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/520.png', role: 'Bowler', overseas: false },
            { name: 'Kuldeep Yadav', emoji: '🏏', matches: 70, wickets: 102, avg: 26.95, sr: 0, econ: 8.03, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/14.png', role: 'Bowler', overseas: false },
            { name: 'Wanindu Hasaranga', emoji: '🇱🇰', matches: 24, wickets: 46, avg: 24.32, sr: 0, econ: 8.41, basePrice: 3, photo: 'https://assets.iplt20.com/ipl/IPLHeadshot2022/3082.png', role: 'Bowler', overseas: true },
            { name: 'Rahul Chahar', emoji: '🏏', matches: 53, wickets: 75, avg: 28.66, sr: 0, econ: 7.72, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/171.png', role: 'Bowler', overseas: false },
            { name: 'Ravichandran Ashwin', emoji: '🏏', matches: 197, wickets: 187, avg: 30.22, sr: 0, econ: 7.2, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/45.png', role: 'Bowler', overseas: false },
            { name: 'Digvesh Rathi', emoji: '🏏', matches: 5, wickets: 14, avg: 30.64, sr: 0, econ: 8.25, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/3565.png', role: 'Bowler', overseas: false },
            { name: 'Varun Chakravarthy', emoji: '🏏', matches: 62, wickets: 100, avg: 23.85, sr: 0, econ: 7.57, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/140.png', role: 'Bowler', overseas: false },
            { name: 'Shreyas Gopal', emoji: '🏏', matches: 43, wickets: 52, avg: 25.94, sr: 0, econ: 8.16, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/192.png', role: 'Bowler', overseas: false },
            { name: 'Noor Ahmad', emoji: '🇦🇫', matches: 16, wickets: 48, avg: 17.0, sr: 0, econ: 8.16, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/975.png', role: 'Bowler', overseas: true },
            { name: 'Maheesh Theekshana', emoji: '🇱🇰', matches: 18, wickets: 36, avg: 33.52, sr: 0, econ: 8.26, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/629.png', role: 'Bowler', overseas: true },
            { name: 'Adam Zampa', emoji: '🇦🇺', matches: 14, wickets: 31, avg: 21.03, sr: 0, econ: 8.37, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/24.png', role: 'Bowler', overseas: true }
        ],
        currentIndex: 0
    },
    premiumBatters: {
        name: '⭐ Premium Batters',
        emoji: '⭐',
        players: [
            { name: 'Virat Kohli', emoji: '👑', matches: 237, avg: 37.4, sr: 130, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/2.png', role: 'Batter', overseas: false },
            { name: 'Rohit Sharma', emoji: '⚡', matches: 243, avg: 31.2, sr: 130, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/6.png', role: 'Batter', overseas: false },
            { name: 'KL Rahul', emoji: '🎯', matches: 118, avg: 45.9, sr: 135, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/19.png', role: 'Batter', overseas: false },
            { name: 'Shubman Gill', emoji: '⭐', matches: 91, avg: 33.6, sr: 137, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/62.png', role: 'Batter', overseas: false },
            { name: 'David Warner', emoji: '🔥', matches: 176, avg: 41.6, sr: 139, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/5.png', role: 'Batter', overseas: true },
            { name: 'Jos Buttler', emoji: '💥', matches: 96, avg: 40.4, sr: 149, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2025/182.png', role: 'Batter', overseas: true },
            { name: 'Faf du Plessis', emoji: '🦁', matches: 137, avg: 34.1, sr: 130, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/140.png', role: 'Batter', overseas: true },
            { name: 'Ruturaj Gaikwad', emoji: '🌟', matches: 52, avg: 36.6, sr: 133, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/9420.png', role: 'Batter', overseas: false }
        ],
        currentIndex: 0
    },
    premiumAllRounders: {
        name: '🏆 Premium All-Rounders',
        emoji: '🏆',
        players: [
            { name: 'Ben Stokes', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', matches: 43, avg: 30.3, sr: 135, wickets: 28, econ: 8.5, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2267.png', role: 'All-Rounder', overseas: true },
            { name: 'Andre Russell', emoji: '🇯🇲', matches: 112, avg: 29.9, sr: 179, wickets: 96, econ: 9.2, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/225.png', role: 'All-Rounder', overseas: true },
            { name: 'Hardik Pandya', emoji: '⚡', matches: 123, avg: 28.7, sr: 143, wickets: 53, econ: 8.8, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/630.png', role: 'All-Rounder', overseas: false },
            { name: 'Glenn Maxwell', emoji: '🇦🇺', matches: 124, avg: 22.5, sr: 156, wickets: 31, econ: 8.2, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2285.png', role: 'All-Rounder', overseas: true },
            { name: 'Sam Curran', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', matches: 40, avg: 23.5, sr: 147, wickets: 47, econ: 8.9, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2273.png', role: 'All-Rounder', overseas: true },
            { name: 'Ravindra Jadeja', emoji: '⚔️', matches: 226, avg: 26.6, sr: 127, wickets: 152, econ: 7.6, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/531.png', role: 'All-Rounder', overseas: false },
            { name: 'Marcus Stoinis', emoji: '🇦🇺', matches: 59, avg: 27.8, sr: 135, wickets: 21, econ: 8.9, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2296.png', role: 'All-Rounder', overseas: true },
            { name: 'Mitchell Marsh', emoji: '🇦🇺', matches: 33, avg: 24.8, sr: 135, wickets: 18, econ: 8.4, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2284.png', role: 'All-Rounder', overseas: true }
        ],
        currentIndex: 0
    },
    wicketKeepers: {
        name: '🧤 Wicket Keepers',
        emoji: '🧤',
        players: [
            { name: 'Rishabh Pant', emoji: '🧤', matches: 98, avg: 34.3, sr: 147, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/931.png', role: 'Wicket Keeper', overseas: false },
            { name: 'Quinton de Kock', emoji: '🇿🇦', matches: 96, avg: 32.8, sr: 136, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2277.png', role: 'Wicket Keeper', overseas: true },
            { name: 'Sanju Samson', emoji: '💎', matches: 152, avg: 29.8, sr: 136, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/625.png', role: 'Wicket Keeper', overseas: false },
            { name: 'Ishan Kishan', emoji: '🔥', matches: 91, avg: 30.3, sr: 137, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/10802.png', role: 'Wicket Keeper', overseas: false },
            { name: 'Nicholas Pooran', emoji: '🇱🇨', matches: 62, avg: 28.5, sr: 145, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2279.png', role: 'Wicket Keeper', overseas: true },
            { name: 'Dinesh Karthik', emoji: '🎯', matches: 242, avg: 26.1, sr: 133, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/300.png', role: 'Wicket Keeper', overseas: false },
            { name: 'Jonny Bairstow', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', matches: 39, avg: 28.5, sr: 142, wickets: 0, econ: 0, basePrice: 3, photo: 'https://documents.iplt20.com/ipl/IPLHeadshot2024/2265.png', role: 'Wicket Keeper', overseas: true }
        ],
        currentIndex: 0
    },
    unsoldPlayers: {
        name: '📦 Unsold Players',
        emoji: '📦',
        players: [],
        currentIndex: 0
    }
};

// Auction Rules
const AUCTION_RULES = {
    minPlayers: 11,        // Minimum players a team must buy
    maxOverseas: 4,        // Maximum overseas players per team
    basePrice: 3,          // Base price for all players (default)
    initialPurse: 110,     // Initial purse for each team
    firstPlayerMax: 70,    // Maximum bid for first player (not used now)
    minPerPlayer: 3,       // Minimum price per player (tight scenario)
    lowBidIncrement: 0.25, // Bid increment below 7 CR (25 lakhs)
    highBidIncrement: 0.50 // Bid increment above 7 CR (50 lakhs)
};

// Storage Keys
const STORAGE_KEYS = {
    TEAMS: 'ipl_auction_teams',
    SOLD_PLAYERS: 'ipl_auction_sold_players',
    UNSOLD_PLAYERS: 'ipl_auction_unsold_players',
    SETS_STATE: 'ipl_auction_sets_state',
    CURRENT_SET: 'ipl_auction_current_set',
    CURRENT_PLAYER: 'ipl_auction_current_player',
    CURRENT_BID: 'ipl_auction_current_bid',
    CURRENT_BIDDER: 'ipl_auction_current_bidder',
    PREVIOUS_BIDS: 'ipl_auction_previous_bids',
    UNSOLD_SET: 'ipl_auction_unsold_set'
};

// Export data for use in script.js
window.APP_DATA = {
    teams,
    playerSets,
    AUCTION_RULES,
    STORAGE_KEYS
};
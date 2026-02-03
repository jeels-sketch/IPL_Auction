// Auction State Variables
let currentPlayer = null;
let currentBid = 0;
let basePrice = 0;
let currentBidder = null;
let previousBids = [];
let soldPlayers = new Set();
let unsoldPlayers = new Set();
let currentView = 'sets';
let selectedTeam = null;
let currentSet = null;

// Performance Optimizations
let imageCache = new Map();
let lastKeyPress = 0;
const KEY_DEBOUNCE = 150;
let lastSave = 0;
const SAVE_INTERVAL = 5000;
let isProcessing = false;
let audioContext = null;

// DOM Elements Cache
const DOM = {
    totalPlayers: document.getElementById('totalPlayers'),
    soldCount: document.getElementById('soldCount'),
    unsoldCount: document.getElementById('unsoldCount'),
    remainingCount: document.getElementById('remainingCount'),
    setsGrid: document.getElementById('setsGrid'),
    teamsGridContainer: document.getElementById('teamsGridContainer'),
    teamSquadView: document.getElementById('teamSquadView'),
    playerImage: document.getElementById('playerImage'),
    playerName: document.getElementById('playerName'),
    playerRole: document.getElementById('playerRole'),
    currentBidDisplay: document.getElementById('currentBidDisplay'),
    basePriceDisplay: document.getElementById('basePriceDisplay'),
    bidTeamLogo: document.getElementById('bidTeamLogo'),
    bidTeamName: document.getElementById('bidTeamName'),
    bidInfoSection: document.getElementById('bidInfoSection'),
    playerStatsContainer: document.getElementById('playerStatsContainer'),
    playerStatsGrid: document.getElementById('playerStatsGrid'),
    toast: document.getElementById('toast'),
    modalOverlay: document.getElementById('modalOverlay'),
    setsMenu: document.getElementById('setsMenu'),
    auctionView: document.getElementById('auctionView'),
    teamsView: document.getElementById('teamsView'),
    bidInfoContent: document.querySelector('.bid-info-content')
};

// Calculate bid increment based on current bid
function getBidIncrement(currentBid) {
    return currentBid < 7 ? window.APP_DATA.AUCTION_RULES.lowBidIncrement : 
                           window.APP_DATA.AUCTION_RULES.highBidIncrement;
}

// Calculate maximum bid for a team - CORRECTED FORMULA
function calculateMaxBid(team) {
    const playersBought = team.players.length;
    
    // For first player: Strictly 110 - (10 × 3) = 80 CR
    if (playersBought === 0) {
        const maxBid = 110 - (10 * 3); // 80 CR
        return Math.min(team.purse, maxBid);
    }
    
    // For subsequent players: Remaining players needed AFTER buying this player
    const remainingPlayersNeeded = Math.max(0, window.APP_DATA.AUCTION_RULES.minPlayers - (playersBought + 1));
    
    // Min required for remaining players (after buying current player)
    const minRequiredForRemaining = remainingPlayersNeeded * window.APP_DATA.AUCTION_RULES.minPerPlayer;
    
    // Available for current bid = Purse - min required for remaining players
    const availableForBid = team.purse - minRequiredForRemaining;
    
    // Cannot bid more than purse or less than 0
    return Math.max(0, Math.min(availableForBid, team.purse));
}

// Check if team can bid on overseas player
function canBidOnOverseas(team, player) {
    if (!player.overseas) return true;
    
    if (team.players.length >= window.APP_DATA.AUCTION_RULES.minPlayers) {
        return true;
    }
    
    if (team.overseasCount >= window.APP_DATA.AUCTION_RULES.maxOverseas) {
        return false;
    }
    
    return true;
}

// Initialize Application
function initApp() {
    setupEventListeners();
    loadSavedState();
    initAudio();
    renderSetsMenu();
    renderTeamsGrid();
    updateStats();
    setupUnsoldSet();
    
    setInterval(saveState, 10000);
    console.log('IPL Auction initialized with bowlers data');
}

// Initialize Audio
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        const now = Date.now();
        if (now - lastKeyPress < KEY_DEBOUNCE) return;
        lastKeyPress = now;
        handleKeyPress(e);
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (isProcessing) return;
            const view = item.dataset.view;
            if (view) switchView(view);
        });
    });
    
    document.getElementById('clearBtn').addEventListener('click', showClearConfirmation);
    document.querySelector('.cancel-btn').addEventListener('click', hideModal);
    document.querySelector('.confirm-btn').addEventListener('click', clearAllData);
    
    DOM.setsGrid.addEventListener('click', e => {
        if (isProcessing) return;
        const setOption = e.target.closest('.set-option');
        if (setOption && setOption.dataset.setKey) {
            selectSet(setOption.dataset.setKey);
        }
    });
    
    DOM.teamsGridContainer.addEventListener('click', e => {
        if (isProcessing) return;
        const teamCard = e.target.closest('.team-grid-card');
        if (teamCard && teamCard.dataset.teamName) {
            const team = window.APP_DATA.teams.find(t => t.name === teamCard.dataset.teamName);
            if (team) viewTeamSquad(team);
        }
    });
    
    DOM.modalOverlay.addEventListener('click', e => {
        if (e.target === DOM.modalOverlay) hideModal();
    });
}

// Load Saved State
function loadSavedState() {
    try {
        const savedTeams = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.TEAMS);
        if (savedTeams) {
            const parsedTeams = JSON.parse(savedTeams);
            parsedTeams.forEach((savedTeam, index) => {
                if (window.APP_DATA.teams[index]) {
                    window.APP_DATA.teams[index].purse = savedTeam.purse || window.APP_DATA.AUCTION_RULES.initialPurse;
                    window.APP_DATA.teams[index].players = savedTeam.players || [];
                    window.APP_DATA.teams[index].overseasCount = savedTeam.players ? savedTeam.players.filter(p => p.overseas).length : 0;
                }
            });
        }
        
        const savedSoldPlayers = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.SOLD_PLAYERS);
        if (savedSoldPlayers) {
            soldPlayers = new Set(JSON.parse(savedSoldPlayers));
        }
        
        const savedUnsoldPlayers = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.UNSOLD_PLAYERS);
        if (savedUnsoldPlayers) {
            unsoldPlayers = new Set(JSON.parse(savedUnsoldPlayers));
        }
        
        const savedSetsState = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.SETS_STATE);
        if (savedSetsState) {
            const parsedSetsState = JSON.parse(savedSetsState);
            Object.keys(parsedSetsState).forEach(setKey => {
                if (window.APP_DATA.playerSets[setKey]) {
                    window.APP_DATA.playerSets[setKey].currentIndex = parsedSetsState[setKey].currentIndex;
                }
            });
        }
        
        const savedUnsoldSet = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.UNSOLD_SET);
        if (savedUnsoldSet) {
            window.APP_DATA.playerSets.unsoldPlayers.players = JSON.parse(savedUnsoldSet);
        }
        
        const savedCurrentPlayer = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.CURRENT_PLAYER);
        if (savedCurrentPlayer && savedCurrentPlayer !== 'null') {
            currentPlayer = JSON.parse(savedCurrentPlayer);
            currentBid = parseFloat(localStorage.getItem(window.APP_DATA.STORAGE_KEYS.CURRENT_BID) || '0');
            basePrice = currentPlayer?.basePrice || 0;
            
            const savedCurrentBidder = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.CURRENT_BIDDER);
            if (savedCurrentBidder && savedCurrentBidder !== 'null') {
                const bidderData = JSON.parse(savedCurrentBidder);
                currentBidder = window.APP_DATA.teams.find(t => t.name === bidderData.name);
            }
            
            const savedPreviousBids = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.PREVIOUS_BIDS);
            if (savedPreviousBids) {
                previousBids = JSON.parse(savedPreviousBids);
            }
            
            const savedCurrentSet = localStorage.getItem(window.APP_DATA.STORAGE_KEYS.CURRENT_SET);
            if (savedCurrentSet && savedCurrentSet !== 'null') {
                const setName = JSON.parse(savedCurrentSet);
                Object.keys(window.APP_DATA.playerSets).forEach(setKey => {
                    if (window.APP_DATA.playerSets[setKey].name === setName) {
                        currentSet = window.APP_DATA.playerSets[setKey];
                    }
                });
            }
            
            if (currentPlayer) {
                updatePlayerDisplay();
                updateBidDisplay();
                updateStatsGrid();
                DOM.playerStatsContainer.style.display = 'block';
                showToast('Previous auction state restored!');
            }
        }
    } catch (error) {
        console.warn('Error loading saved state:', error);
    }
}

// Setup unsold set
function setupUnsoldSet() {
    // This will be populated when players go unsold
}

// Save State
function saveState() {
    const now = Date.now();
    if (now - lastSave < SAVE_INTERVAL) return;
    lastSave = now;
    
    requestAnimationFrame(() => {
        try {
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.TEAMS, JSON.stringify(
                window.APP_DATA.teams.map(team => ({
                    name: team.name,
                    purse: team.purse,
                    players: team.players,
                    overseasCount: team.overseasCount
                }))
            ));
            
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.SOLD_PLAYERS, JSON.stringify([...soldPlayers]));
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.UNSOLD_PLAYERS, JSON.stringify([...unsoldPlayers]));
            
            const setsState = {};
            Object.keys(window.APP_DATA.playerSets).forEach(setKey => {
                setsState[setKey] = {
                    currentIndex: window.APP_DATA.playerSets[setKey].currentIndex
                };
            });
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.SETS_STATE, JSON.stringify(setsState));
            
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.UNSOLD_SET, 
                JSON.stringify(window.APP_DATA.playerSets.unsoldPlayers.players));
            
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.CURRENT_SET, 
                currentSet ? JSON.stringify(currentSet.name) : 'null');
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.CURRENT_PLAYER, 
                currentPlayer ? JSON.stringify(currentPlayer) : 'null');
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.CURRENT_BID, currentBid.toString());
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.CURRENT_BIDDER, 
                currentBidder ? JSON.stringify({
                    name: currentBidder.name,
                    logo: currentBidder.logo,
                    shortName: currentBidder.shortName,
                    color: currentBidder.color
                }) : 'null');
            localStorage.setItem(window.APP_DATA.STORAGE_KEYS.PREVIOUS_BIDS, JSON.stringify(previousBids));
        } catch (error) {
            console.warn('Error saving state:', error);
        }
    });
}

// Render Sets Menu
function renderSetsMenu() {
    const fragment = document.createDocumentFragment();
    
    Object.keys(window.APP_DATA.playerSets).forEach(setKey => {
        const set = window.APP_DATA.playerSets[setKey];
        let unsoldCount;
        
        if (setKey === 'unsoldPlayers') {
            unsoldCount = set.players.length;
        } else {
            unsoldCount = set.players.filter(p => 
                !soldPlayers.has(p.name) && !unsoldPlayers.has(p.name)
            ).length;
        }
        
        const setDiv = document.createElement('div');
        setDiv.className = 'set-option';
        setDiv.dataset.setKey = setKey;
        
        setDiv.innerHTML = `
            <div class="set-emoji">${set.emoji}</div>
            <div class="set-name">${set.name}</div>
            <div class="set-player-count">${unsoldCount} Players</div>
        `;
        
        fragment.appendChild(setDiv);
    });
    
    DOM.setsGrid.innerHTML = '';
    DOM.setsGrid.appendChild(fragment);
}

// Select a Set
function selectSet(setKey) {
    if (isProcessing) return;
    isProcessing = true;
    
    currentSet = window.APP_DATA.playerSets[setKey];
    
    if (setKey === 'unsoldPlayers') {
        if (currentSet.players.length === 0) {
            showToast('No unsold players available!');
            isProcessing = false;
            return;
        }
        
        let nextIndex = -1;
        for (let i = currentSet.currentIndex; i < currentSet.players.length; i++) {
            if (!soldPlayers.has(currentSet.players[i].name)) {
                nextIndex = i;
                break;
            }
        }
        
        if (nextIndex === -1) {
            for (let i = 0; i < currentSet.players.length; i++) {
                if (!soldPlayers.has(currentSet.players[i].name)) {
                    nextIndex = i;
                    break;
                }
            }
        }
        
        if (nextIndex === -1) {
            showToast('All unsold players have been sold!');
            isProcessing = false;
            return;
        }
        
        currentSet.currentIndex = nextIndex;
        showPlayerFromSet(nextIndex);
    } else {
        let nextIndex = -1;
        for (let i = currentSet.currentIndex; i < currentSet.players.length; i++) {
            if (!soldPlayers.has(currentSet.players[i].name) && !unsoldPlayers.has(currentSet.players[i].name)) {
                nextIndex = i;
                break;
            }
        }
        
        if (nextIndex === -1) {
            for (let i = 0; i < currentSet.players.length; i++) {
                if (!soldPlayers.has(currentSet.players[i].name) && !unsoldPlayers.has(currentSet.players[i].name)) {
                    nextIndex = i;
                    break;
                }
            }
        }
        
        if (nextIndex === -1) {
            showToast('All players in this set have been auctioned!');
            isProcessing = false;
            return;
        }
        
        currentSet.currentIndex = nextIndex;
        showPlayerFromSet(nextIndex);
    }
    
    document.querySelectorAll('.set-option').forEach(opt => opt.classList.remove('active'));
    event.target.closest('.set-option').classList.add('active');
    
    switchView('auction');
    saveState();
    
    isProcessing = false;
}

// Show Player from Set
function showPlayerFromSet(index) {
    if (!currentSet || index >= currentSet.players.length) {
        showToast('No more players in this set!');
        return;
    }
    
    const playerData = currentSet.players[index];
    
    if (soldPlayers.has(playerData.name)) {
        currentSet.currentIndex = index + 1;
        if (currentSet.currentIndex < currentSet.players.length) {
            showPlayerFromSet(currentSet.currentIndex);
        } else {
            showToast('All players in this set have been auctioned!');
        }
        return;
    }
    
    currentPlayer = { 
        name: playerData.name,
        role: playerData.role,
        basePrice: playerData.basePrice,
        emoji: playerData.emoji,
        photo: playerData.photo,
        overseas: playerData.overseas,
        ...playerData
    };
    
    currentBid = 0;
    basePrice = playerData.basePrice;
    currentBidder = null;
    previousBids = [];
    
    updatePlayerDisplay();
    updateBidDisplay();
    updateStatsGrid();
    
    currentSet.currentIndex = index;
    saveState();
}

// Update Player Display with new layout
function updatePlayerDisplay() {
    if (!currentPlayer) {
        DOM.playerName.textContent = 'Select a Set First';
        DOM.playerRole.style.display = 'none';
        DOM.playerImage.innerHTML = '<div style="font-size: 4em;">🏏</div>';
        return;
    }
    
    // Update player name with overseas indicator
    DOM.playerName.textContent = currentPlayer.name;
    
    // Update player role with specific bowler category
    let roleText = '';
    if (currentPlayer.role === 'Batter') roleText = '🏏 Batter';
    else if (currentPlayer.role === 'Bowler') {
        // Check which bowler set they belong to based on base price
        if (currentPlayer.basePrice === 3) {
            // Check if it's a premium pacer or spinner
            const isSpinner = window.APP_DATA.playerSets.spinners.players.some(p => p.name === currentPlayer.name);
            roleText = isSpinner ? '🔄 Spinner' : '⚡ Premium Pacer';
        } else if (currentPlayer.basePrice === 2) {
            roleText = '🎯 Mid-tier Pacer';
        } else {
            roleText = '🎯 Bowler';
        }
    }
    else if (currentPlayer.role === 'All-Rounder') roleText = '⚔️ All-Rounder';
    else if (currentPlayer.role === 'Wicket Keeper') roleText = '🧤 Wicket Keeper';
    
    // Add overseas indicator to role
    if (currentPlayer.overseas) {
        roleText += ' 🌏';
    }
    
    DOM.playerRole.textContent = roleText;
    DOM.playerRole.style.display = 'inline-block';
    
    // Load player image with fallback
    loadPlayerImage(currentPlayer);
    DOM.playerStatsContainer.style.display = 'block';
}

// Load Player Image with better error handling
function loadPlayerImage(playerData) {
    // Show emoji immediately
    DOM.playerImage.innerHTML = `<div style="font-size: 4em;">${playerData.emoji || '🏏'}</div>`;
    
    if (!playerData.photo) {
        return;
    }
    
    // Check cache first
    if (imageCache.has(playerData.photo)) {
        const img = new Image();
        img.src = playerData.photo;
        img.className = 'player-image';
        img.alt = playerData.name;
        img.loading = 'lazy';
        img.onerror = () => {
            DOM.playerImage.innerHTML = `<div style="font-size: 4em;">${playerData.emoji || '🏏'}</div>`;
        };
        DOM.playerImage.innerHTML = '';
        DOM.playerImage.appendChild(img);
        return;
    }
    
    // Load image with timeout
    setTimeout(() => {
        const img = new Image();
        img.src = playerData.photo;
        img.className = 'player-image';
        img.alt = playerData.name;
        img.loading = 'lazy';
        
        img.onload = () => {
            imageCache.set(playerData.photo, true);
            requestAnimationFrame(() => {
                DOM.playerImage.innerHTML = '';
                DOM.playerImage.appendChild(img.cloneNode());
            });
        };
        
        img.onerror = () => {
            // Try alternative image
            const altImg = new Image();
            altImg.src = `https://cricketersapi.com/images/${playerData.name.toLowerCase().replace(/ /g, '-')}.jpg`;
            altImg.className = 'player-image';
            altImg.alt = playerData.name;
            altImg.loading = 'lazy';
            
            altImg.onerror = () => {
                DOM.playerImage.innerHTML = `<div style="font-size: 4em;">${playerData.emoji || '🏏'}</div>`;
            };
            
            altImg.onload = () => {
                imageCache.set(playerData.photo, true);
                requestAnimationFrame(() => {
                    DOM.playerImage.innerHTML = '';
                    DOM.playerImage.appendChild(altImg);
                });
            };
        };
        
        DOM.playerImage.innerHTML = '';
        DOM.playerImage.appendChild(img);
    }, 50);
}

// Update Stats Grid for bowlers
function updateStatsGrid() {
    if (!currentPlayer) return;
    
    const statsGrid = DOM.playerStatsGrid;
    statsGrid.innerHTML = '';
    
    let stats = [];
    let gridClass = 'stats-grid-3';
    
    if (currentPlayer.role === 'All-Rounder') {
        gridClass = 'stats-grid-5';
        stats = [
            { label: 'Matches', value: currentPlayer.matches },
            { label: 'Average', value: currentPlayer.avg },
            { label: 'Strike Rate', value: currentPlayer.sr },
            { label: 'Wickets', value: currentPlayer.wickets },
            { label: 'Economy', value: currentPlayer.econ }
        ];
    } else if (currentPlayer.role === 'Bowler') {
        // For bowlers: Show wickets, bowling average, economy, matches
        gridClass = 'stats-grid-4';
        stats = [
            { label: 'Matches', value: currentPlayer.matches },
            { label: 'Wickets', value: currentPlayer.wickets },
            { label: 'Bowling Avg', value: currentPlayer.avg },
            { label: 'Economy', value: currentPlayer.econ }
        ];
    } else {
        // For batters/keepers
        stats = [
            { label: 'Matches', value: currentPlayer.matches },
            { label: 'Average', value: currentPlayer.avg },
            { label: 'Strike Rate', value: currentPlayer.sr }
        ];
    }
    
    statsGrid.className = `player-stats-grid ${gridClass}`;
    
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        statCard.innerHTML = `
            <div class="stat-card-label">${stat.label}</div>
            <div class="stat-card-value">${stat.value}</div>
        `;
        statsGrid.appendChild(statCard);
    });
}

// Update Bid Display with centered layout
function updateBidDisplay() {
    requestAnimationFrame(() => {
        if (currentBid === 0) {
            // When no bids: Show only base price centered
            const bidInfoContent = document.querySelector('.bid-info-content');
            if (bidInfoContent) {
                bidInfoContent.innerHTML = `
                    <div class="centered-bid-info">
                        <div class="base-price-centered">Base Price</div>
                        <div class="base-price-value">₹${basePrice} CR</div>
                    </div>
                `;
            }
            
            // Hide team logo
            const teamLogoContainer = document.querySelector('.team-logo-bid-container');
            if (teamLogoContainer) {
                teamLogoContainer.style.display = 'none';
            }
            
            // Reset to default color
            DOM.bidInfoSection.style.borderColor = '#ffcc00';
            DOM.bidInfoSection.style.background = 'linear-gradient(135deg, rgba(10, 1, 24, 0.95) 0%, rgba(26, 11, 46, 0.95) 100%)';
        } else {
            // When bids exist: Show current bid on left, team logo on right
            const bidInfoContent = document.querySelector('.bid-info-content');
            if (bidInfoContent) {
                bidInfoContent.innerHTML = `
                    <div class="bid-price-info">
                        <div class="current-bid-display" style="color: ${currentBid < 7 ? '#10b981' : currentBid < 15 ? '#3b82f6' : '#ef4444'}">₹${currentBid.toFixed(2)} CR</div>
                        <div class="base-price-display">Base Price: ₹${basePrice} CR</div>
                    </div>
                `;
            }
            
            if (currentBidder) {
                // Show team logo on right side
                const teamLogoContainer = document.querySelector('.team-logo-bid-container');
                const teamLogoImg = document.getElementById('bidTeamLogo');
                const teamNameSpan = document.getElementById('bidTeamName');
                
                if (teamLogoContainer && teamLogoImg && teamNameSpan) {
                    teamLogoImg.src = currentBidder.logo;
                    teamLogoImg.alt = currentBidder.name;
                    teamNameSpan.textContent = currentBidder.shortName;
                    teamLogoContainer.style.display = 'flex';
                }
                
                // Set bid bar color to team color
                DOM.bidInfoSection.style.borderColor = currentBidder.color;
                DOM.bidInfoSection.style.background = `linear-gradient(135deg, ${currentBidder.color}20 0%, ${currentBidder.color}40 100%)`;
            } else {
                // Hide team logo
                const teamLogoContainer = document.querySelector('.team-logo-bid-container');
                if (teamLogoContainer) {
                    teamLogoContainer.style.display = 'none';
                }
            }
        }
    });
}

// Handle Keyboard Press
function handleKeyPress(e) {
    if (isProcessing) return;
    
    const key = e.key.toLowerCase();
    
    if (e.ctrlKey && e.shiftKey && key === 'c') {
        e.preventDefault();
        showClearConfirmation();
        return;
    }
    
    const teamMap = {
        'g': 'Gujarat Titans',
        'm': 'Mumbai Indians',
        'c': 'Chennai Super Kings',
        'k': 'Kolkata Knight Riders',
        'd': 'Delhi Capitals',
        'p': 'Punjab Kings',
        'r': 'Rajasthan Royals',
        'h': 'Sunrisers Hyderabad',
        'b': 'Royal Challengers Bangalore',
        'l': 'Lucknow Super Giants'
    };
    
    if (teamMap[key]) {
        const teamName = teamMap[key];
        const team = window.APP_DATA.teams.find(t => t.name === teamName);
        
        if (team && currentPlayer && !soldPlayers.has(currentPlayer.name)) {
            isProcessing = true;
            setTimeout(() => {
                placeBid(team);
                isProcessing = false;
            }, 50);
        }
    }
    
    switch(key) {
        case 'x': // Sold
            isProcessing = true;
            setTimeout(() => {
                soldPlayer();
                isProcessing = false;
            }, 50);
            break;
        case 'z': // Unsold
            isProcessing = true;
            setTimeout(() => {
                unsoldPlayer();
                isProcessing = false;
            }, 50);
            break;
        case 'arrowleft': // Undo last bid
        case 'backspace':
            isProcessing = true;
            setTimeout(() => {
                undoLastBid();
                isProcessing = false;
            }, 50);
            break;
        case 'n': // Next player
            if (currentView === 'auction' && currentPlayer && soldPlayers.has(currentPlayer.name)) {
                isProcessing = true;
                setTimeout(() => {
                    showNextPlayer();
                    isProcessing = false;
                }, 50);
            }
            break;
    }
}

// Place Bid with dynamic increment
function placeBid(team) {
    const maxBid = calculateMaxBid(team);
    const playersBought = team.players.length;
    const remainingAfterThis = Math.max(0, window.APP_DATA.AUCTION_RULES.minPlayers - (playersBought + 1));
    
    let newBid;
    if (currentBid === 0) {
        newBid = basePrice;
    } else {
        const increment = getBidIncrement(currentBid);
        newBid = currentBid + increment;
    }
    
    if (currentPlayer.overseas && !canBidOnOverseas(team, currentPlayer)) {
        showToast(`${team.name} has 4 overseas players and needs ${window.APP_DATA.AUCTION_RULES.minPlayers - team.players.length} more players!`);
        return;
    }
    
    if (newBid > maxBid) {
        if (playersBought === 0) {
            showToast(`${team.name} can only bid max ₹${maxBid.toFixed(2)} CR for first player! (110 - 10×3 = 80 CR)`);
        } else {
            showToast(`${team.name} can only bid max ₹${maxBid.toFixed(2)} CR! (${team.purse.toFixed(2)} - ${remainingAfterThis}×3 = ₹${maxBid.toFixed(2)} CR)`);
        }
        return;
    }
    
    if (team.purse < newBid) {
        showToast(`${team.name} doesn't have enough purse!`);
        return;
    }
    
    previousBids.push({
        bidder: currentBidder,
        amount: currentBid,
        team: currentBidder ? currentBidder.name : null
    });
    
    currentBid = newBid;
    currentBidder = team;
    
    updateBidDisplay();
    saveState();
    playBidSound();
}

// Play bid sound
function playBidSound() {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Play sold sound (different tone)
function playSoldSound() {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1200;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Add a second tone for celebration
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.value = 1400;
            gainNode2.gain.value = 0.1;
            
            oscillator2.start();
            oscillator2.stop(audioContext.currentTime + 0.2);
        }, 100);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Undo Last Bid
function undoLastBid() {
    if (previousBids.length === 0 || currentBid === 0) return;
    
    const lastBid = previousBids.pop();
    currentBid = lastBid.amount;
    currentBidder = lastBid.bidder;
    
    updateBidDisplay();
    saveState();
}

// Show Next Player
function showNextPlayer() {
    if (!currentSet) return;
    
    let nextIndex = -1;
    for (let i = currentSet.currentIndex + 1; i < currentSet.players.length; i++) {
        if (!soldPlayers.has(currentSet.players[i].name)) {
            nextIndex = i;
            break;
        }
    }
    
    if (nextIndex === -1) {
        if (currentSet.key !== 'unsoldPlayers') {
            showToast('All players in this set have been auctioned!');
        } else {
            showToast('All unsold players have been auctioned!');
        }
        switchView('sets');
        renderSetsMenu();
        return;
    }
    
    showPlayerFromSet(nextIndex);
}

// Mark Player as Sold
function soldPlayer() {
    if (!currentPlayer) {
        showToast('Please select a player first!');
        return;
    }

    if (!currentBidder) {
        showToast('No bids placed yet!');
        return;
    }

    if (currentPlayer.overseas && currentBidder.players.length < window.APP_DATA.AUCTION_RULES.minPlayers) {
        if (currentBidder.overseasCount >= window.APP_DATA.AUCTION_RULES.maxOverseas) {
            showToast(`${currentBidder.name} has 4 overseas players!`);
            return;
        }
    }

    currentBidder.purse -= currentBid;
    currentBidder.players.push({
        name: currentPlayer.name,
        role: currentPlayer.role,
        price: currentBid,
        emoji: currentPlayer.emoji,
        photo: currentPlayer.photo,
        overseas: currentPlayer.overseas
    });
    
    if (currentPlayer.overseas) {
        currentBidder.overseasCount++;
    }
    
    soldPlayers.add(currentPlayer.name);
    
    // Remove from unsold set if present
    const unsoldIndex = window.APP_DATA.playerSets.unsoldPlayers.players.findIndex(p => p.name === currentPlayer.name);
    if (unsoldIndex !== -1) {
        window.APP_DATA.playerSets.unsoldPlayers.players.splice(unsoldIndex, 1);
        if (window.APP_DATA.playerSets.unsoldPlayers.currentIndex >= window.APP_DATA.playerSets.unsoldPlayers.players.length) {
            window.APP_DATA.playerSets.unsoldPlayers.currentIndex = Math.max(0, window.APP_DATA.playerSets.unsoldPlayers.players.length - 1);
        }
    }
    
    updateStats();
    renderTeamsGrid();
    saveState();
    playSoldSound();
    
    showToast(`SOLD! ${currentPlayer.name} to ${currentBidder.name} for ₹${currentBid.toFixed(2)} CR!`);
    
    setTimeout(() => {
        showNextPlayer();
    }, 1500);
}

// Mark Player as Unsold
function unsoldPlayer() {
    if (!currentPlayer) {
        showToast('Please select a player first!');
        return;
    }

    unsoldPlayers.add(currentPlayer.name);
    
    // Add to unsold players set
    const unsoldSet = window.APP_DATA.playerSets.unsoldPlayers;
    if (!unsoldSet.players.some(p => p.name === currentPlayer.name)) {
        unsoldSet.players.push({
            name: currentPlayer.name,
            role: currentPlayer.role,
            basePrice: currentPlayer.basePrice,
            photo: currentPlayer.photo,
            overseas: currentPlayer.overseas,
            matches: currentPlayer.matches,
            avg: currentPlayer.avg,
            sr: currentPlayer.sr,
            wickets: currentPlayer.wickets,
            econ: currentPlayer.econ,
            emoji: currentPlayer.emoji
        });
    }
    
    updateStats();
    renderSetsMenu(); // Update unsold count
    saveState();
    
    showToast(`${currentPlayer.name} went UNSOLD!`);
    
    setTimeout(() => {
        showNextPlayer();
    }, 1500);
}

// Update Statistics
function updateStats() {
    requestAnimationFrame(() => {
        let totalPlayers = 0;
        for (let setKey in window.APP_DATA.playerSets) {
            if (setKey !== 'unsoldPlayers') {
                totalPlayers += window.APP_DATA.playerSets[setKey].players.length;
            }
        }
        
        DOM.totalPlayers.textContent = totalPlayers;
        DOM.soldCount.textContent = soldPlayers.size;
        DOM.unsoldCount.textContent = unsoldPlayers.size;
        DOM.remainingCount.textContent = totalPlayers - soldPlayers.size - unsoldPlayers.size;
    });
}

// Render Teams Grid with corrected max bid
function renderTeamsGrid() {
    requestAnimationFrame(() => {
        const fragment = document.createDocumentFragment();
        
        window.APP_DATA.teams.forEach(team => {
            const card = document.createElement('div');
            card.className = 'team-grid-card';
            card.dataset.teamName = team.name;
            
            const remainingPlayers = Math.max(0, window.APP_DATA.AUCTION_RULES.minPlayers - team.players.length);
            const maxBid = calculateMaxBid(team);
            const overseasStatus = team.overseasCount >= window.APP_DATA.AUCTION_RULES.maxOverseas && team.players.length < window.APP_DATA.AUCTION_RULES.minPlayers ? 
                `🌏 4/4 (Need ${remainingPlayers} more)` : `🌏 ${team.overseasCount}/4`;
            
            card.innerHTML = `
                <img class="team-logo-large" src="${team.logo}" alt="${team.name}" loading="lazy">
                <div class="team-grid-name">${team.shortName}</div>
                <div class="team-grid-info">
                    ${overseasStatus}<br>
                    Players: ${team.players.length}/11+<br>
                    Max bid: ₹${maxBid.toFixed(2)} CR
                </div>
                <div class="team-grid-stats">
                    <div class="team-grid-stat">
                        <div class="team-grid-stat-label">Purse</div>
                        <div class="team-grid-stat-value">₹${team.purse.toFixed(2)}</div>
                    </div>
                    <div class="team-grid-stat">
                        <div class="team-grid-stat-label">Remaining</div>
                        <div class="team-grid-stat-value">${remainingPlayers}</div>
                    </div>
                </div>
            `;
            
            fragment.appendChild(card);
        });
        
        DOM.teamsGridContainer.innerHTML = '';
        DOM.teamsGridContainer.appendChild(fragment);
    });
}

// View Team Squad with max bid
function viewTeamSquad(team) {
    selectedTeam = team;
    
    const batters = team.players.filter(p => p.role === 'Batter');
    const bowlers = team.players.filter(p => p.role === 'Bowler');
    const allRounders = team.players.filter(p => p.role === 'All-Rounder');
    const wicketKeepers = team.players.filter(p => p.role === 'Wicket Keeper');
    
    const totalSpent = team.players.reduce((sum, p) => sum + p.price, 0);
    const overseasCount = team.players.filter(p => p.overseas).length;
    const remainingPlayers = Math.max(0, window.APP_DATA.AUCTION_RULES.minPlayers - team.players.length);
    const maxBid = calculateMaxBid(team);
    
    requestAnimationFrame(() => {
        DOM.teamSquadView.innerHTML = `
            <div class="back-button" onclick="backToTeamsGrid()">← Back to Teams</div>
            
            <div class="squad-header">
                <img class="squad-logo" src="${team.logo}" alt="${team.name}" loading="lazy">
                <div class="squad-info">
                    <h2>${team.name}</h2>
                    <div class="squad-stats">
                        <div>Purse Remaining: <span class="squad-stat-highlight">₹${team.purse.toFixed(2)} CR</span></div>
                        <div>Players: <span class="squad-stat-highlight">${team.players.length}/11+</span></div>
                        <div>Overseas: <span class="squad-stat-highlight">${overseasCount}/4</span></div>
                        <div>Total Spent: <span class="squad-stat-highlight">₹${totalSpent.toFixed(2)} CR</span></div>
                        <div>Max Bid for Next: <span class="squad-stat-highlight">₹${maxBid.toFixed(2)} CR</span></div>
                    </div>
                </div>
            </div>

            ${wicketKeepers.length > 0 ? `
                <div class="player-category">
                    <div class="category-title">🧤 Wicket Keepers (${wicketKeepers.length})</div>
                    <div class="squad-players-grid">
                        ${wicketKeepers.map(p => `
                            <div class="squad-player-card">
                                <img src="${p.photo || 'https://cdn.sportsadda.com/static/images/ipl/players/164.png'}" alt="${p.name}" class="squad-player-photo" loading="lazy" onerror="this.src='https://cdn.sportsadda.com/static/images/ipl/players/164.png'">
                                <div class="squad-player-info">
                                    <div class="squad-player-name">${p.name} ${p.overseas ? '🌏' : ''}</div>
                                    <div class="squad-player-role">${p.role}</div>
                                    <div class="squad-player-price">₹${p.price.toFixed(2)} CR</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${batters.length > 0 ? `
                <div class="player-category">
                    <div class="category-title">🏏 Batters (${batters.length})</div>
                    <div class="squad-players-grid">
                        ${batters.map(p => `
                            <div class="squad-player-card">
                                <img src="${p.photo || 'https://cdn.sportsadda.com/static/images/ipl/players/164.png'}" alt="${p.name}" class="squad-player-photo" loading="lazy" onerror="this.src='https://cdn.sportsadda.com/static/images/ipl/players/164.png'">
                                <div class="squad-player-info">
                                    <div class="squad-player-name">${p.name} ${p.overseas ? '🌏' : ''}</div>
                                    <div class="squad-player-role">${p.role}</div>
                                    <div class="squad-player-price">₹${p.price.toFixed(2)} CR</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${allRounders.length > 0 ? `
                <div class="player-category">
                    <div class="category-title">⚔️ All-Rounders (${allRounders.length})</div>
                    <div class="squad-players-grid">
                        ${allRounders.map(p => `
                            <div class="squad-player-card">
                                <img src="${p.photo || 'https://cdn.sportsadda.com/static/images/ipl/players/164.png'}" alt="${p.name}" class="squad-player-photo" loading="lazy" onerror="this.src='https://cdn.sportsadda.com/static/images/ipl/players/164.png'">
                                <div class="squad-player-info">
                                    <div class="squad-player-name">${p.name} ${p.overseas ? '🌏' : ''}</div>
                                    <div class="squad-player-role">${p.role}</div>
                                    <div class="squad-player-price">₹${p.price.toFixed(2)} CR</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${bowlers.length > 0 ? `
                <div class="player-category">
                    <div class="category-title">🎯 Bowlers (${bowlers.length})</div>
                    <div class="squad-players-grid">
                        ${bowlers.map(p => `
                            <div class="squad-player-card">
                                <img src="${p.photo || 'https://cdn.sportsadda.com/static/images/ipl/players/164.png'}" alt="${p.name}" class="squad-player-photo" loading="lazy" onerror="this.src='https://cdn.sportsadda.com/static/images/ipl/players/164.png'">
                                <div class="squad-player-info">
                                    <div class="squad-player-name">${p.name} ${p.overseas ? '🌏' : ''}</div>
                                    <div class="squad-player-role">${p.role}</div>
                                    <div class="squad-player-price">₹${p.price.toFixed(2)} CR</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${team.players.length === 0 ? '<div class="empty-message">No players bought yet in the auction</div>' : ''}
        `;

        switchView('squad');
    });
}

// Back to Teams Grid
function backToTeamsGrid() {
    DOM.teamSquadView.classList.remove('active');
    DOM.teamsView.classList.add('active');
    currentView = 'teams';
}

// Switch Between Views
function switchView(view) {
    requestAnimationFrame(() => {
        document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
        document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');
        
        DOM.setsMenu.classList.remove('active');
        DOM.auctionView.classList.remove('active');
        DOM.teamsView.classList.remove('active');
        DOM.teamSquadView.classList.remove('active');
        
        switch(view) {
            case 'sets':
                DOM.setsMenu.classList.add('active');
                renderSetsMenu();
                break;
            case 'auction':
                DOM.auctionView.classList.add('active');
                break;
            case 'teams':
                DOM.teamsView.classList.add('active');
                break;
            case 'squad':
                DOM.teamSquadView.classList.add('active');
                break;
        }
        
        currentView = view;
    });
}

// Show Clear Confirmation
function showClearConfirmation() {
    DOM.modalOverlay.style.display = 'flex';
}

// Hide Modal
function hideModal() {
    DOM.modalOverlay.style.display = 'none';
}

// Clear All Data
function clearAllData() {
    Object.values(window.APP_DATA.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });
    
    window.APP_DATA.teams.forEach(team => {
        team.purse = window.APP_DATA.AUCTION_RULES.initialPurse;
        team.players = [];
        team.overseasCount = 0;
    });
    
    soldPlayers.clear();
    unsoldPlayers.clear();
    
    Object.keys(window.APP_DATA.playerSets).forEach(setKey => {
        window.APP_DATA.playerSets[setKey].currentIndex = 0;
    });
    
    window.APP_DATA.playerSets.unsoldPlayers.players = [];
    
    currentPlayer = null;
    currentBid = 0;
    currentBidder = null;
    currentSet = null;
    previousBids = [];
    imageCache.clear();
    
    DOM.playerName.textContent = 'Select a Set First';
    DOM.playerRole.style.display = 'none';
    DOM.playerImage.innerHTML = '<div style="font-size: 4em;">🏏</div>';
    DOM.playerStatsContainer.style.display = 'none';
    updateBidDisplay();
    renderSetsMenu();
    renderTeamsGrid();
    updateStats();
    
    hideModal();
    showToast('All data cleared! Auction reset to initial state.');
}

// Show Toast
function showToast(message) {
    DOM.toast.textContent = message;
    DOM.toast.classList.add('show');
    
    setTimeout(() => {
        DOM.toast.classList.remove('show');
    }, 3000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Make functions available globally
window.backToTeamsGrid = backToTeamsGrid;
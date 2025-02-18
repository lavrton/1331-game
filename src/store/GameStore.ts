import { makeAutoObservable } from 'mobx';

export interface Player {
  id: string;
  name: string;
  isActive: boolean;
  isBot: boolean;
  botPersonality?: {
    riskTolerance: number;
    competitiveness: number;
    maxBidMultiplier: number;
    exitThreshold: number;
  };
}

export interface GameConfig {
  initialMoneyPerPlayer: number;
  bankContributionPerPlayer: number;
  costToRaiseLevel: number;
  refundToLowerLevel: number;
  lotteryBaseCost: number;
  lotteryBaseReward: number;
  auctionBaseIncrement: number;
  penaltyIncrement: number;
}

export type TransactionType =
  | 'player_joined'
  | 'bank_contribution'
  | 'level_up'
  | 'level_down'
  | 'lottery_join'
  | 'lottery_win'
  | 'auction_win'
  | 'penalty_payment'
  | 'multiplier_bonus'
  | 'bank_distribution'
  | 'player_exit';

export interface Transaction {
  turn: number;
  type: TransactionType;
  playerId: string;
  amount?: number;
  multiplierChange?: number;
  levelChange?: number;
  timestamp: number;
  details: string;
}

export type TurnPhase = 'start' | 'actions' | 'auction' | 'finished';

export class GameStore {
  players: Player[] = [];
  transactions: Transaction[] = [];
  turnNumber: number = 1;
  turnPhase: TurnPhase = 'start';
  gameStarted: boolean = false;
  currentPlayerIndex: number = 0;
  lotteryParticipants: string[] = [];

  config: GameConfig = {
    initialMoneyPerPlayer: 10000,
    bankContributionPerPlayer: 1000,
    costToRaiseLevel: 500,
    refundToLowerLevel: 250,
    lotteryBaseCost: 100,
    lotteryBaseReward: 0.1,
    auctionBaseIncrement: 0.2,
    penaltyIncrement: 50,
  };

  constructor() {
    makeAutoObservable(this);
    this.loadGame();
  }

  // Computed properties that derive state from transactions
  get bankBalance(): number {
    return this.transactions.reduce((balance, tx) => {
      switch (tx.type) {
        case 'bank_contribution':
        case 'level_up':
        case 'lottery_join':
        case 'auction_win':
        case 'penalty_payment':
          return balance + (tx.amount || 0);
        case 'level_down':
        case 'bank_distribution':
          return balance - (tx.amount || 0);
        default:
          return balance;
      }
    }, 0);
  }

  getPlayerBalance(playerId: string): number {
    return this.transactions.reduce((balance, tx) => {
      if (tx.playerId !== playerId) return balance;

      switch (tx.type) {
        case 'player_joined':
          return (
            this.config.initialMoneyPerPlayer -
            this.config.bankContributionPerPlayer
          );
        case 'level_up':
        case 'lottery_join':
        case 'auction_win':
        case 'penalty_payment':
          return balance - (tx.amount || 0);
        case 'level_down':
        case 'bank_distribution':
          return balance + (tx.amount || 0);
        default:
          return balance;
      }
    }, 0);
  }

  getPlayerMultiplier(playerId: string): number {
    return this.transactions.reduce((multiplier, tx) => {
      if (tx.playerId !== playerId) return multiplier;

      if (tx.multiplierChange) {
        return multiplier + tx.multiplierChange;
      }
      return multiplier;
    }, 1.0); // Start with base multiplier of 1.0
  }

  getPlayerLevel(playerId: string): number {
    return this.transactions.reduce((level, tx) => {
      if (tx.playerId !== playerId) return level;

      if (tx.levelChange) {
        return level + tx.levelChange;
      }
      return level;
    }, 0); // Start with base level of 0
  }

  get activePlayers(): Player[] {
    const exitedPlayerIds = new Set(
      this.transactions
        .filter((tx) => tx.type === 'player_exit')
        .map((tx) => tx.playerId)
    );
    return this.players.filter((p) => !exitedPlayerIds.has(p.id));
  }

  get penaltyAmount(): number {
    return 100 + (this.turnNumber - 1) * this.config.penaltyIncrement;
  }

  get modifier(): number {
    if (this.turnNumber <= 3) return 1;
    if (this.turnNumber <= 6) return 2;
    if (this.turnNumber <= 9) return 3;
    return Math.floor(Math.random() * 4) + 1;
  }

  addTransaction(transaction: Omit<Transaction, 'timestamp'>) {
    this.transactions.push({
      ...transaction,
      timestamp: Date.now(),
    });
    this.saveGame();
  }

  addPlayer(name: string, isBot: boolean) {
    const id = `player-${this.players.length + 1}`;

    // Generate random bot personality if it's a bot
    const botPersonality = isBot
      ? {
          riskTolerance: 0.3 + Math.random() * 0.5,
          competitiveness: 0.4 + Math.random() * 0.4,
          maxBidMultiplier: 0.1 + Math.random() * 0.2,
          exitThreshold: 2.0 + Math.random() * 1.0,
        }
      : undefined;

    this.players.push({
      id,
      name,
      isActive: true,
      isBot,
      botPersonality,
    });

    // Add initial transactions
    this.addTransaction({
      turn: this.turnNumber,
      type: 'player_joined',
      playerId: id,
      details: `${name} joined the game`,
    });

    this.addTransaction({
      turn: this.turnNumber,
      type: 'bank_contribution',
      playerId: id,
      amount: this.config.bankContributionPerPlayer,
      details: `${name} contributed ${this.config.bankContributionPerPlayer} to the bank`,
    });
  }

  removePlayer(playerId: string) {
    // Only allow removing players before the game starts
    if (this.gameStarted) return;

    // Find the player's index
    const playerIndex = this.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return;

    // Remove the player and their transactions
    this.players = this.players.filter((p) => p.id !== playerId);
    this.transactions = this.transactions.filter(
      (t) => t.playerId !== playerId
    );

    // Renumber remaining players to ensure consistent IDs
    this.players = this.players.map((player, index) => ({
      ...player,
      id: `player-${index + 1}`,
    }));

    // Update transactions with new player IDs
    this.transactions = this.transactions.map((tx) => {
      const player = this.players.find(
        (p) => p.name === this.players.find((op) => op.id === tx.playerId)?.name
      );
      return player ? { ...tx, playerId: player.id } : tx;
    });

    this.saveGame();
  }

  startGame() {
    if (this.players.length < 2) {
      throw new Error('At least 2 players are required to start the game');
    }

    // Reset game state
    this.turnNumber = 1;
    this.turnPhase = 'start';
    this.currentPlayerIndex = 0;
    this.lotteryParticipants = [];

    // Add game start transaction
    this.addTransaction({
      turn: this.turnNumber,
      type: 'bank_contribution',
      playerId: this.players[0].id, // Use first player as a reference
      details: 'Game started',
    });

    // Move to first turn
    this.turnPhase = 'actions';
    this.gameStarted = true;
    this.saveGame();
  }

  exitGame(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const balance = this.getPlayerBalance(playerId);
    this.addTransaction({
      turn: this.turnNumber,
      type: 'player_exit',
      playerId,
      amount: balance,
      details: `${player.name} exited with $${balance.toLocaleString()}`,
    });

    // Check if only one player remains
    const remainingPlayers = this.activePlayers.filter(
      (p) => p.id !== playerId
    );
    if (remainingPlayers.length === 1) {
      const lastPlayer = remainingPlayers[0];
      const bankBalance = this.bankBalance;

      // Add final transactions
      this.addTransaction({
        turn: this.turnNumber,
        type: 'bank_distribution',
        playerId: lastPlayer.id,
        amount: bankBalance,
        details: `${
          lastPlayer.name
        } wins and claims the bank's $${bankBalance.toLocaleString()}!`,
      });

      // Immediately finish the game
      this.turnPhase = 'finished';
      this.saveGame();
    }
  }

  // Helper method to check if player can afford an amount
  private canAfford(playerId: string, amount: number): boolean {
    return this.getPlayerBalance(playerId) >= amount;
  }

  // Helper method to handle insufficient funds
  private handleInsufficientFunds(playerId: string, requiredAmount: number) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const balance = this.getPlayerBalance(playerId);
    this.addTransaction({
      turn: this.turnNumber,
      type: 'player_exit',
      playerId,
      amount: balance,
      details: `${
        player.name
      } exited due to insufficient funds (needed $${requiredAmount.toLocaleString()}, had $${balance.toLocaleString()})`,
    });

    // Check if only one player remains
    const remainingPlayers = this.activePlayers.filter(
      (p) => p.id !== playerId
    );
    if (remainingPlayers.length === 1) {
      const lastPlayer = remainingPlayers[0];
      const bankBalance = this.bankBalance;

      // Add final transactions
      this.addTransaction({
        turn: this.turnNumber,
        type: 'bank_distribution',
        playerId: lastPlayer.id,
        amount: bankBalance,
        details: `${
          lastPlayer.name
        } wins and claims the bank's $${bankBalance.toLocaleString()}!`,
      });

      // Immediately finish the game
      this.turnPhase = 'finished';
    }
    this.saveGame();
  }

  adjustPlayerLevel(playerId: string, direction: 'up' | 'down') {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const currentLevel = this.getPlayerLevel(playerId);

    if (direction === 'up') {
      if (!this.canAfford(playerId, this.config.costToRaiseLevel)) {
        return;
      }
      this.addTransaction({
        turn: this.turnNumber,
        type: 'level_up',
        playerId,
        amount: this.config.costToRaiseLevel,
        levelChange: 1,
        multiplierChange: 0.2,
        details: `${player.name} raised their level to ${currentLevel + 1}`,
      });
    } else if (currentLevel > 0) {
      this.addTransaction({
        turn: this.turnNumber,
        type: 'level_down',
        playerId,
        amount: this.config.refundToLowerLevel,
        levelChange: -1,
        multiplierChange: -0.2,
        details: `${player.name} lowered their level to ${currentLevel - 1}`,
      });
    }
  }

  joinLottery(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const cost = this.config.lotteryBaseCost * this.modifier;
    if (!this.canAfford(playerId, cost)) {
      return;
    }

    this.addTransaction({
      turn: this.turnNumber,
      type: 'lottery_join',
      playerId,
      amount: cost,
      details: `${player.name} joined the lottery`,
    });
    this.lotteryParticipants.push(playerId);
  }

  resolveAuction(winnerId: string, amount: number) {
    const winner = this.players.find((p) => p.id === winnerId);
    if (!winner || !this.canAfford(winnerId, amount)) return;

    this.addTransaction({
      turn: this.turnNumber,
      type: 'auction_win',
      playerId: winnerId,
      amount,
      multiplierChange: this.config.auctionBaseIncrement * this.modifier,
      details: `${winner.name} won the auction for $${amount.toLocaleString()}`,
    });
  }

  resolveTurn() {
    // Resolve lottery
    if (this.lotteryParticipants.length > 0) {
      const winnerIndex = Math.floor(
        Math.random() * this.lotteryParticipants.length
      );
      const winnerId = this.lotteryParticipants[winnerIndex];
      const winner = this.players.find((p) => p.id === winnerId);

      if (winner) {
        this.addTransaction({
          turn: this.turnNumber,
          type: 'lottery_win',
          playerId: winnerId,
          multiplierChange: this.config.lotteryBaseReward * this.modifier,
          details: `${winner.name} won the lottery!`,
        });
      }
    }

    // Apply penalties to lowest multipliers
    const activePlayers = this.activePlayers;
    const playerMultipliers = activePlayers.map((p) => ({
      id: p.id,
      multiplier: this.getPlayerMultiplier(p.id),
    }));
    const minMultiplier = Math.min(
      ...playerMultipliers.map((p) => p.multiplier)
    );

    // Handle penalties first
    playerMultipliers
      .filter((p) => p.multiplier === minMultiplier)
      .forEach((p) => {
        const player = this.players.find((pl) => pl.id === p.id);
        if (!player) return;

        if (!this.canAfford(p.id, this.penaltyAmount)) {
          this.handleInsufficientFunds(p.id, this.penaltyAmount);
        } else {
          this.addTransaction({
            turn: this.turnNumber,
            type: 'penalty_payment',
            playerId: p.id,
            amount: this.penaltyAmount,
            details: `${player.name} paid $${this.penaltyAmount} penalty`,
          });
        }
      });

    // Recalculate active players after penalties
    const remainingPlayers = this.activePlayers;
    if (remainingPlayers.length === 0) {
      this.turnPhase = 'finished';
      this.saveGame();
      return;
    }

    // Apply bonuses to highest multipliers
    const maxMultiplier = Math.max(
      ...remainingPlayers.map((p) => this.getPlayerMultiplier(p.id))
    );

    remainingPlayers
      .filter((p) => this.getPlayerMultiplier(p.id) === maxMultiplier)
      .forEach((p) => {
        this.addTransaction({
          turn: this.turnNumber,
          type: 'multiplier_bonus',
          playerId: p.id,
          multiplierChange: 0.1,
          details: `${p.name} received +0.1 multiplier bonus`,
        });
      });

    // Distribute bank funds based on multipliers
    if (remainingPlayers.length > 0) {
      const totalDistribution = this.bankBalance / remainingPlayers.length;
      const totalMultipliers = remainingPlayers.reduce(
        (sum, p) => sum + this.getPlayerMultiplier(p.id),
        0
      );

      remainingPlayers.forEach((p) => {
        const share = Math.floor(
          (this.getPlayerMultiplier(p.id) / totalMultipliers) *
            totalDistribution
        );
        if (share > 0) {
          this.addTransaction({
            turn: this.turnNumber,
            type: 'bank_distribution',
            playerId: p.id,
            amount: share,
            details: `${
              p.name
            } received $${share.toLocaleString()} (×${this.getPlayerMultiplier(
              p.id
            ).toFixed(1)})`,
          });
        }
      });
    }

    // Reset for next turn
    this.lotteryParticipants = [];
    this.turnNumber += 1;
    this.turnPhase = 'start';
    this.saveGame();
  }

  resetGame() {
    localStorage.removeItem('gameState');
    this.players = [];
    this.transactions = [];
    this.turnNumber = 1;
    this.lotteryParticipants = [];
    this.turnPhase = 'start';
    this.gameStarted = false;
    this.currentPlayerIndex = 0;
  }

  private loadGame() {
    try {
      const savedState = localStorage.getItem('gameState');
      if (!savedState) return;

      const state = JSON.parse(savedState);

      // Validate required properties and their types
      const requiredProperties = {
        players: Array.isArray,
        transactions: Array.isArray,
        turnNumber: (n: any) => typeof n === 'number' && n > 0,
        turnPhase: (p: any) =>
          ['start', 'actions', 'auction', 'finished'].includes(p),
        gameStarted: (b: any) => typeof b === 'boolean',
        currentPlayerIndex: (n: any) => typeof n === 'number' && n >= 0,
        lotteryParticipants: Array.isArray,
        config: (c: any) => typeof c === 'object' && c !== null,
      };

      // Check if all required properties exist and have correct types
      const isValid = Object.entries(requiredProperties).every(
        ([key, validator]) => {
          if (!(key in state)) {
            console.warn(`Missing required property: ${key}`);
            return false;
          }
          if (!validator(state[key])) {
            console.warn(`Invalid type for property: ${key}`);
            return false;
          }
          return true;
        }
      );

      // Additional validation for nested structures
      const hasValidPlayers = state.players.every(
        (player: any) =>
          typeof player.id === 'string' &&
          typeof player.name === 'string' &&
          typeof player.isActive === 'boolean' &&
          typeof player.isBot === 'boolean'
      );

      const hasValidConfig =
        state.config &&
        typeof state.config.initialMoneyPerPlayer === 'number' &&
        typeof state.config.bankContributionPerPlayer === 'number' &&
        typeof state.config.costToRaiseLevel === 'number' &&
        typeof state.config.refundToLowerLevel === 'number' &&
        typeof state.config.lotteryBaseCost === 'number' &&
        typeof state.config.lotteryBaseReward === 'number' &&
        typeof state.config.auctionBaseIncrement === 'number' &&
        typeof state.config.penaltyIncrement === 'number';

      if (!isValid || !hasValidPlayers || !hasValidConfig) {
        console.warn('Invalid saved state detected, resetting game');
        this.resetGame();
        localStorage.removeItem('gameState');
        return;
      }

      // If all validations pass, load the state
      Object.assign(this, state);
    } catch (error) {
      console.error('Error loading game state:', error);
      this.resetGame();
      localStorage.removeItem('gameState');
    }
  }

  private saveGame() {
    localStorage.setItem(
      'gameState',
      JSON.stringify({
        players: this.players,
        transactions: this.transactions,
        turnNumber: this.turnNumber,
        turnPhase: this.turnPhase,
        gameStarted: this.gameStarted,
        currentPlayerIndex: this.currentPlayerIndex,
        lotteryParticipants: this.lotteryParticipants,
        config: this.config,
      })
    );
  }

  get currentPlayer(): Player | undefined {
    if (this.turnPhase === 'actions' && this.activePlayers.length > 0) {
      return this.activePlayers[this.currentPlayerIndex];
    }
    return undefined;
  }

  moveToNextPlayer() {
    // If only one player remains at any point, finish the game
    if (this.activePlayers.length <= 1) {
      this.setTurnPhase('start'); // This will trigger the game finish logic
      return;
    }

    if (this.currentPlayerIndex < this.activePlayers.length - 1) {
      this.currentPlayerIndex++;
    } else {
      this.startAuctionPhase();
      this.currentPlayerIndex = 0;
    }
    this.saveGame();
  }

  // Helper method to evaluate bot's position relative to other players
  private evaluateBotPosition(playerId: string): {
    isLeading: boolean;
    relativeProfitability: number;
    riskLevel: number;
  } {
    const player = this.players.find((p) => p.id === playerId);
    if (!player?.botPersonality)
      return { isLeading: false, relativeProfitability: 0, riskLevel: 0 };

    const playerBalance = this.getPlayerBalance(playerId);
    const playerMultiplier = this.getPlayerMultiplier(playerId);

    // Calculate average and max balances among active players
    const activePlayers = this.activePlayers;
    const balances = activePlayers.map((p) => this.getPlayerBalance(p.id));
    const avgBalance =
      balances.reduce((sum, b) => sum + b, 0) / balances.length;
    const maxBalance = Math.max(...balances);

    // Calculate relative position
    const isLeading = playerBalance === maxBalance;
    const relativeProfitability = playerBalance / avgBalance;

    // Calculate risk level based on multiple factors
    const penaltyRisk = this.penaltyAmount / playerBalance;
    const multiplierRisk =
      playerMultiplier ===
      Math.min(...activePlayers.map((p) => this.getPlayerMultiplier(p.id)))
        ? 1
        : 0;
    const turnRisk = Math.min((this.turnNumber - 6) / 10, 1); // Risk increases after turn 6
    const riskLevel = (penaltyRisk + multiplierRisk + turnRisk) / 3;

    return { isLeading, relativeProfitability, riskLevel };
  }

  private shouldBotExit(playerId: string): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player?.botPersonality) return false;

    const position = this.evaluateBotPosition(playerId);
    const personality = player.botPersonality;

    // Exit conditions based on bot's personality and game state
    const conditions: { condition: boolean; weight: number }[] = [
      // Exit if we're leading by a good margin and late in the game
      {
        condition:
          position.isLeading &&
          position.relativeProfitability > 1.3 &&
          this.turnNumber > 8,
        weight: 0.8,
      },
      // Exit if risk level is high and we're above average
      {
        condition:
          position.riskLevel > 0.7 && position.relativeProfitability > 1.1,
        weight: 0.6,
      },
      // Exit if we're below the exit threshold and risk is moderate
      {
        condition:
          position.relativeProfitability < personality.exitThreshold &&
          position.riskLevel > 0.5,
        weight: 0.7,
      },
      // Exit if we can barely afford next penalty
      {
        condition: this.getPlayerBalance(playerId) < this.penaltyAmount * 2,
        weight: 0.9,
      },
      // Exit if we're in a weak position late in the game
      {
        condition: this.turnNumber > 10 && position.relativeProfitability < 0.8,
        weight: 0.5,
      },
    ];

    // Calculate exit probability based on weighted conditions
    const exitProbability =
      conditions.reduce((prob, { condition, weight }) => {
        return prob + (condition ? weight : 0);
      }, 0) / conditions.length;

    // Adjust probability based on personality
    const adjustedProbability =
      exitProbability * (2 - personality.riskTolerance);

    return Math.random() < adjustedProbability;
  }

  handleBotTurn(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player || !player.isBot || !player.botPersonality) return;

    // First, evaluate if the bot should exit
    if (this.shouldBotExit(playerId)) {
      this.exitGame(playerId);
      return;
    }

    const balance = this.getPlayerBalance(playerId);
    const multiplier = this.getPlayerMultiplier(playerId);
    const level = this.getPlayerLevel(playerId);
    const penaltyReserve = this.penaltyAmount * 1.5;
    const availableBalance = balance - penaltyReserve;

    const hasLeveledUp = this.transactions.some(
      (tx) =>
        tx.turn === this.turnNumber &&
        tx.playerId === playerId &&
        (tx.type === 'level_up' || tx.type === 'level_down')
    );
    const hasJoinedLottery = this.transactions.some(
      (tx) =>
        tx.turn === this.turnNumber &&
        tx.playerId === playerId &&
        tx.type === 'lottery_join'
    );

    // Bot decision making based on personality and available funds
    if (!hasLeveledUp && availableBalance > 0) {
      const averageMultiplier = this.getAverageMultiplier();
      const isBelowAverage = multiplier < averageMultiplier - 0.1;
      const levelUpProb = 0.8 * player.botPersonality.competitiveness;

      if (
        availableBalance >= this.config.costToRaiseLevel &&
        isBelowAverage &&
        Math.random() < levelUpProb
      ) {
        this.adjustPlayerLevel(playerId, 'up');
      } else if (balance < penaltyReserve && level > 0 && Math.random() < 0.8) {
        this.adjustPlayerLevel(playerId, 'down');
      }
    }

    // Lottery decision with consideration for available funds
    if (!hasJoinedLottery) {
      const lotteryFee = this.config.lotteryBaseCost * this.modifier;
      if (availableBalance >= lotteryFee) {
        const baseProb = multiplier < this.getAverageMultiplier() ? 0.7 : 0.3;
        const adjustedProb = baseProb * player.botPersonality.riskTolerance;
        if (Math.random() < adjustedProb) {
          this.joinLottery(playerId);
        }
      }
    }
  }

  handleBotAuction(
    playerId: string,
    currentBid: number,
    currentWinner: string | null
  ): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player?.isBot || !player.botPersonality) return false;

    const balance = this.getPlayerBalance(playerId);
    const penaltyReserve = this.penaltyAmount * 1.5;
    const availableBalance = balance - penaltyReserve;
    const newBid = currentBid + 100;

    // Don't bid if we can't afford it or it would leave us with too little reserve
    if (availableBalance < newBid) return false;

    // Don't bid if we're already winning
    if (currentWinner === playerId) return false;

    // Calculate bid probability based on personality and financial situation
    const bidProbability =
      player.botPersonality.competitiveness *
      (currentBid < availableBalance * player.botPersonality.maxBidMultiplier
        ? 0.8
        : 0.2);

    return Math.random() < bidProbability;
  }

  private getAverageMultiplier(): number {
    const activePlayers = this.activePlayers;
    if (activePlayers.length === 0) return 1;
    return (
      activePlayers.reduce(
        (sum, p) => sum + this.getPlayerMultiplier(p.id),
        0
      ) / activePlayers.length
    );
  }

  startAuctionPhase() {
    this.turnPhase = 'auction';
    this.addTransaction({
      turn: this.turnNumber,
      type: 'bank_contribution', // Using bank_contribution as a marker for phase change
      playerId: this.players[0].id,
      details: `Turn ${this.turnNumber} auction phase started`,
    });
    this.saveGame();
  }

  setTurnPhase(phase: TurnPhase) {
    // If we're starting a new turn and only one player remains, finish the game
    if (phase === 'start' && this.activePlayers.length <= 1) {
      const lastPlayer = this.activePlayers[0];
      if (lastPlayer) {
        // Distribute remaining bank balance to the last player
        const bankBalance = this.bankBalance;
        if (bankBalance > 0) {
          this.addTransaction({
            turn: this.turnNumber,
            type: 'bank_distribution',
            playerId: lastPlayer.id,
            amount: bankBalance,
            details: `${
              lastPlayer.name
            } wins and claims the bank's $${bankBalance.toLocaleString()}!`,
          });
        }
        // Set game to finished state
        this.turnPhase = 'finished';
      }
    } else {
      this.turnPhase = phase;
    }
    this.saveGame();
  }
}

export const gameStore = new GameStore();

window.gameStore = gameStore;

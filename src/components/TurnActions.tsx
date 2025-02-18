import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Play,
  ArrowUpCircle,
  ArrowDownCircle,
  Ticket,
  AlertCircle,
  LogOut,
  Loader2,
} from 'lucide-react';
import { gameStore } from '../store/GameStore';
// import GameLog from './GameLog';
import clsx from 'clsx';

const TurnActions: React.FC = observer(() => {
  const [showStartModal, setShowStartModal] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [actions, setActions] = useState<{
    levelChange?: 'up' | 'down';
    joinLottery?: boolean;
    exit?: boolean;
  }>({});

  // Get current player from store
  const currentPlayer = gameStore.currentPlayer;

  // Get player state if we have a current player
  const playerState = currentPlayer
    ? {
        balance: gameStore.getPlayerBalance(currentPlayer.id),
        level: gameStore.getPlayerLevel(currentPlayer.id),
        multiplier: gameStore.getPlayerMultiplier(currentPlayer.id),
        hasLeveledUp: gameStore.transactions.some(
          (tx) =>
            tx.turn === gameStore.turnNumber &&
            tx.playerId === currentPlayer.id &&
            (tx.type === 'level_up' || tx.type === 'level_down')
        ),
        hasJoinedLottery: gameStore.transactions.some(
          (tx) =>
            tx.turn === gameStore.turnNumber &&
            tx.playerId === currentPlayer.id &&
            tx.type === 'lottery_join'
        ),
      }
    : null;

  // If no active players, move to next turn
  useEffect(() => {
    if (gameStore.activePlayers.length === 0) {
      gameStore.resolveTurn();
      return;
    }
  }, [gameStore.activePlayers.length]);

  // Handle bot turns
  useEffect(() => {
    if (currentPlayer?.isBot) {
      handleBotTurn();
    } else {
      setShowStartModal(true); // Only show start modal for human players
    }
  }, [currentPlayer]);

  const handleBotTurn = async () => {
    if (!currentPlayer?.isBot) return;

    setIsBotThinking(true);

    // Random thinking time between 0.5-1 seconds (reduced from 1-2 seconds)
    const thinkingTime = 500 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, thinkingTime));

    gameStore.handleBotTurn(currentPlayer.id);

    // Additional delay before finishing turn (reduced from 500ms to 200ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    setIsBotThinking(false);
    handleFinishTurn();
  };

  const handleLevelChange = (direction: 'up' | 'down') => {
    if (!currentPlayer || !playerState || playerState.hasLeveledUp) return;

    if (
      direction === 'up' &&
      playerState.balance < gameStore.config.costToRaiseLevel
    ) {
      alert('Insufficient funds to raise level!');
      return;
    }

    if (direction === 'down' && playerState.level <= 0) {
      alert('Cannot lower level below 0!');
      return;
    }

    setActions((prev) => ({
      ...prev,
      levelChange: prev.levelChange === direction ? undefined : direction,
    }));
  };

  const handleLotteryToggle = () => {
    if (!currentPlayer || !playerState || playerState.hasJoinedLottery) return;
    const cost = gameStore.config.lotteryBaseCost * gameStore.modifier;

    if (playerState.balance < cost) {
      alert('Insufficient funds to join lottery!');
      return;
    }

    setActions((prev) => ({
      ...prev,
      joinLottery: !prev.joinLottery,
    }));
  };

  const handleExit = () => {
    if (!currentPlayer || !playerState) return;
    setActions((prev) => ({
      ...prev,
      exit: !prev.exit,
    }));
  };

  const handleFinishTurn = () => {
    if (!currentPlayer) return;

    // Apply all actions
    if (actions.exit) {
      if (
        window.confirm(
          'Are you sure you want to exit the game? This action cannot be undone.'
        )
      ) {
        gameStore.exitGame(currentPlayer.id);
      }
    }

    if (actions.levelChange) {
      gameStore.adjustPlayerLevel(currentPlayer.id, actions.levelChange);
    }

    if (actions.joinLottery) {
      gameStore.joinLottery(currentPlayer.id);
    }

    // Clear actions
    setActions({});

    // Move to next player
    gameStore.moveToNextPlayer();
    setShowStartModal(true);
  };

  if (!currentPlayer || !playerState || gameStore.activePlayers.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="text-center text-gray-300">
          No active players remaining
        </div>
      </div>
    );
  }

  if (showStartModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {currentPlayer.name}'s Turn
            {currentPlayer.isBot && (
              <span className="text-purple-400"> (Bot)</span>
            )}
          </h2>
          <p className="text-gray-300 mb-6 text-center">
            {currentPlayer.isBot
              ? 'The bot will automatically take its turn'
              : "Click start when you're ready to take your turn"}
          </p>
          <button
            onClick={() => setShowStartModal(false)}
            className="w-full px-6 py-3 rounded-lg bg-green-500/30 hover:bg-green-500/50 transition-colors flex items-center justify-center gap-2"
          >
            <span>Start Turn</span>
            <Play className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Play className="w-5 h-5" />
            {currentPlayer.name}'s Turn
            {currentPlayer.isBot && (
              <span className="text-purple-400">(Bot)</span>
            )}
          </h2>
        </div>

        {!currentPlayer.isBot && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => handleLevelChange('up')}
              className={clsx(
                'p-4 rounded-lg transition-colors flex flex-col items-center gap-2',
                actions.levelChange === 'up'
                  ? 'bg-blue-500/50 border-2 border-blue-400'
                  : playerState.hasLeveledUp
                  ? 'bg-gray-500/20 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30'
              )}
              disabled={playerState.hasLeveledUp}
            >
              <ArrowUpCircle className="w-5 h-5" />
              <span>Raise Level</span>
              <span className="text-sm text-gray-300">
                -${gameStore.config.costToRaiseLevel}
              </span>
            </button>

            <button
              onClick={() => handleLevelChange('down')}
              className={clsx(
                'p-4 rounded-lg transition-colors flex flex-col items-center gap-2',
                actions.levelChange === 'down'
                  ? 'bg-red-500/50 border-2 border-red-400'
                  : playerState.hasLeveledUp
                  ? 'bg-gray-500/20 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30'
              )}
              disabled={playerState.hasLeveledUp}
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span>Lower Level</span>
              <span className="text-sm text-gray-300">
                +${gameStore.config.refundToLowerLevel}
              </span>
            </button>

            <button
              onClick={handleLotteryToggle}
              className={clsx(
                'p-4 rounded-lg transition-colors flex flex-col items-center gap-2',
                actions.joinLottery
                  ? 'bg-purple-500/50 border-2 border-purple-400'
                  : playerState.hasJoinedLottery
                  ? 'bg-gray-500/20 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30'
              )}
              disabled={playerState.hasJoinedLottery}
            >
              <Ticket className="w-5 h-5" />
              <span>Join Lottery</span>
              <span className="text-sm text-gray-300">
                Cost: $
                {(
                  gameStore.config.lotteryBaseCost * gameStore.modifier
                ).toLocaleString()}
              </span>
            </button>

            <button
              onClick={handleExit}
              className={clsx(
                'p-4 rounded-lg transition-colors flex flex-col items-center gap-2',
                actions.exit
                  ? 'bg-red-500/50 border-2 border-red-400'
                  : 'bg-white/20 hover:bg-white/30'
              )}
            >
              <LogOut className="w-5 h-5" />
              <span>Exit Game</span>
              <span className="text-sm text-gray-300">
                Lock in ${playerState.balance.toLocaleString()}
              </span>
            </button>
          </div>
        )}

        {!currentPlayer.isBot && Object.keys(actions).length > 0 && (
          <div className="bg-white/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Selected Actions</h3>
            <ul className="space-y-2">
              {actions.levelChange && (
                <li className="flex items-center gap-2">
                  {actions.levelChange === 'up' ? (
                    <ArrowUpCircle className="w-4 h-4 text-blue-400" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span>
                    {actions.levelChange === 'up' ? 'Raise' : 'Lower'} Level
                  </span>
                </li>
              )}
              {actions.joinLottery && (
                <li className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Join Lottery</span>
                </li>
              )}
              {actions.exit && (
                <li className="flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Exit Game</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {currentPlayer.isBot && (
          <div className="bg-white/20 rounded-lg p-6 text-center">
            <div className="animate-pulse text-purple-400 mb-4">
              Bot is thinking...
            </div>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleFinishTurn}
            disabled={currentPlayer.isBot && isBotThinking}
            className={clsx(
              'px-6 py-3 rounded-lg transition-colors flex items-center gap-2',
              currentPlayer.isBot && isBotThinking
                ? 'bg-gray-500/20 cursor-not-allowed'
                : 'bg-green-500/30 hover:bg-green-500/50'
            )}
          >
            <span>Finish Turn</span>
            {isBotThinking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* <GameLog currentPlayerId={currentPlayer?.id} /> */}
    </div>
  );
});

export default TurnActions;

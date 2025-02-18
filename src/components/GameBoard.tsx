import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Ban,
  TrendingUp,
  Trophy,
  Users,
  Clock,
  Coins,
  Flag,
  Medal,
  Crown,
} from 'lucide-react';
import { gameStore } from '../store/GameStore';
import PlayerList from './PlayerList';
import GameHeader from './GameHeader';
import TurnActions from './TurnActions';
import TurnStart from './TurnStart';
import AuctionPhase from './AuctionPhase';
import GameLog from './GameLog';
import clsx from 'clsx';

const GameBoard: React.FC = observer(() => {
  const isGameFinished = gameStore.turnPhase === 'finished';

  // Sort players by final balance when game is finished
  const sortedPlayers = isGameFinished
    ? [...gameStore.players].sort((a, b) => {
        const balanceA = gameStore.getPlayerBalance(a.id);
        const balanceB = gameStore.getPlayerBalance(b.id);
        return balanceB - balanceA;
      })
    : [];

  const renderPhase = () => {
    if (isGameFinished) {
      return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Final Rankings
          </h2>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const balance = gameStore.getPlayerBalance(player.id);
              const multiplier = gameStore.getPlayerMultiplier(player.id);
              const level = gameStore.getPlayerLevel(player.id);

              return (
                <div
                  key={player.id}
                  className={clsx(
                    'bg-white/20 rounded-lg p-4 transition-all',
                    index === 0 &&
                      'bg-yellow-500/20 border border-yellow-400/50 scale-105',
                    index === 1 && 'bg-gray-400/20',
                    index === 2 && 'bg-amber-700/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        {index === 0 && (
                          <Crown className="w-6 h-6 text-yellow-400" />
                        )}
                        {index === 1 && (
                          <Medal className="w-6 h-6 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Medal className="w-6 h-6 text-amber-700" />
                        )}
                        {index > 2 && (
                          <span className="text-gray-400">#{index + 1}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          {player.name}
                          {player.isBot && (
                            <span className="text-sm text-purple-400">
                              (Bot)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Multiplier: ×{multiplier.toFixed(1)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Level: {level}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-2xl">
                        ${balance.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-300">Final Balance</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    switch (gameStore.turnPhase) {
      case 'start':
        return <TurnStart />;
      case 'actions':
        return <TurnActions />;
      case 'auction':
        return <AuctionPhase />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <GameHeader />

        {isGameFinished && (
          <div className="bg-yellow-500/20 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-yellow-400/50">
            <div className="flex items-center gap-3 justify-center">
              <Flag className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-center">Game Finished!</h2>
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-center text-gray-300 mt-2">
              Final results after {gameStore.turnNumber - 1} turns
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-300">
                  Total Bank Contributions
                </div>
                <div className="font-mono text-lg">
                  $
                  {(
                    gameStore.config.bankContributionPerPlayer *
                    gameStore.players.length
                  ).toLocaleString()}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-300">Total Turns</div>
                <div className="font-mono text-lg">
                  {gameStore.turnNumber - 1}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-300">Players</div>
                <div className="font-mono text-lg">
                  {gameStore.players.length}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!isGameFinished && (
              <PlayerList currentPlayerId={gameStore.currentPlayer?.id} />
            )}
            {renderPhase()}
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Game Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Bank Balance
                  </span>
                  <span className="font-mono">
                    ${gameStore.bankBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Turn
                  </span>
                  <span className="font-mono">{gameStore.turnNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Modifier
                  </span>
                  <span className="font-mono">×{gameStore.modifier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Penalty
                  </span>
                  <span className="font-mono">
                    ${gameStore.penaltyAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Active Players
                  </span>
                  <span className="font-mono">
                    {gameStore.activePlayers.length}
                  </span>
                </div>
              </div>
            </div>
            <GameLog currentPlayerId={gameStore.currentPlayer?.id} />
          </div>
        </div>

        {isGameFinished && (
          <div className="flex justify-center">
            <button
              onClick={() => gameStore.resetGame()}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>Start New Game</span>
              <Trophy className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default GameBoard;

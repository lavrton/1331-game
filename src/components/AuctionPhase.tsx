import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Gavel, AlertCircle, Timer, Coins } from 'lucide-react';
import { gameStore } from '../store/GameStore';
import clsx from 'clsx';

const AUCTION_DURATION = 10; // seconds for human players
const BOT_AUCTION_DURATION = 1; // seconds for bot-only auctions
const BID_STEP = 100;

const AuctionPhase: React.FC = observer(() => {
  const [timeLeft, setTimeLeft] = useState(AUCTION_DURATION);
  const [currentBid, setCurrentBid] = useState(0);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);
  const [isAuctionActive, setIsAuctionActive] = useState(true);

  // Check if all active players are bots
  const isAllBots = gameStore.activePlayers.every((p) => p.isBot);

  // Set initial duration based on player types
  useEffect(() => {
    setTimeLeft(isAllBots ? BOT_AUCTION_DURATION : AUCTION_DURATION);
  }, [isAllBots]);

  const handleBid = (playerId: string) => {
    const player = gameStore.players.find((p) => p.id === playerId);
    if (!player) return;

    const newBid = currentBid + BID_STEP;
    const playerBalance = gameStore.getPlayerBalance(playerId);

    if (playerBalance < newBid) {
      alert('Insufficient funds!');
      return;
    }

    setCurrentBid(newBid);
    setCurrentWinner(playerId);
    // Only reset timer if there are human players
    if (!isAllBots) {
      setTimeLeft(AUCTION_DURATION);
    }
  };

  const handleBotBids = useCallback(() => {
    const botPlayers = gameStore.activePlayers.filter((p) => p.isBot);

    botPlayers.forEach((bot) => {
      if (gameStore.handleBotAuction(bot.id, currentBid, currentWinner)) {
        handleBid(bot.id);
      }
    });
  }, [currentBid, currentWinner]);

  useEffect(() => {
    if (!isAuctionActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAuctionActive(false);
          return 0;
        }
        return prev - 1;
      });

      // Let bots make their decisions
      handleBotBids();
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuctionActive, handleBotBids]);

  // Auto-continue if auction is finished and all players are bots
  useEffect(() => {
    if (!isAuctionActive && isAllBots) {
      handleFinishAuction();
    }
  }, [isAuctionActive, isAllBots]);

  const handleFinishAuction = () => {
    if (currentWinner && currentBid > 0) {
      gameStore.resolveAuction(currentWinner, currentBid);
    }
    gameStore.resolveTurn();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            Auction Phase
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-300">
              <AlertCircle className="w-5 h-5" />
              <span>
                Reward: +
                {(
                  gameStore.config.auctionBaseIncrement * gameStore.modifier
                ).toFixed(1)}{' '}
                multiplier
              </span>
            </div>
            {isAuctionActive && (
              <div className="flex items-center gap-2 text-blue-300">
                <Timer className="w-5 h-5" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <span className="text-lg">
                  Current Bid: ${currentBid.toLocaleString()}
                </span>
              </div>
              {currentWinner && (
                <div className="text-green-300">
                  Winner:{' '}
                  {gameStore.players.find((p) => p.id === currentWinner)?.name}
                </div>
              )}
            </div>

            {isAuctionActive ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameStore.activePlayers
                  .filter((p) => !p.isBot)
                  .map((player) => {
                    const playerBalance = gameStore.getPlayerBalance(player.id);
                    return (
                      <button
                        key={player.id}
                        onClick={() => handleBid(player.id)}
                        disabled={playerBalance < currentBid + BID_STEP}
                        className={clsx(
                          'p-4 rounded-lg transition-colors',
                          player.id === currentWinner
                            ? 'bg-green-500/50 border-2 border-green-400'
                            : playerBalance < currentBid + BID_STEP
                            ? 'bg-gray-500/20 cursor-not-allowed'
                            : 'bg-white/20 hover:bg-white/30'
                        )}
                      >
                        <div className="font-semibold mb-2">{player.name}</div>
                        <div className="text-sm text-gray-300">
                          Balance: ${playerBalance.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-300 mt-2">
                          Bid: ${(currentBid + BID_STEP).toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-4">
                {currentWinner ? (
                  <div className="text-green-300 text-lg">
                    Auction ended! Winner:{' '}
                    {
                      gameStore.players.find((p) => p.id === currentWinner)
                        ?.name
                    }
                  </div>
                ) : (
                  <div className="text-gray-300 text-lg">
                    Auction ended with no winner
                  </div>
                )}
              </div>
            )}
          </div>

          {!isAuctionActive && !isAllBots && (
            <div className="flex justify-end">
              <button
                onClick={handleFinishAuction}
                className="px-6 py-3 rounded-lg bg-green-500/30 hover:bg-green-500/50 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default AuctionPhase;

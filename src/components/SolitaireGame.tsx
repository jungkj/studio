import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PixelButton } from './PixelButton';
import { cn } from '@/lib/utils';

interface SolitaireGameProps {
  onClose: () => void;
}

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

type GameState = {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
};

interface DragState {
  isDragging: boolean;
  draggedCards: Card[];
  dragSource: string;
  dragSourceIndex?: number;
  dragOffset: { x: number; y: number };
  mousePosition: { x: number; y: number };
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SolitaireGame: React.FC<SolitaireGameProps> = ({ onClose }) => {
  const [gameState, setGameState] = useState<GameState>({
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
  });
  const [gameWon, setGameWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCards: [],
    dragSource: '',
    dragOffset: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
  });
  
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Create a new deck
  const createDeck = useCallback((): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          suit,
          rank,
          faceUp: false,
          id: `${suit}-${rank}`
        });
      }
    }
    return deck;
  }, []);

  // Shuffle deck
  const shuffleDeck = useCallback((deck: Card[]): Card[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Deal new game
  const dealNewGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const newTableau: Card[][] = [[], [], [], [], [], [], []];
    
    let cardIndex = 0;
    
    // Deal to tableau
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck[cardIndex++];
        card.faceUp = row === col; // Only top card face up
        newTableau[col].push(card);
      }
    }
    
    // Remaining cards go to stock
    const stock = deck.slice(cardIndex).map(card => ({ ...card, faceUp: false }));
    
    setGameState({
      stock,
      waste: [],
      foundations: [[], [], [], []],
      tableau: newTableau,
    });
    setGameWon(false);
    setMoves(0);
  }, [createDeck, shuffleDeck]);

  // Initialize game on mount
  useEffect(() => {
    dealNewGame();
  }, [dealNewGame]);

  // Get card rank value (for comparison)
  const getRankValue = useCallback((rank: Rank): number => {
    const values: Record<Rank, number> = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    };
    return values[rank];
  }, []);

  // Check if card is red
  const isRed = useCallback((suit: Suit): boolean => {
    return suit === '♥' || suit === '♦';
  }, []);

  // Check if cards can be placed (tableau rule: opposite color, descending rank)
  const canPlaceOnTableau = useCallback((card: Card, targetCard: Card | null): boolean => {
    if (!targetCard) return card.rank === 'K'; // Only King can go on empty column
    return getRankValue(card.rank) === getRankValue(targetCard.rank) - 1 && 
           isRed(card.suit) !== isRed(targetCard.suit);
  }, [getRankValue, isRed]);

  // Check if card can go to foundation
  const canPlaceOnFoundation = useCallback((card: Card, foundation: Card[]): boolean => {
    if (foundation.length === 0) return card.rank === 'A';
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && getRankValue(card.rank) === getRankValue(topCard.rank) + 1;
  }, [getRankValue]);

  // Draw from stock
  const drawFromStock = useCallback(() => {
    setGameState(prev => {
      if (prev.stock.length === 0) {
        // Reset stock from waste
        const newStock = [...prev.waste].reverse().map(card => ({ ...card, faceUp: false }));
        return { ...prev, stock: newStock, waste: [] };
      } else {
        // Draw card to waste
        const newCard = { ...prev.stock[0], faceUp: true };
        return {
          ...prev,
          stock: prev.stock.slice(1),
          waste: [...prev.waste, newCard]
        };
      }
    });
    setMoves(prev => prev + 1);
  }, []);

  // Move card(s) between piles
  const moveCards = useCallback((fromSource: string, toTarget: string, cardCount: number = 1, fromIndex?: number) => {
    setGameState(prev => {
      const newState = { ...prev };
      let cardsToMove: Card[] = [];

      // Get cards from source
      if (fromSource === 'waste') {
        cardsToMove = newState.waste.splice(-cardCount);
      } else if (fromSource.startsWith('tableau-')) {
        const col = parseInt(fromSource.split('-')[1]);
        const startIdx = fromIndex !== undefined ? fromIndex : newState.tableau[col].length - cardCount;
        cardsToMove = newState.tableau[col].splice(startIdx);
      } else if (fromSource.startsWith('foundation-')) {
        const col = parseInt(fromSource.split('-')[1]);
        cardsToMove = newState.foundations[col].splice(-cardCount);
      }

      // Place cards at target
      if (toTarget.startsWith('foundation-')) {
        const col = parseInt(toTarget.split('-')[1]);
        newState.foundations[col].push(...cardsToMove);
      } else if (toTarget.startsWith('tableau-')) {
        const col = parseInt(toTarget.split('-')[1]);
        newState.tableau[col].push(...cardsToMove);
      }

      // Flip top card in source tableau if needed
      if (fromSource.startsWith('tableau-')) {
        const col = parseInt(fromSource.split('-')[1]);
        const topCard = newState.tableau[col][newState.tableau[col].length - 1];
        if (topCard && !topCard.faceUp) {
          topCard.faceUp = true;
        }
      }

      return newState;
    });
    setMoves(prev => prev + 1);
  }, []);

  // Handle mouse down on card (start drag)
  const handleMouseDown = useCallback((e: React.MouseEvent, card: Card, source: string, sourceIndex?: number) => {
    if (!card.faceUp) return;
    
    e.preventDefault();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = gameContainerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;

    // Try auto-move to foundation first (double-click simulation)
    for (let i = 0; i < 4; i++) {
      if (canPlaceOnFoundation(card, gameState.foundations[i])) {
        if (source === 'waste') {
          moveCards('waste', `foundation-${i}`, 1);
        } else if (source.startsWith('tableau-')) {
          const col = parseInt(source.split('-')[1]);
          if (sourceIndex === gameState.tableau[col].length - 1) {
            moveCards(`tableau-${col}`, `foundation-${i}`, 1);
          }
        }
        return;
      }
    }

    // Get cards to drag
    let cardsToDrag: Card[] = [card];
    if (source.startsWith('tableau-') && sourceIndex !== undefined) {
      const col = parseInt(source.split('-')[1]);
      cardsToDrag = gameState.tableau[col].slice(sourceIndex);
    }

    setDragState({
      isDragging: true,
      draggedCards: cardsToDrag,
      dragSource: source,
      dragSourceIndex: sourceIndex,
      dragOffset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
      mousePosition: {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top,
      },
    });
  }, [canPlaceOnFoundation, gameState.foundations, gameState.tableau, moveCards]);

  // Handle mouse move (drag)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging || !gameContainerRef.current) return;
      
      const containerRect = gameContainerRef.current.getBoundingClientRect();
      setDragState(prev => ({
        ...prev,
        mousePosition: {
          x: e.clientX - containerRect.left,
          y: e.clientY - containerRect.top,
        },
      }));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState.isDragging) return;

      // Find drop target
      const target = e.target as HTMLElement;
      const dropZone = target.closest('[data-drop-zone]');
      
      if (dropZone && dragState.draggedCards.length > 0) {
        const dropTarget = dropZone.getAttribute('data-drop-zone');
        if (dropTarget) {
          const firstCard = dragState.draggedCards[0];
          let canDrop = false;

          if (dropTarget.startsWith('tableau-')) {
            const col = parseInt(dropTarget.split('-')[1]);
            const targetCard = gameState.tableau[col][gameState.tableau[col].length - 1] || null;
            if (canPlaceOnTableau(firstCard, targetCard)) {
              canDrop = true;
            }
          } else if (dropTarget.startsWith('foundation-')) {
            const col = parseInt(dropTarget.split('-')[1]);
            if (dragState.draggedCards.length === 1 && canPlaceOnFoundation(firstCard, gameState.foundations[col])) {
              canDrop = true;
            }
          }

          if (canDrop) {
            moveCards(dragState.dragSource, dropTarget, dragState.draggedCards.length, dragState.dragSourceIndex);
          }
        }
      }

      setDragState({
        isDragging: false,
        draggedCards: [],
        dragSource: '',
        dragOffset: { x: 0, y: 0 },
        mousePosition: { x: 0, y: 0 },
      });
    };

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, gameState.tableau, gameState.foundations, canPlaceOnTableau, canPlaceOnFoundation, moveCards]);

  // Check win condition
  useEffect(() => {
    const totalFoundationCards = gameState.foundations.reduce((sum, foundation) => sum + foundation.length, 0);
    if (totalFoundationCards === 52) {
      setGameWon(true);
    }
  }, [gameState.foundations]);

  // Auto-move to foundation
  const autoMoveToFoundation = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };
      let moved = false;

      // Check waste pile
      if (newState.waste.length > 0) {
        const topCard = newState.waste[newState.waste.length - 1];
        for (let i = 0; i < 4; i++) {
          if (canPlaceOnFoundation(topCard, newState.foundations[i])) {
            newState.waste.pop();
            newState.foundations[i].push(topCard);
            moved = true;
            break;
          }
        }
      }

      // Check tableau piles
      for (let col = 0; col < 7; col++) {
        const pile = newState.tableau[col];
        if (pile.length > 0) {
          const topCard = pile[pile.length - 1];
          if (topCard.faceUp) {
            for (let i = 0; i < 4; i++) {
              if (canPlaceOnFoundation(topCard, newState.foundations[i])) {
                pile.pop();
                newState.foundations[i].push(topCard);
                
                // Flip next card if needed
                const nextCard = pile[pile.length - 1];
                if (nextCard && !nextCard.faceUp) {
                  nextCard.faceUp = true;
                }
                moved = true;
                break;
              }
            }
          }
        }
      }

      if (moved) {
        setMoves(prev => prev + 1);
      }
      return newState;
    });
  }, [canPlaceOnFoundation]);

  return (
    <div ref={gameContainerRef} className="p-4 mac-system-font text-mac-black h-full flex flex-col bg-mac-light-gray relative select-none">
      <div className="flex items-center justify-between mb-4 mac-border-inset bg-mac-white p-2">
        <h2 className="text-lg font-bold">♠♥ SOLITAIRE ♦♣</h2>
        <div className="text-xs text-right">
          <div>Moves: <span className="font-bold">{moves}</span></div>
          <div>Cards: <span className="font-bold">{gameState.foundations.reduce((sum, f) => sum + f.length, 0)}</span>/52</div>
        </div>
      </div>

      {/* Top Row: Stock, Waste, Foundations */}
      <div className="flex justify-between mb-4">
        <div className="flex space-x-3">
          {/* Stock */}
          <div 
            className="w-14 h-20 mac-border-inset bg-mac-medium-gray flex items-center justify-center text-sm cursor-grab hover:bg-mac-light-gray transition-colors"
            onClick={drawFromStock}
          >
            {gameState.stock.length > 0 ? (
              <div className="text-center">
                <div>🂠</div>
                <div className="text-xs">{gameState.stock.length}</div>
              </div>
            ) : (
              <div className="text-center text-mac-dark-gray">
                <div>↻</div>
                <div className="text-xs">Reset</div>
              </div>
            )}
          </div>
          
          {/* Waste */}
          <div 
            className="w-14 h-20 mac-border-inset bg-mac-light-gray relative"
            data-drop-zone="waste"
          >
            {gameState.waste.length > 0 && (
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center text-sm cursor-grab mac-border-outset bg-white transition-transform hover:scale-105",
                  isRed(gameState.waste[gameState.waste.length - 1].suit) ? "text-red-600" : "text-black"
                )}
                onMouseDown={(e) => handleMouseDown(e, gameState.waste[gameState.waste.length - 1], 'waste')}
              >
                <div className="text-center">
                  <div>{gameState.waste[gameState.waste.length - 1].rank}</div>
                  <div>{gameState.waste[gameState.waste.length - 1].suit}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Foundations */}
        <div className="flex space-x-2">
          {gameState.foundations.map((foundation, index) => (
            <div
              key={index}
              className="w-14 h-20 mac-border-inset bg-mac-light-gray flex items-center justify-center text-sm transition-colors hover:bg-mac-white"
              data-drop-zone={`foundation-${index}`}
            >
              {foundation.length > 0 ? (
                <div className={cn("text-center", isRed(foundation[foundation.length - 1].suit) ? "text-red-600" : "text-black")}>
                  <div>{foundation[foundation.length - 1].rank}</div>
                  <div>{foundation[foundation.length - 1].suit}</div>
                </div>
              ) : (
                <span className="text-mac-dark-gray text-xs">A</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tableau */}
      <div className="flex-1 flex space-x-2">
        {gameState.tableau.map((column, colIndex) => (
          <div key={colIndex} className="flex-1 min-h-32">
            <div
              className="w-full h-20 mac-border-inset bg-mac-light-gray mb-2 flex items-center justify-center text-xs transition-colors hover:bg-mac-white"
              data-drop-zone={`tableau-${colIndex}`}
            >
              {column.length === 0 && <span className="text-mac-dark-gray">K</span>}
            </div>
            
            <div className="relative">
              {column.map((card, cardIndex) => {
                const isDraggedCard = dragState.isDragging && 
                  dragState.dragSource === `tableau-${colIndex}` && 
                  cardIndex >= (dragState.dragSourceIndex || 0);
                
                return (
                  <div
                    key={card.id}
                    className={cn(
                      "absolute w-full h-20 flex items-center justify-center text-sm transition-all duration-200",
                      card.faceUp ? "bg-white mac-border-outset cursor-grab hover:z-10 hover:scale-105" : "bg-mac-medium-gray mac-border-inset",
                      isDraggedCard && "opacity-50 pointer-events-none"
                    )}
                    style={{ top: `${cardIndex * 16}px` }}
                    onMouseDown={card.faceUp ? (e) => handleMouseDown(e, card, `tableau-${colIndex}`, cardIndex) : undefined}
                  >
                    {card.faceUp ? (
                      <div className={cn("text-center", isRed(card.suit) ? "text-red-600" : "text-black")}>
                        <div className="font-bold">{card.rank}</div>
                        <div>{card.suit}</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div>🂠</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dragged Cards */}
      {dragState.isDragging && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragState.mousePosition.x - dragState.dragOffset.x,
            top: dragState.mousePosition.y - dragState.dragOffset.y,
          }}
        >
          {dragState.draggedCards.map((card, index) => (
            <div
              key={card.id}
              className={cn(
                "w-14 h-20 bg-white mac-border-outset flex items-center justify-center text-sm shadow-lg",
                isRed(card.suit) ? "text-red-600" : "text-black"
              )}
              style={{ 
                position: 'absolute',
                top: `${index * 16}px`,
                transform: 'rotate(2deg)',
              }}
            >
              <div className="text-center">
                <div className="font-bold">{card.rank}</div>
                <div>{card.suit}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Win Message */}
      {gameWon && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-mac-light-gray mac-border-outset p-6 text-center">
            <div className="text-xl mb-3 font-bold">🏆 CONGRATULATIONS! 🏆</div>
            <div className="text-sm mb-2">You won in <span className="font-bold">{moves}</span> moves!</div>
            <div className="text-xs mb-4 text-mac-dark-gray">Well played!</div>
            <PixelButton onClick={dealNewGame} variant="primary" className="font-bold">
              🎮 New Game
            </PixelButton>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex justify-between mt-4">
        <div className="flex space-x-2">
          <PixelButton onClick={dealNewGame} variant="secondary" className="font-bold">
            🆕 New Deal
          </PixelButton>
          <PixelButton onClick={autoMoveToFoundation} variant="secondary" className="font-bold">
            🎯 Auto Move
          </PixelButton>
        </div>
        <PixelButton onClick={onClose} variant="default" className="font-bold">
          ❌ Close Solitaire
        </PixelButton>
      </div>
    </div>
  );
};

export { SolitaireGame };
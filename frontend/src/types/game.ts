export interface Room {
    id: string;
    players: Player[];
    currentTurn: string;
    board: string[];
    winner: string | null;
  }
  
  export interface Player {
    id: string;
    name: string;
    symbol: 'X' | 'O';
  }
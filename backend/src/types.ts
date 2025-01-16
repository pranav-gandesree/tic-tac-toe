export interface Player {
    id: string;
    name: string;
    symbol: 'X' | 'O';
  }
  
  export interface Room {
    id: string;
    players: Player[];
    board: string[];
    currentTurn: string;
    winner: string | null;
  }
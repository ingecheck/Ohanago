export interface RouletteWinner {
  drawNumber: number;
  ticketNumber: number;
  prizeName: string;
  wonAt: string;
  runnerName?: string;
  runnerDni?: string;
}

export interface RouletteState {
  isActive: boolean;
  totalTickets: number; // 266 tickets
  totalDraws: number; // 22 draws
  currentDrawNumber: number;
  currentPrizeName: string;
  isSpinning: boolean;
  spinStartTime: number;
  spinDuration: number;
  targetTicket: number;
  targetAngle: number;
  winners: RouletteWinner[];
  lastWinner: RouletteWinner | null;
}

import { CardTokenModel } from '../../card/model/card-token.model';

type CardInBoard = typeof CardTokenModel & {
  equipments: CardTokenModel[];
  currentHp: number;
};

export class Board {
  position1?: CardInBoard | null;
  position2?: CardInBoard | null;
  position3?: CardInBoard | null;
}

export const defaultBoard: Board = {
  position1: null,
  position2: null,
  position3: null,
};

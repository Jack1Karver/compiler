import { IIdentifier, NodeInterface } from '../scanner/LexAnalyzer';
import { words } from '../../tables/table-words';
import { limiters } from '../../tables/table-limiters';

export interface MatcherInterface {
  tableId: number;
  elemId?: number;
}

export class ParserClass {
  source: NodeInterface[];
  stack: string[] = [];
  pos: number = 0;
  idTable: IIdentifier[];
  numTable: string[];

  constructor(
    source: NodeInterface[],
    idTable: IIdentifier[],
    numTable: string[]
  ) {
    this.source = source;
    this.idTable = idTable;
    this.numTable = numTable;
  }

  getElement = (tabId: number, elemId: number) => {
    switch (tabId) {
      case 1: {
        return words[elemId].name;
      }
      case 2: {
        return limiters[elemId].name;
      }
      case 1: {
        return this.numTable[elemId];
      }
      case 1: {
        return this.idTable[elemId].value;
      }
    }
  }

  matchNode = (tableId: number, elemId?: number):boolean => {
    if (this.source.length <= this.pos + 1) {
      throw new Error();
    }
    let result: boolean;
    if (elemId) {
      result =
        this.source[this.pos].elemId === elemId &&
        this.source[this.pos].tableId === tableId;
      return result;
    } else {
      result = this.source[this.pos].tableId === tableId;
    }
    if (result) {
      this.pos++;
    }
    return result;
  };

  zeroAndMore = (
    rules: (() => boolean)[],
    branching: boolean = false
  ): boolean => {
    const res = this.parseRules(rules, branching);
    if (res) {
      this.zeroAndMore(rules, branching);
    }

    return true;
  };

  oneAndMore = (
    rules: (() => boolean)[],
    branching: boolean = false
  ): boolean => {
    const res = this.parseRules(rules, branching);
    if (res) {
      this.oneAndMore(rules, branching);
      return true;
    }

    return false;
  };

  zeroOrOne = (
    rules: (() => boolean)[],
    branching: boolean = false
  ): boolean => {
    this.parseRules(rules, branching);
    return true;
  };

  parseRules = (rules: (() => boolean)[], branching: boolean = false):boolean => {
    let startPos = this.pos;
    let res: boolean;
    switch (branching) {
      case true: {
        res = rules.reduce((prev, cur) => {
          if (typeof cur === 'boolean') {
            return prev || cur;
          }
          return prev || cur();
        }, false);
        break;
      }
      case false: {
        res = rules.reduce((prev, cur) => {
          if (typeof cur === 'boolean') {
            return prev && cur;
          }
          return prev && cur();
        }, true);
        break;
      }
    }
    if (!res) {
      this.pos = startPos;
    }
    return res;
  };
}

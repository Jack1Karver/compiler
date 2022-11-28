import { NodeInterface } from '../scanner/LexAnalyzer';
import { Identifier } from 'typescript';

export class ParserClass {
  source: NodeInterface[];
  stack: string[] = [];
  pos: number = 0;
  idTable: Identifier[];
  numTable: string[];

  constructor(source: NodeInterface[], idTable: Identifier[], numTable: string[]) {
    this.source = source;
    this.idTable = idTable;
    this.numTable = numTable;
  }

  matchNode = (tabId: number, elemId?: number) => {
    if (this.source.length <= this.pos + 1) {
      throw new Error();
    }
    let result: boolean;
    if (elemId) {
      result = this.source[this.pos].elemId === elemId && this.source[this.pos].tableId === tabId;
      return result;
    } else {
      result = this.source[this.pos].tableId === tabId;
    }
    if (result) {
      this.pos++;
    }
    return result;
  };

  zeroAndMore = (rules: (() => boolean | boolean)[], condition: NodeInterface, branching: boolean): boolean => {
    if (this.matchNode(condition.tableId, condition.elemId)) {
      const res = this.parseRules(branching, rules);
      if (res) {
        this.zeroAndMore(rules, condition, branching);
      }
    }
    return true;
  };

  oneAndMore = () => {};

  zeroOrOne = () => {};

  parseRules = (branching: boolean, rules: (() => boolean | boolean)[]) => {
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
        }, false);
            break;
      }
      }
      if (!res) {
        this.pos = startPos;
      }
      return res;
  };
}

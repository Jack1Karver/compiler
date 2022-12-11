import { IIdentifier, NodeInterface } from '../scanner/LexAnalyzer';
import { words } from '../../tables/table-words';
import { limiters } from '../../tables/table-limiters';
import { RPN } from './RPN';

export interface MatcherInterface {
  tableId: number;
  elemId?: number;
}

export const types = {
  INT: {
    tableId: 1,
    elemId: 2,
  },
  FLOAT: {
    tableId: 1,
    elemId: 3,
  },
  BOOL: {
    tableId: 1,
    elemId: 4,
  },
};

export class ParserClass {
  source: NodeInterface[];
  pos: number = 0;
  errorPos: number = 0;
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

  getElement = (element:NodeInterface) => {
    switch (element.tableId) {
      case 1: {
        return words[element.elemId].name;
      }
      case 2: {
        return limiters[element.elemId].name;
      }
      case 3: {
        return this.numTable[element.elemId];
      }
      case 4: {
        return this.idTable[element.elemId].value;
      }
    }
  };

  matchNode = (tableId: number, elemId?: number): boolean => {
    if (this.source.length <= this.pos) {
      throw new Error();
    }
    let result: boolean;
    console.log(
      'reqiure ' +
        this.getElement(
          this.source[this.pos]
        ) +
        ' ' +
        this.source[this.pos].tableId +
        ' ' +
        this.source[this.pos].elemId
    );
    if (elemId !== undefined) {
      console.log(
        'wait ' +
        this.getElement({ tableId, elemId }) +
          ' ' +
          tableId +
          ' ' +
          elemId
      );
    } else {
      console.log('wait ' + tableId);
    }
    console.log('pos: ' + this.pos);

    if (elemId !== undefined) {
      result =
        this.source[this.pos].elemId === elemId &&
        this.source[this.pos].tableId === tableId;
    } else {
      result = this.source[this.pos].tableId === tableId;
    }
    if (result) {
      ++this.pos;
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
    branching: boolean = false,
    required: boolean = true
  ): boolean => {
    const res = this.parseRules(rules, branching, required);
    if (res) {
      this.oneAndMore(rules, branching, false);
      return true;
    }

    return false;
  };

  zeroOrOne = (
    rules: (() => boolean)[],
    branching: boolean = false
  ): boolean => {
    this.parseRules(rules, branching, false);
    return true;
  };

  parseRules = (
    rules: (() => boolean)[],
    branching: boolean = false,
    required: boolean = true
  ): boolean => {
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
    if (!res && required) {
      if (this.errorPos < this.pos) {
        this.errorPos = this.pos;
      }
      this.pos = startPos;
    }
    return res;
  };

  checkStatementExp = (expression: () => boolean) => {
    let startPos = this.pos;
    let expRes = this.parseRules([expression]);
    if (expRes) {
      let exp: NodeInterface[] = [];
      for (let i = startPos; i < this.pos; i++) {
        exp.push(this.source[i]);
      }
      let expType = this.checkExp(exp, startPos);
      if (expType.elemId !== types.BOOL.elemId) {
        throw new Error(
          `Type '${this.getElement(
            expType
          )}' is not assignable to type '${this.getElement(types.BOOL)}'`
        );
      }
    }   
    return expRes;
  }

  checkExp = (nodesRPN: NodeInterface[], position: number):NodeInterface => {    
    const stack: NodeInterface[] = [];
    nodesRPN.forEach(node => {
      switch (node.tableId) {
        case 3:
        case 4: {
          stack.push(this.getType(node));
          break;
        }
        case 2:
          if (node.elemId == 15) {
            stack.pop();
            stack.push(types.BOOL)
            break;
          }
          stack.push(this.checkId(
           stack.pop()!.elemId,
            stack.pop()!.elemId,
            node.elemId,
            position
          ));
      }
      position++;
    });

    return stack[0];
  };

  checkId = (
    rightType: number,
    leftType: number,
    op: number,
    position: number
  ):NodeInterface => {
    switch (op) {
      case 20:
      case 23: {
        return types.BOOL;
      }
      default: {
        if (leftType == 4 && rightType == 4 && op <= 5) {
          return types.BOOL;
        }
        return this.checkOperation(leftType, rightType, op, position)!;
      }
    }
  };

  checkOperation = (
    leftType: number,
    rightType: number,
    op: number,
    position: number
  ) => {
    if (leftType == 4) {
      throw new Error(
        `The left-hand side of an arithmetic operation must be of type "int" or "real" on position ${position}`
      );
    }
    if (rightType == 4) {
      throw new Error(
        `The right-hand side of an arithmetic operation must be of type "int" or "real" on position ${position}`
      );
    }
    switch (op) {
      case 18:
      case 19:
      case 21: {
        if (leftType == 3 || rightType == 3) {
          return types.FLOAT;
        } else return types.INT;
      }
      case 22: {
        return types.FLOAT;
      }
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5: {
        return types.BOOL;
      }
    }
  };

  getType = (node: NodeInterface): NodeInterface => {
    console.log(node);
    switch (node.tableId) {
      case 3: {
        if (
          this.getElement(node)?.match(
            /^\d*\.\d*([Ee]?[+-]?\d+)?(?=[^\w])/
          )
        ) {
          return types.FLOAT;
        } else return types.INT;
      }
      case 1: {
        switch (node.elemId) {
          case 0:
          case 1: {
            return types.BOOL;
          }
        }
        break;
      }
      case 4: {
        return this.checkDecl(node);
        
      }
    }
    throw new Error("What's happening here");
  };

  checkDecl = (node: NodeInterface) => {
    let identifier = this.idTable[node.elemId];    
    if (!identifier.type) {
      throw new Error(
        `Undeclared variable ${this.getElement(node)}`
      );
    }
    if (!identifier.assigned) {
      throw new Error(
        `Variable '${this.getElement(node)}' is used before being assigned`
      );
    }
    return identifier.type;
  };
}

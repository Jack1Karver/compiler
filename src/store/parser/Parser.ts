import { IIdentifier, NodeInterface } from '../scanner/LexAnalyzer';
import { ParserClass, types } from './ParserClass';
import { RPN } from './RPN';

class Parser extends ParserClass {
  start = () => {
    const result = this.program();
    if (!result) {
      throw new Error(
        `Error on position ${this.errorPos + 1} at ${this.getElement(
          this.source[this.errorPos]
        )}`
      );
    }
    console.log("You're breathtaking!");
    console.log(this.idTable);
    console.log(this.source);
  };

  program = (): boolean => {
    console.log('program');
    return this.parseRules([
      () => this.matchNode(2, 6),
      () =>
        this.oneAndMore([
          () => this.parseRules([this.description, this.statement], true),
          () => this.matchNode(2, 15),
        ]),
      () => this.matchNode(2, 7),
    ]);
  };

  description = () => {
    console.log('description');
    let startPos: number = this.pos;
    const result = this.oneAndMore([
      () => this.parseRules([() => this.matchNode(4)]),
      () =>
        this.zeroAndMore([() => this.matchNode(2, 8), () => this.matchNode(4)]),
      () =>
        this.parseRules([
          () => this.matchNode(2, 10),
          this.typeVar,
          () => this.matchNode(2, 15),
        ]),
    ]);
    console.log(result);
    if (result && startPos < this.pos) {
      console.log('res');
      this.checkDescription(startPos);
    }
    return result;
  };

  checkDescription = (startPos: number) => {
    console.log('checkDesc');
    let identifiers: NodeInterface[] = [];
    for (startPos; startPos < this.pos; startPos++) {
      let variable = this.source[startPos];
      let id = variable.tableId == 4;
      if (id) {
        identifiers.push(this.source[startPos]);
        continue;
      }
      console.log(identifiers);
      let varType = variable.tableId == 1;
      if (varType) {
        identifiers.forEach(identifier => {
          if (this.idTable[identifier.elemId].type) {
            throw new Error(
              `Re-declaring a variable ${this.getElement(
                identifier
              )} at position ${startPos}`
            );
          }
          this.idTable[identifier.elemId].type = variable;
        });
        break;
      }
    }
  };

  typeVar = () => {
    console.log('typeVar');
    return this.parseRules(
      [
        () => this.matchNode(1, 2),
        () => this.matchNode(1, 3),
        () => this.matchNode(1, 4),
      ],
      true
    );
  };

  statement = () => {
    console.log('statement');
    const rules = [
      this.composite,
      this.assignment,
      this.conditional,
      this.fixedCycle,
      this.conditionalCycle,
      this.input,
      this.output,
    ];
    return this.parseRules(rules, true);
  };

  composite = (): boolean => {
    console.log('composite');
    return this.parseRules([
      () => this.matchNode(1, 5),
      this.statement,
      () => this.zeroAndMore([() => this.matchNode(2, 15), this.statement]),
      () => this.matchNode(1, 6),
    ]);
  };

  assignment = () => {
    console.log('assignment');
    let startPos = this.pos;
    const result = this.parseRules([
      () => this.matchNode(4),
      () => this.matchNode(2, 9),
    ]);
    const expRes = this.parseRules([this.expression]);
    if (result && expRes) {
      let leftNode: IIdentifier;
      const exp: NodeInterface[] = [];
      leftNode = this.idTable[this.source[startPos].elemId];
      for (let i = startPos + 2; i < this.pos; i++) {
        exp.push(this.source[i]);
      }
      let rightType = this.checkExp(exp, startPos + 2);
      console.log(leftNode.type);
      console.log(rightType);
      if (leftNode.type?.elemId != rightType.elemId) {
        throw new Error(
          `Type '${this.getElement(
            rightType
          )}' is not assignable to type '${this.getElement(leftNode.type!)}'`
        );
      }
      this.idTable[this.source[startPos].elemId].assigned=true;
    }

    return result && expRes;
  };

  conditional = (): boolean => {
    console.log('conditional');
    const result = this.parseRules([
      () => this.matchNode(1, 7),
      () => this.matchNode(2, 11),
    ]);
    const expRes = this.checkStatementExp(this.expression);
    return (
      result &&
      expRes &&
      this.parseRules([
        () => this.matchNode(2, 12),
        this.statement,
        () => this.zeroOrOne([() => this.matchNode(1, 8), this.statement]),
      ])
    );
  };

  fixedCycle = (): boolean => {
    console.log('fixedCycle');
    const result = this.parseRules([
      () => this.matchNode(1, 9),
      this.assignment,
      () => this.matchNode(1, 10),
    ]);
    const expRes = this.checkStatementExp(this.expression);
    return (
      result &&
      expRes &&
      this.parseRules([
        () => this.zeroOrOne([() => this.matchNode(1, 11), this.expression]),
        this.statement,
        () => this.matchNode(1, 12),
      ])
    );
  };

  conditionalCycle = (): boolean => {
    console.log('condCycle');
    const result = this.parseRules([
      () => this.matchNode(1, 13),
      () => this.matchNode(2, 11),
    ]);

    const expRes = this.checkStatementExp(this.expression);
    return (
      result &&
      expRes &&
      this.parseRules([() => this.matchNode(2, 12), this.statement])
    );
  };

  input = () => {
    console.log('input');
    return this.parseRules([
      () => this.matchNode(1, 14),
      () => this.matchNode(4),
      () =>
        this.zeroAndMore([() => this.matchNode(2, 8), () => this.matchNode(4)]),
    ]);
  };

  output = () => {
    console.log('output');
    return this.parseRules([
      () => this.matchNode(1, 15),
      this.expression,
      () => this.zeroAndMore([() => this.matchNode(2, 8), this.expression]),
    ]);
  };

  expression = () => {
    console.log('expression');
    let startPos = this.pos;
    const result = this.parseRules([
      this.operand,
      () => this.zeroAndMore([this.GORelationships, this.operand]),
    ]);
    console.log('Exp result' + result);
    if (result) {
      console.log('toRPN');
      let exp: NodeInterface[] = [];
      for (let i = startPos; i < this.pos; i++) {
        exp.push(this.source[i]);
      }
      console.log(exp);
      const RPNClass = new RPN(exp);
      const nodesRPN = RPNClass.start();
      console.log(
        nodesRPN
          .map(elem => {
            return this.getElement(elem);
          })
          .join(' ')
      );
      let sourceBeg = this.source.slice(0, startPos);
      let sourceEnd = this.source.slice(this.pos);
      const newSource = sourceBeg.concat(nodesRPN, sourceEnd);
      console.log('before source ');
      console.log(
        this.source
          .map(elem => {
            return this.getElement(elem);
          })
          .join(' ')
      );
      this.pos -= this.source.length - newSource.length;
      this.source = newSource;
      console.log('after source');
      console.log(
        this.source
          .map(elem => {
            return this.getElement(elem);
          })
          .join(' ')
      );
    }

    return result;
  };

  operand = () => {
    console.log('operand');
    return this.parseRules([
      this.summand,
      () => this.zeroAndMore([this.GOAddition, this.summand]),
    ]);
  };

  summand = () => {
    console.log('summand');
    return this.parseRules([
      this.multiplier,
      () => this.zeroAndMore([this.GOMultiplication, this.multiplier]),
    ]);
  };

  multiplier = () => {
    console.log('multiplier');
    return this.parseRules(
      [
        () => this.matchNode(4),
        () => this.matchNode(3),
        this.logical,
        () => this.parseRules([this.unary, this.multiplier]),
        () =>
          this.parseRules([
            () => this.matchNode(2, 11),
            this.expression,
            () => this.matchNode(2, 12),
          ]),
      ],
      true
    );
  };

  GOAddition = () => {
    console.log('GOAddition');
    let rules: (() => boolean)[] = [];
    for (let i = 18; i < 21; i++) {
      rules.push(() => this.matchNode(2, i));
    }
    return this.parseRules(rules, true);
  };

  GORelationships = () => {
    console.log('goRel');
    let rules: (() => boolean)[] = [];
    for (let i = 0; i < 6; i++) {
      rules.push(() => this.matchNode(2, i));
    }
    return this.parseRules(rules, true);
  };

  GOMultiplication = () => {
    console.log('GOMultiplication');
    let rules: (() => boolean)[] = [];
    for (let i = 21; i < 24; i++) {
      rules.push(() => this.matchNode(2, i));
    }
    return this.parseRules(rules, true);
  };

  unary = () => {
    console.log('unary');
    return this.parseRules([() => this.matchNode(2, 17)]);
  };

  logical = () => {
    console.log('logical');
    return this.parseRules(
      [() => this.matchNode(1, 0), () => this.matchNode(1, 1)],
      true
    );
  };
}

export default Parser;

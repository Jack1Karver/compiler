import { ParserClass } from './ParserClass';

class Parser extends ParserClass {
  start = () => {    
    const result = this.program();
    if (!result) {
      throw new Error(`Error on position ${this.pos}`)
    }
    
  };

  program = (): boolean => {
    return this.parseRules(
      [
        () => this.matchNode(2, 6),
        () =>
          this.oneAndMore(
            [
              () => this.parseRules([this.statement, this.description], true),
              () => this.matchNode(2, 15),
            ],
            false
          ),
        () => this.matchNode(2, 7),
      ],
      false
    );
  };

  description = () => {
    return this.zeroAndMore(
      [
        () => this.parseRules([() => this.matchNode(4)], false),
        () =>
          this.zeroAndMore(
            [() => this.matchNode(2, 15), () => this.matchNode(2, 4)],
            false
          ),
        () =>
          this.parseRules([this.typeVar, () => this.matchNode(2, 15)], false),
      ],
      false
    );
  };

  typeVar = () => {
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
    return this.parseRules([
      () => this.matchNode(1, 5),
      this.statement,
      () => this.zeroAndMore([() => this.matchNode(2, 15), this.statement]),
      () => this.matchNode(1, 6),
    ]);
  };

  assignment = () => {
    return this.parseRules([
      () => this.matchNode(4),
      () => this.matchNode(2, 9),
      this.expression,
    ]);
  };

  conditional = (): boolean => {
    return this.parseRules([
      () => this.matchNode(1, 7),
      () => this.matchNode(2, 11),
      this.expression,
      () => this.matchNode(2, 12),
      this.statement,
      () => this.zeroOrOne([() => this.matchNode(1, 8), this.statement]),
    ]);
  };

  fixedCycle = (): boolean => {
    return this.parseRules([
      () => this.matchNode(1, 9),
      this.assignment,
      () => this.matchNode(1, 10),
      this.expression,
      () => this.zeroOrOne([() => this.matchNode(1, 11), this.expression]),
      this.statement,
      () => this.matchNode(1, 12),
    ]);
  };

  conditionalCycle = (): boolean => {
    return this.parseRules([
      () => this.matchNode(1, 13),
      () => this.matchNode(2, 11),
      this.expression,
      () => this.matchNode(2, 12),
      this.statement,
    ]);
  };

  input = () => {
    return this.parseRules([
      () => this.matchNode(1, 14),
      () => this.matchNode(4),
      () =>
        this.zeroAndMore([() => this.matchNode(2, 8), () => this.matchNode(4)]),
    ]);
  };

  output = () => {
    return this.parseRules([
      () => this.matchNode(1, 15),
      () => this.matchNode(4),
      () =>
        this.zeroAndMore([() => this.matchNode(2, 8), () => this.matchNode(4)]),
    ]);
  };

  expression = () => {
    return this.parseRules([
      this.operand,
      () => this.zeroAndMore([this.GORelationships, this.operand]),
    ]);
  };

  operand = () => {
    return this.parseRules([
      this.summand,
      () => this.zeroAndMore([this.GOAddition, this.summand]),
    ]);
  };

  summand = () => {
    return this.parseRules([
      this.multiplier,
      () => this.zeroAndMore([this.GOMultiplication, this.multiplier]),
    ]);
  };

  multiplier = () => {
    return this.parseRules(
      [
        () => this.matchNode(4),
        () => this.matchNode(3),
        this.logical,
        () => this.parseRules([this.unary, this.multiplier]),
        this.expression,
      ],
      true
    );
  };

  GOAddition = () => {
    let rules: (() => boolean)[] = [];
    for (let i = 18; i < 21; i++) {
      rules.push(() => this.matchNode(2, i));
    }
    return this.parseRules(rules, true);
  };

  GORelationships = () => {
    let rules: (() => boolean)[] = [];
    for (let i = 0; i < 6; i++) {
      rules.push(() => this.matchNode(2, i));
    }
    return this.parseRules(rules, true);
  };

  GOMultiplication = () => {
    let rules: (() => boolean)[] = [];
    for (let i = 21; i < 24; i++) {
      rules.push(() => this.matchNode(2, i));
    }
    return this.parseRules(rules, true);
  };

  unary = () => {
    return this.parseRules([() => this.matchNode(2, 17)]);
  };

  logical = () => {
    return this.parseRules(
      [() => this.matchNode(1, 0), () => this.matchNode(1, 1)],
      true
    );
  };
}

export default Parser;

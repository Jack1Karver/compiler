import { ParserClass } from './ParserClass';

class Parser extends ParserClass {
  start = () => {
    try {
      return this.program();
    } catch {}
  };

  program = () => {
    if (this.matchNode(2, 6)) {
      while (!this.matchNode(2, 7)) {
        if (this.source.length <= this.pos + 1) {
          throw new Error();
        }
        if (this.statement()) {
        } else if (this.description()) {
        } else throw new Error();
        if (!this.matchNode(2, 15)) {
          throw new Error();
        }
      }
    } else {
      throw new Error();
    }
  };

  description = () => {
    if (this.matchNode(4)) {
        this.zeroAndMore([()=>this.matchNode(2, 10), ()=>this.matchNode(4)], { tableId: 2, elemId: 10}, false);
      while (!this.matchNode(2, 10)) {
        if (this.matchNode(2, 8)) {
          if (this.matchNode(4)) {
          } else return false;
        } else return false;
      }
      if (this.matchNode(1, 2) || this.matchNode(1, 3) || this.matchNode(1, 4)) {
        if (this.matchNode(2, 15)) {
        } else return false;
      } else return false;
      this.description();
    }
    return true;
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
    return this.parseRules(true, rules);
  };

  composite = () => {
    return true;
  };

  compositeFunc = () => {
    const rule = [];
    while (!this.matchNode(1, 6)) {}
  };

  assignment = () => {
    return true;
  };

  conditional = () => {
    return true;
  };

  fixedCycle = () => {
    return true;
  };

  conditionalCycle = () => {
    return true;
  };

  input = () => {
    return true;
  };

  output = () => {
    return true;
  };
}

export default Parser;

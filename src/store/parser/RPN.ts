import { NodeInterface } from '../scanner/LexAnalyzer';

export class RPN {
  result: NodeInterface[] = [];
  source: NodeInterface[];
  pos: number = 0;

  constructor(source: NodeInterface[]) {
    this.source = source;
  }

  start = () => {
    this.begin();
    return this.result;
  };

  begin = () => {
    console.log('begin');
    console.log(this.source[this.pos]);
    this.summ();
    let lim: NodeInterface;
    while (this.source[this.pos].tableId == 2 && this.source[this.pos].elemId <= 5) {
      lim = this.source[this.pos];
      this.nextNode();
      this.summ();
      this.result.push(lim);
    }
  };

  summ = () => {
    console.log('sum');
    console.log(this.source[this.pos]);
    let lim: NodeInterface;
    this.mult();
    while (this.source[this.pos].tableId == 2 && this.source[this.pos].elemId >= 18 && this.source[this.pos].elemId <= 20) {
      lim = this.source[this.pos];
      this.nextNode();
      this.mult();
      this.result.push(lim);
    }
  };

  mult = () => {
    console.log('mult');
    console.log(this.source[this.pos]);
    let lim: NodeInterface;
    this.sym();

    while (this.source[this.pos].tableId == 2 && this.source[this.pos].elemId >= 21 && this.source[this.pos].elemId <= 23) {
      lim = this.source[this.pos];
      this.nextNode();
      this.sym();
      this.result.push(lim);
    }
  };

  sym = () => {
    console.log('sym');
    console.log(this.source[this.pos]);
    let lem: NodeInterface | null = null;
      if (this.source[this.pos].tableId == 3 || this.source[this.pos].tableId == 4) {
      this.result.push(this.source[this.pos]);
      this.nextNode();
    }

    if (
      this.source[this.pos].tableId == 1 &&
      this.source[this.pos].elemId <= 1
    ) {
      this.result.push(this.source[this.pos]);
      this.nextNode();
    }
      if (
        this.source[this.pos].tableId == 2 &&
        this.source[this.pos].elemId === 11
      ) {
        this.nextNode();
        this.begin();
        if (this.source[this.pos].tableId == 2) {
          if (this.source[this.pos].elemId == 12) {
            this.nextNode();
          }
        }
      }
    if (this.source[this.pos].elemId == 17) {
      lem = this.source[this.pos];
    }
    if (lem) {
      this.result.push(lem);
      this.nextNode();
    }
  };

  nextNode = () => {
    if (this.pos < this.source.length - 1) {
      this.pos++;
    }
  };
}

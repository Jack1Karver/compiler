import { limiters } from '../../tables/table-limiters';
import { words } from '../../tables/table-words';
import { expressions, numbers } from '../../tables/types';
import Parser from '../parser/Parser';

export interface NodeInterface {
  tableId: number;
  elemId: number;
}

export interface IIdentifier {
  value: string;
  type?: NodeInterface;
  assigned?: boolean;
}

export class LexAnalyzer {
  source: string = '';
  result: NodeInterface[] = [];
  idTable: IIdentifier[] = [];
  numTable: string[] = [];

  setSource = (source: string) => {
    this.source = source;
    this.result = [];
    this.idTable = [];
    this.numTable = [];
    this.startAnalyzing();
  };

  startAnalyzing = () => {
    while (this.source.length > 0) {
      let matcher: string | undefined;
      const wordIndex = words.findIndex((word, index) => {        
        if (word.reg.exec(this.source)?.[0]) {
          this.source = this.source.slice(word.name.length);
          return index;
        }
      });

      if (wordIndex !== -1) {
        this.result.push({ tableId: 1, elemId: wordIndex });
        continue;
      }

      const limitIndex = limiters.findIndex((limiter, index) => {
        if (limiter.reg.exec(this.source)?.[0]) {
          this.source = this.source.slice(limiter.name.length);
          return index;
        }
      });

      if (limitIndex !== -1) {
        this.result.push({ tableId: 2, elemId: limitIndex });
        continue;
      }

      matcher = expressions.word.reg.exec(this.source)?.[0];

      if (matcher) {
        let index = this.idTable.findIndex(id => id.value === matcher);
        if (index !== -1) {
          this.result.push({
            tableId: 4,
            elemId: index,
          });
        } else {
          this.result.push({
            tableId: 4,
            elemId:
              this.idTable.push({
                value: matcher,
                assigned: false
              }) - 1,
          });
        }
        this.source = this.source.slice(matcher.length);

        continue;
      }

      matcher = expressions.number.reg.exec(this.source)?.[0];

      if (matcher) {
        let numeric = this.toBinary(matcher);
        let index = this.numTable.findIndex(num => num === numeric);
        if (index !== -1) {
          this.result.push({
            tableId: 3,
            elemId: index,
          });
        } else {
          this.result.push({
            tableId: 3,
            elemId:
              this.numTable.push(numeric) - 1,
          });
        }
        this.source = this.source.slice(matcher.length);

        continue;
      }

      matcher = expressions.space.reg.exec(this.source)?.[0];

      if (matcher) {
        this.source = this.source.slice(1);
        continue;
      }

      matcher = expressions.comment.reg.exec(this.source)?.[0];

      if (matcher) {
        this.source = this.source.slice(matcher.length);
        continue;
      }

      throw new Error(`Can't find the name ${this.source.split(' ')[0]}`);
    }
    console.log(this.result);
    console.log(this.idTable);
    console.log(this.numTable);
    const parser = new Parser(this.result, this.idTable, this.numTable);
    parser.start();
  };

  toBinary = (num: string):string => {
    let numType: string = '';
    Object.values(numbers).forEach((val, key) => {
      if (val.exec(num)) {
        if (!numType) {
           numType = Object.keys(numbers)[key];
        }               
      }
    })
    console.log(num); 
    console.log(numType);
    switch (numType) {
      case 'real':{
        return parseFloat(num).toString(2);
      }
      case 'bin': {        
        return num.slice(0, -1);
      }
      case 'oct': {
        return parseInt(num.slice(0, -1), 8).toString(2);
      }
      case 'dec': {
        if (num.split('').pop()?.match(/D|d/)) {
          num = num.slice(0, -1);
        }
        return parseInt(num, 10).toString(2)
      }
      case 'hex': {
        return parseInt(num.slice(0, -1), 16).toString(2);
        }
    }
    return '2'
  }
}

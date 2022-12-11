import { limiters } from '../../tables/table-limiters';
import { words } from '../../tables/table-words';
import { expressions } from '../../tables/types';
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
  stack: string[] = [];
  result: NodeInterface[] = [];
  idTable: IIdentifier[] = [];
  numTable: string[] = [];

  setSource = (source: string) => {
    this.source = source;
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
                value: this.source.slice(0, matcher.length),
                assigned: false
              }) - 1,
          });
        }
        this.source = this.source.slice(matcher.length);

        continue;
      }

      matcher = expressions.number.reg.exec(this.source)?.[0];

      if (matcher) {
        let index = this.numTable.findIndex(num => num === matcher);
        if (index !== -1) {
          this.result.push({
            tableId: 3,
            elemId: index,
          });
        } else {
          this.result.push({
            tableId: 3,
            elemId:
              this.numTable.push(this.source.slice(0, matcher.length)) - 1,
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

      throw new Error();
    }
    console.log(this.result);
    console.log(this.idTable);
    console.log(this.numTable);
    const parser = new Parser(this.result, this.idTable, this.numTable);
    parser.start();
  };
}

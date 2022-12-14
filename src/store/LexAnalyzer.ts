import { limiters } from '../tables/table-limiters';
import { words } from '../tables/table-words';
import { identifiers } from '../tables/types';

export class LexAnalyzer {
  source: string = '';
  stack: string[] = [];
  result: { tableId: number; elemId: number }[] = [];
  idTable: string[] = [];
  numTable: string[] = [];

  setSource = (source: string) => {
    this.source = source;
    this.startAnalyzing();
    console.log(this.source.split(''));
  };

  startAnalyzing = () => {
    start: while (this.source.length > 0) {
      console.log(this.result);
      console.log(this.source);
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

      matcher = identifiers.word.reg.exec(this.source)?.[0];

      if (matcher) {
        let index = this.idTable.findIndex(id => id == matcher);
        if (index !== -1) {
          this.result.push({
            tableId: 4,
            elemId: index,
          });
        } else {
          this.result.push({
            tableId: 4,
            elemId: this.idTable.push(this.source.slice(0, matcher.length))-1,
          });
        }
          this.source = this.source.slice(matcher.length);          
        
        continue start;
      }

      matcher = identifiers.number.reg.exec(this.source)?.[0];

      if (matcher) {
        let index = this.numTable.findIndex(num => num == matcher);
        if (index !== -1) {
          this.result.push({
            tableId: 3,
            elemId: index,
          });
        } else {
          this.result.push({
            tableId: 3,
            elemId: this.numTable.push(this.source.slice(0, matcher.length))-1,
          });
        }       
        this.source = this.source.slice(matcher.length);

        continue start;
      }

      matcher = identifiers.space.reg.exec(this.source)?.[0];

      if (matcher) {       
        this.source = this.source.slice(1);
        continue start;
      }

      matcher = identifiers.comment.reg.exec(this.source)?.[0];

      if (matcher) {        
        this.source = this.source.slice(matcher.length);
        continue start;
      }

      throw new Error();
    }
    console.log(this.result);
    console.log(this.idTable);
    console.log(this.numTable);
  };
}

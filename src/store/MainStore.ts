
class MainStore{

    source: string[];
    stack: string[];

    constructor() {
    
    }
    
    setSource = (source: string) => {
        this.source = source.split('');
        console.log(source);
    }

}
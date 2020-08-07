export class VM<T> {
    private runFunc: (bytes: T[], vm: VM<T>) => void = null;
    constructor(runFunc: (bytes: T[], vm: VM<T>) => void) {
        this.runFunc = runFunc;
    }
    stackSize: number = 0;
    stack: T[] = [];
    pop() {
        return this.stack[--this.stackSize];
    }
    push(value: T) {
        this.stack[this.stackSize++] = value;
    }
    getValue() {
        return this.stack[this.stackSize - 1];
    }
    runCode(bytes: T[]) {
        this.runFunc(bytes, this);
    }
    print(tag: string = "") {
        const arr = [];
        for (let i = 0; i < this.stackSize; i++) {
            arr.push(this.stack[i]);
        }
        console.log(tag, JSON.stringify(arr));
    }
}
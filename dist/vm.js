import { create_chunk } from "./chunk.js";
import { disassemble_instruction } from "./debug.js";
import Logger from "./logger.js";
import { compile } from "./compiler.js";
import { printValue } from "./value.js";
export const STACK_MAX = 256;
export class VM {
    constructor() {
        this.ip = 0;
        this.stack = new Float64Array(STACK_MAX);
        this.stackTop = 0;
        this.logger = new Logger("VM");
        this.debug = true;
    }
    interpret(source) {
        const chunk = create_chunk();
        const compile_result = compile(source, chunk);
        if (compile_result === false) {
            return 1;
        }
        this.chunk = chunk;
        this.ip = 0;
        return this.run();
    }
    run() {
        if (this.chunk === null)
            throw "Chunk not loaded";
        while (true) {
            if (this.debug) {
                this.log_stack();
                disassemble_instruction(this.chunk, this.ip, this.logger);
            }
            let instruction = this.read_byte();
            switch (instruction) {
                case 0:
                    let constant = this.read_constant();
                    this.push(constant);
                    break;
                case 2:
                    {
                        const b = this.pop();
                        const a = this.pop();
                        this.push(a + b);
                    }
                    break;
                case 3:
                    {
                        const b = this.pop();
                        const a = this.pop();
                        this.push(a - b);
                    }
                    break;
                case 4:
                    {
                        const b = this.pop();
                        const a = this.pop();
                        this.push(a * b);
                    }
                    break;
                case 5:
                    {
                        const b = this.pop();
                        const a = this.pop();
                        this.push(a / b);
                    }
                    break;
                case 6:
                    this.push(-this.pop());
                    break;
                case 1:
                    console.log(`Final stack value: ${this.pop()}`);
                    return 0;
            }
        }
    }
    read_byte() {
        return this.chunk.code[this.ip++];
    }
    read_constant() {
        return this.chunk.constants.values[this.read_byte()];
    }
    push(value) {
        this.stack[this.stackTop] = value;
        this.stackTop += 1;
    }
    pop() {
        this.stackTop -= 1;
        return this.stack[this.stackTop];
    }
    log(s) { this.logger.log(s); }
    log_nl(s) { this.logger.log_nl(s); }
    log_stack() {
        this.log("          [");
        for (let i = 0; i < this.stackTop; i++) {
            if (i !== 0)
                this.log(", ");
            this.log(printValue(this.stack[i]));
        }
        this.log_nl("]");
    }
}
//# sourceMappingURL=VM.js.map
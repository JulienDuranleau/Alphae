import { Chunk, create_chunk, OpCode } from "./chunk.js";
import { disassemble_instruction } from "./debug.js";
import Logger from "./logger.js";
import { compile } from "./compiler.js";
import { printValue, Value } from "./value.js";

export const enum InterpretResult {
    INTERPRET_OK,
    INTERPRET_COMPILE_ERROR,
    INTERPRET_RUNTIME_ERROR,
}

export const STACK_MAX = 256

export class VM {
    chunk: Chunk
    ip: number = 0
    stack: Float64Array = new Float64Array(STACK_MAX)
    stackTop: number = 0
    logger: Logger = new Logger("VM")
    debug: boolean = true

    interpret(source: string): InterpretResult {
        const chunk = create_chunk()

        const compile_result = compile(source, chunk)

        if (compile_result === false) {
            return InterpretResult.INTERPRET_COMPILE_ERROR
        }

        this.chunk = chunk
        this.ip = 0

        return this.run()
    }

    run(): InterpretResult {
        if (this.chunk === null) throw "Chunk not loaded"

        while (true) {

            if (this.debug) {
                this.log_stack()
                disassemble_instruction(this.chunk, this.ip, this.logger)
            }

            let instruction = this.read_byte()
            switch (instruction) {
                case OpCode.OP_CONSTANT:
                    let constant = this.read_constant()
                    this.push(constant)
                    break
                case OpCode.OP_ADD:
                    {
                        const b = this.pop()
                        const a = this.pop()
                        this.push(a + b)
                    }
                    break
                case OpCode.OP_SUBTRACT:
                    {
                        const b = this.pop()
                        const a = this.pop()
                        this.push(a - b)
                    }
                    break
                case OpCode.OP_MULTIPLY:
                    {
                        const b = this.pop()
                        const a = this.pop()
                        this.push(a * b)
                    }
                    break
                case OpCode.OP_DIVIDE:
                    {
                        const b = this.pop()
                        const a = this.pop()
                        this.push(a / b)
                    }
                    break
                case OpCode.OP_NEGATE:
                    this.push(-this.pop())
                    break
                case OpCode.OP_RETURN:
                    console.log(`Final stack value: ${this.pop()}`)
                    return InterpretResult.INTERPRET_OK
            }
        }

    }

    read_byte(): number {
        return this.chunk.code[this.ip++]
    }

    read_constant(): number {
        return this.chunk.constants.values[this.read_byte()]
    }

    push(value: Value) {
        this.stack[this.stackTop] = value
        this.stackTop += 1
    }

    pop(): Value {
        this.stackTop -= 1
        return this.stack[this.stackTop]
    }

    log(s: string | number | boolean) { this.logger.log(s) }
    log_nl(s: string | number | boolean) { this.logger.log_nl(s) }

    log_stack() {
        this.log("          [")
        for (let i = 0; i < this.stackTop; i++) {
            if (i !== 0) this.log(", ")
            this.log(printValue(this.stack[i]))
        }
        this.log_nl("]")
    }
}

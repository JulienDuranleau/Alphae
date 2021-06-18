import { Chunk, OpCode } from "./chunk.js";
import Logger from "./logger.js";
import { printValue } from "./value.js";

export function disassemble_chunk(chunk: Chunk, name: string, logger: Logger) {
    let offset = 0

    while (offset < chunk.count) {
        offset = disassemble_instruction(chunk, offset, logger)
    }
}


export function disassemble_instruction(chunk: Chunk, offset: number, logger: Logger): number {
    logger.log(`${offset.toString().padStart(4, "0")} `)

    if (offset > 0 && chunk.lines[offset] === chunk.lines[offset - 1]) {
        logger.log("   | ")
    } else {
        logger.log(`${chunk.lines[offset].toString().padStart(4, " ")} `)
    }

    let instruction = chunk.code[offset]

    switch (instruction) {
        case OpCode.OP_CONSTANT:
            return constant_instruction("OP_CONSTANT", chunk, offset, logger)
        case OpCode.OP_NEGATE:
            return simple_instruction("OP_NEGATE", offset, logger)
        case OpCode.OP_ADD:
            return simple_instruction("OP_ADD", offset, logger)
        case OpCode.OP_SUBTRACT:
            return simple_instruction("OP_SUBTRACT", offset, logger)
        case OpCode.OP_MULTIPLY:
            return simple_instruction("OP_MULTIPLY", offset, logger)
        case OpCode.OP_DIVIDE:
            return simple_instruction("OP_DIVIDE", offset, logger)
        case OpCode.OP_RETURN:
            return simple_instruction("OP_RETURN", offset, logger)
        default:
            console.warn(`Unknown opcode ${instruction}`)
            return offset + 1
    }
}

function simple_instruction(name: string, offset: number, logger: Logger): number {
    logger.log_nl(name)
    return offset + 1
}

function constant_instruction(name: string, chunk: Chunk, offset: number, logger: Logger): number {
    let constant_index = chunk.code[offset + 1]

    logger.log(`${name} ${constant_index} `)
    logger.log_nl(printValue(chunk.constants.values[constant_index]))

    return offset + 2
}


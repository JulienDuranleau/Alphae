import { printValue } from "./value.js";
export function disassemble_chunk(chunk, name, logger) {
    let offset = 0;
    while (offset < chunk.count) {
        offset = disassemble_instruction(chunk, offset, logger);
    }
}
export function disassemble_instruction(chunk, offset, logger) {
    logger.log(`${offset.toString().padStart(4, "0")} `);
    if (offset > 0 && chunk.lines[offset] === chunk.lines[offset - 1]) {
        logger.log("   | ");
    }
    else {
        logger.log(`${chunk.lines[offset].toString().padStart(4, " ")} `);
    }
    let instruction = chunk.code[offset];
    switch (instruction) {
        case 0:
            return constant_instruction("OP_CONSTANT", chunk, offset, logger);
        case 6:
            return simple_instruction("OP_NEGATE", offset, logger);
        case 2:
            return simple_instruction("OP_ADD", offset, logger);
        case 3:
            return simple_instruction("OP_SUBTRACT", offset, logger);
        case 4:
            return simple_instruction("OP_MULTIPLY", offset, logger);
        case 5:
            return simple_instruction("OP_DIVIDE", offset, logger);
        case 1:
            return simple_instruction("OP_RETURN", offset, logger);
        default:
            console.warn(`Unknown opcode ${instruction}`);
            return offset + 1;
    }
}
function simple_instruction(name, offset, logger) {
    logger.log_nl(name);
    return offset + 1;
}
function constant_instruction(name, chunk, offset, logger) {
    let constant_index = chunk.code[offset + 1];
    logger.log(`${name} ${constant_index} `);
    logger.log_nl(printValue(chunk.constants.values[constant_index]));
    return offset + 2;
}
//# sourceMappingURL=debug.js.map
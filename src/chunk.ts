// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array

import { MIN_ARRAY_SIZE, reallocate_uint8, reallocate_uint32 } from "./memory.js"
import { create_value_array, init_value_array, Value, ValueArray, write_value_array } from "./value.js"

export const enum OpCode {
    CONSTANT,
    RETURN,
    ADD,
    SUBTRACT,
    MULTIPLY,
    DIVIDE,
    NEGATE,
}

export type Chunk = {
    count: number,
    code: Uint8Array,
    lines: Uint32Array,
    constants: ValueArray,
}

export function create_chunk(): Chunk {
    return {
        count: 0,
        code: new Uint8Array(),
        lines: new Uint32Array(),
        constants: create_value_array()
    }
}

export function init_chunk(chunk: Chunk) {
    chunk.count = 0
    chunk.code = new Uint8Array()
    chunk.lines = new Uint32Array()
    init_value_array(chunk.constants)
}

export function write_chunk(chunk: Chunk, byte: number, line: number) {
    if (chunk.code.length < chunk.count + 1) {
        const new_capacity = chunk.code.length < MIN_ARRAY_SIZE ? MIN_ARRAY_SIZE : chunk.code.length * 2
        chunk.code = reallocate_uint8(chunk.code, new_capacity)
        chunk.lines = reallocate_uint32(chunk.lines, new_capacity)
    }

    chunk.code[chunk.count] = byte
    chunk.lines[chunk.count] = line
    chunk.count += 1
}

export function add_constant(chunk: Chunk, value: Value): number {
    write_value_array(chunk.constants, value)
    return chunk.constants.count - 1
}

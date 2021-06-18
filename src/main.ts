import { addConstant, Chunk, create_chunk, OpCode, write_chunk } from "./chunk.js";
import { VM } from "./VM.js";

(() => {
    const vm = new VM()

    // const c: Chunk = create_chunk()

    // let constant = addConstant(c, 1.2)
    // write_chunk(c, OpCode.OP_CONSTANT, 123)
    // write_chunk(c, constant, 123)

    // constant = addConstant(c, 3.4)
    // write_chunk(c, OpCode.OP_CONSTANT, 123)
    // write_chunk(c, constant, 123)

    // write_chunk(c, OpCode.OP_ADD, 123)

    // constant = addConstant(c, 5.6)
    // write_chunk(c, OpCode.OP_CONSTANT, 123)
    // write_chunk(c, constant, 123)

    // write_chunk(c, OpCode.OP_DIVIDE, 123)

    // write_chunk(c, OpCode.OP_NEGATE, 123)

    // write_chunk(c, OpCode.OP_RETURN, 123)

    fetch("sample.alphae").then(r => r.text()).then(source => {
        vm.interpret(source)
    })
})()

import { add_constant, Chunk, OpCode, write_chunk } from './chunk.js'
import { ParseRule, rules } from './compiler_rules.js';
import { disassemble_chunk } from './debug.js';
import Logger from './logger.js';
import { Token, scan_token as scan_token, TokenType, scanner } from './scanner.js'
import { Value } from "./value.js";

export type Parser = {
    current: Token,
    previous: Token,
    had_error: boolean,
    panic_mode: boolean,
}

export const enum Precedence {
    NONE,
    ASSIGNMENT,  // =
    OR,          // or
    AND,         // and
    EQUALITY,    // == !=
    COMPARISON,  // < > <= >=
    TERM,        // + -
    FACTOR,      // * /
    UNARY,       // ! -
    CALL,        // . ()
    PRIMARY
}

let parser: Parser

const logger: Logger = new Logger("Compiler Bytecode", "IDX  Line OpCode      ")

let compiling_chunk: Chunk

export function compile(source: string, chunk: Chunk): boolean {

    scanner.start = 0
    scanner.current = 0
    scanner.line = 1
    scanner.source = source + "\0"

    parser = {
        current: {
            type: TokenType.START_OF_FILE,
            length: 0,
            line: 1,
            start: 0,
            lexeme: "",
        },
        previous: {} as Token,
        had_error: false,
        panic_mode: false,
    }

    compiling_chunk = chunk

    advance()
    expression()
    consume(TokenType.EOF, "Expect end of expression.")
    end_compiler()

    return !parser.had_error
}

function expression() {
    parse_precedence(Precedence.ASSIGNMENT)
}

// Prefix
export function number() {
    const value = parseFloat(parser.previous.lexeme)
    emit_constant(value)
}

// Prefix
export function grouping() {
    expression()
    consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.")
}

// Prefix
export function unary() {
    let operator_type = parser.previous.type

    parse_precedence(Precedence.UNARY);

    switch (operator_type) {
        case TokenType.MINUS: emit_byte(OpCode.NEGATE); break
        default: return
    }
}

// Infix
export function binary() {
    const operator_type = parser.previous.type
    const rule = rules[operator_type]
    parse_precedence(rule.precedence + 1)

    switch (operator_type) {
        case TokenType.PLUS: emit_byte(OpCode.ADD); break
        case TokenType.MINUS: emit_byte(OpCode.SUBTRACT); break
        case TokenType.STAR: emit_byte(OpCode.MULTIPLY); break
        case TokenType.SLASH: emit_byte(OpCode.DIVIDE); break
        default: return
    }
}

function parse_precedence(precedence: Precedence) {
    advance()

    const prefix_rule = rules[parser.previous.type].prefix

    if (prefix_rule === null) {
        error("Expect expression.")
        return
    }

    prefix_rule()

    // Now handle infix if any

    while (precedence <= rules[parser.current.type].precedence) {
        advance()

        const infix_rule = rules[parser.previous.type].infix

        if (infix_rule === null) {
            throw "Expected an infix function..."
        }

        infix_rule()
    }
}

function end_compiler() {
    console.log(`Compiler ending. Error is at ${parser.had_error}`)
    emit_return()

    if (!parser.had_error) {
        disassemble_chunk(current_chunk(), "code", logger)
    }
}

function emit_constant(value: Value) {
    emit_bytes(OpCode.CONSTANT, make_constant(value))
}

function make_constant(value: Value): number {
    const constant = add_constant(current_chunk(), value)
    return constant
}

function emit_return() {
    emit_byte(OpCode.RETURN)
}

function advance() {
    parser.previous = parser.current

    while (true) {
        parser.current = scan_token()
        if (parser.current.type != TokenType.ERROR) break

        error_at_current(parser.current.lexeme)
    }
}

function consume(type: TokenType, message: string) {
    if (parser.current.type === type) {
        advance()
        return
    }

    error_at_current(message)
}

function emit_byte(byte: number) {
    write_chunk(current_chunk(), byte, parser.previous.line)
}


function emit_bytes(byte1: number, byte2: number) {
    emit_byte(byte1)
    emit_byte(byte2)
}

function current_chunk(): Chunk {
    if (compiling_chunk === null) throw "Chunk not defined"
    return compiling_chunk
}

function error_at_current(message: string) {
    error_at(parser.current, message)
}

function error(message: string) {
    error_at(parser.previous, message)
}

function error_at(token: Token | null, message: string) {
    if (token === null) throw "Token should not be null"
    if (parser.panic_mode) return

    parser.panic_mode = true
    console.warn(`[Line ${token.line}] Error : ${message}`)
    parser.had_error = true
}
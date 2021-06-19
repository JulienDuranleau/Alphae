import { Chunk } from "./chunk.js";
import Logger from "./logger.js";

export const enum TokenType {
    // Single-character tokens.
    LEFT_PAREN, RIGHT_PAREN,
    LEFT_BRACE, RIGHT_BRACE,
    COMMA, DOT, MINUS, PLUS,
    SEMICOLON, SLASH, STAR,
    // One or two character tokens.
    BANG, BANG_EQUAL,
    EQUAL, EQUAL_EQUAL,
    GREATER, GREATER_EQUAL,
    LESS, LESS_EQUAL,
    // Literals.
    IDENTIFIER, STRING, NUMBER,
    // Keywords.
    AND, CLASS, ELSE, FALSE,
    FOR, FUN, IF, NIL, OR,
    PRINT, RETURN, SUPER, THIS,
    TRUE, VAR, WHILE,

    ERROR, EOF, START_OF_FILE
}

export type Token = {
    type: TokenType,
    start: number,
    length: number,
    line: number,
    lexeme: string,
}

export const scanner = {
    start: 0, // start of current lexeme
    current: 0, // current "cursor" position in source
    line: 1,
    source: "",
}

let line = -1

const logger = new Logger("Scanner Tokens", "Line Type Lexeme")

export function scan_token(): Token {
    skip_whitespace()

    scanner.start = scanner.current

    if (is_at_end()) return make_token(TokenType.EOF)

    const c = advance()

    switch (c) {
        case '(': return make_token(TokenType.LEFT_PAREN)
        case ')': return make_token(TokenType.RIGHT_PAREN)
        case '{': return make_token(TokenType.LEFT_BRACE)
        case '}': return make_token(TokenType.RIGHT_BRACE)
        case ';': return make_token(TokenType.SEMICOLON)
        case ',': return make_token(TokenType.COMMA)
        case '.': return make_token(TokenType.DOT)
        case '-': return make_token(TokenType.MINUS)
        case '+': return make_token(TokenType.PLUS)
        case '/': return make_token(TokenType.SLASH)
        case '*': return make_token(TokenType.STAR)

        case '!': return make_token(match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        case '=': return make_token(match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        case '<': return make_token(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        case '>': return make_token(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);

        case '"': return string()

        default:
            if (is_digit(c)) return number()
            if (is_alpha(c)) return identifier()
    }

    return error_token("Unexpected character.")
}

function skip_whitespace() {
    while (true) {
        const c = peek()

        switch (c) {
            case ' ':
            case '\r':
            case '\t':
                advance()
                break
            case '\n':
                scanner.line += 1
                advance()
                break
            case '/':
                if (peek_next() === '/') {
                    while (peek() !== "\n" && !is_at_end()) {
                        advance()
                    }
                } else {
                    return
                }
                break
            default:
                return
        }
    }
}

function number(): Token {
    while (is_digit(peek())) advance()

    // decimals
    if (peek() === '.' && is_digit(peek_next())) {
        advance()
        while (is_digit(peek())) advance()
    }

    return make_token(TokenType.NUMBER)
}

function string(): Token {
    while (peek() !== '"' && !is_at_end()) {
        if (peek() === '\n') scanner.line++
        advance()
    }

    if (is_at_end()) return error_token("Unterminated string")

    // Reached closing quote
    advance()
    return make_token(TokenType.STRING)
}

function identifier(): Token {
    while (is_alpha(peek()) || is_digit(peek())) advance()
    return make_token(find_identifier_type())
}

function find_identifier_type(): TokenType {
    switch (scanner.source[scanner.start]) {
        case 'a': return check_keyword(1, 2, "nd", TokenType.AND)
        case 'c': return check_keyword(1, 4, "lass", TokenType.CLASS)
        case 'e': return check_keyword(1, 3, "lse", TokenType.ELSE)
        case 'f':
            if (scanner.current - scanner.start > 1) {
                switch (scanner.source[scanner.start + 1]) {
                    case 'a': return check_keyword(2, 3, "lse", TokenType.FALSE)
                    case 'o': return check_keyword(2, 1, "r", TokenType.FOR)
                    case 'u': return check_keyword(2, 1, "n", TokenType.FUN)
                }
            }
            break
        case 'i': return check_keyword(1, 1, "f", TokenType.IF)
        case 'n': return check_keyword(1, 2, "il", TokenType.NIL)
        case 'o': return check_keyword(1, 1, "r", TokenType.OR)
        case 'p': return check_keyword(1, 4, "rint", TokenType.PRINT)
        case 'r': return check_keyword(1, 5, "eturn", TokenType.RETURN)
        case 's': return check_keyword(1, 4, "uper", TokenType.SUPER)
        case 't':
            if (scanner.current - scanner.start > 1) {
                switch (scanner.source[scanner.start + 1]) {
                    case 'h': return check_keyword(2, 2, "is", TokenType.THIS)
                    case 'r': return check_keyword(2, 2, "ue", TokenType.TRUE)
                }
            }
            break
        case 'v': return check_keyword(1, 2, "ar", TokenType.VAR)
        case 'w': return check_keyword(1, 4, "hile", TokenType.WHILE)
    }
    return TokenType.IDENTIFIER
}

function check_keyword(start: number, length: number, rest: string, type: TokenType): TokenType {
    let is_same_length = scanner.current - scanner.start == start + length

    if (is_same_length && rest === scanner.source.substring(scanner.start + start, scanner.current)) {
        return type
    }

    return TokenType.IDENTIFIER
}

function is_alpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
}

function is_digit(c: string): boolean {
    return c >= '0' && c <= '9'
}

function peek(): string {
    return scanner.source[scanner.current]
}

function peek_next(): string {
    if (is_at_end()) return '\0'
    return scanner.source[scanner.current + 1]
}

function match(c: string): boolean {
    if (is_at_end()) return false
    if (scanner.source[scanner.current] !== c) return false

    scanner.current += 1
    return true
}

function advance(): string {
    scanner.current += 1
    return scanner.source[scanner.current - 1]
}

function is_at_end(): boolean {
    return scanner.source[scanner.current] === "\0"
}

function make_token(type: TokenType): Token {
    let len = scanner.current - scanner.start

    const token: Token = {
        type: type,
        start: scanner.start,
        length: len,
        line: scanner.line,
        lexeme: scanner.source.substr(scanner.start, len),
    }

    debug_token(token)

    return token
}

function debug_token(token: Token) {
    if (token.line !== line) {
        logger.log(`${token.line.toString().padStart(4, " ")} `)
        line = token.line
    } else {
        logger.log("   | ")
    }

    let lexeme = scanner.source.substr(token.start, token.length)
    logger.log_nl(`${token.type.toString().padStart(3, " ")}  ${lexeme}`)
}

function error_token(msg: string): Token {
    const token: Token = {
        type: TokenType.ERROR,
        length: msg.length,
        line: scanner.line,
        start: scanner.current,
        lexeme: msg,
    }
    return token
}
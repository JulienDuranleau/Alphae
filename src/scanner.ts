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

    ERROR, EOF
}

export type Token = {
    type: TokenType,
    start: number,
    length: number,
    line: number,
}

const scanner = {
    start: 0, // start of current lexeme
    current: 0, // current "cursor" position in source
    line: 1,
    source: "",
}

const logger = new Logger("Scanner", "line type lexeme")

function expression() {

}

function consume(type: TokenType, error_message: string) {

}

export function scanToken(): Token {
    skipWhitespace()

    scanner.start = scanner.current

    if (isAtEnd()) return makeToken(TokenType.EOF)

    const c = advance()

    switch (c) {
        case '(': return makeToken(TokenType.LEFT_PAREN)
        case ')': return makeToken(TokenType.RIGHT_PAREN)
        case '{': return makeToken(TokenType.LEFT_BRACE)
        case '}': return makeToken(TokenType.RIGHT_BRACE)
        case ';': return makeToken(TokenType.SEMICOLON)
        case ',': return makeToken(TokenType.COMMA)
        case '.': return makeToken(TokenType.DOT)
        case '-': return makeToken(TokenType.MINUS)
        case '+': return makeToken(TokenType.PLUS)
        case '/': return makeToken(TokenType.SLASH)
        case '*': return makeToken(TokenType.STAR)

        case '!': return makeToken(match('=') ? TokenType.BANG_EQUAL : TokenType.BANG);
        case '=': return makeToken(match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        case '<': return makeToken(match('=') ? TokenType.LESS_EQUAL : TokenType.LESS);
        case '>': return makeToken(match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER);

        case '"': return string()

        default:
            if (isDigit(c)) return number()
            if (isAlpha(c)) return identifier()
    }

    return errorToken("Unexpected character.")
}

function skipWhitespace() {
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
                if (peekNext() === '/') {
                    while (peek() !== "\n" && !isAtEnd()) {
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
    while (isDigit(peek())) advance()

    // decimals
    if (peek() === '.' && isDigit(peekNext())) {
        advance()
        while (isDigit(peek())) advance()
    }

    return makeToken(TokenType.NUMBER)
}

function string(): Token {
    while (peek() !== '"' && !isAtEnd()) {
        if (peek() === '\n') scanner.line++
        advance()
    }

    if (isAtEnd()) return errorToken("Unterminated string")

    // Reached closing quote
    advance()
    return makeToken(TokenType.STRING)
}

function identifier(): Token {
    while (isAlpha(peek()) || isDigit(peek())) advance()
    return makeToken(findIdentifierType())
}

function findIdentifierType(): TokenType {
    /*
    AND, 
    CLASS, 
    ELSE, 

    FALSE,
    FOR, 
    FUN, 

    IF, 
    NIL, 
    OR,
    PRINT, 
    RETURN, 
    SUPER,

    THIS,
    TRUE, 
    
    VAR, 
    WHILE,
    */

    switch (scanner.source[scanner.start]) {
        case 'a': return checkKeyword(1, 2, "nd", TokenType.AND)
        case 'c': return checkKeyword(1, 4, "lass", TokenType.CLASS)
        case 'e': return checkKeyword(1, 3, "lse", TokenType.ELSE)
        case 'f':
            if (scanner.current - scanner.start > 1) {
                switch (scanner.source[scanner.start + 1]) {
                    case 'a': return checkKeyword(2, 3, "lse", TokenType.FALSE)
                    case 'o': return checkKeyword(2, 1, "r", TokenType.FOR)
                    case 'u': return checkKeyword(2, 1, "n", TokenType.FUN)
                }
            }
            break
        case 'i': return checkKeyword(1, 1, "f", TokenType.IF)
        case 'n': return checkKeyword(1, 2, "il", TokenType.NIL)
        case 'o': return checkKeyword(1, 1, "r", TokenType.OR)
        case 'p': return checkKeyword(1, 4, "rint", TokenType.PRINT)
        case 'r': return checkKeyword(1, 5, "eturn", TokenType.RETURN)
        case 's': return checkKeyword(1, 4, "uper", TokenType.SUPER)
        case 't':
            if (scanner.current - scanner.start > 1) {
                switch (scanner.source[scanner.start + 1]) {
                    case 'h': return checkKeyword(2, 2, "is", TokenType.THIS)
                    case 'r': return checkKeyword(2, 2, "ue", TokenType.TRUE)
                }
            }
            break
        case 'v': return checkKeyword(1, 2, "ar", TokenType.VAR)
        case 'w': return checkKeyword(1, 4, "hile", TokenType.WHILE)
    }
    return TokenType.IDENTIFIER
}

function checkKeyword(start: number, length: number, rest: string, type: TokenType): TokenType {
    let is_same_length = scanner.current - scanner.start == start + length

    if (is_same_length && rest === scanner.source.substring(scanner.start + start, scanner.current)) {
        return type
    }

    return TokenType.IDENTIFIER
}

function isAlpha(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_'
}

function isDigit(c: string): boolean {
    return c >= '0' && c <= '9'
}

function peek(): string {
    return scanner.source[scanner.current]
}

function peekNext(): string {
    if (isAtEnd()) return '\0'
    return scanner.source[scanner.current + 1]
}

function match(c: string): boolean {
    if (isAtEnd()) return false
    if (scanner.source[scanner.current] !== c) return false

    scanner.current += 1
    return true
}

function advance(): string {
    scanner.current += 1
    return scanner.source[scanner.current - 1]
}

function isAtEnd(): boolean {
    return scanner.source[scanner.current] === "\0"
}

function makeToken(type: TokenType): Token {
    const token: Token = {
        type: type,
        start: scanner.start,
        length: scanner.current - scanner.start,
        line: scanner.line,
    }
    return token
}

function errorToken(msg: string): Token {
    // TODO
    const token: Token = {
        type: TokenType.ERROR,
        length: msg.length,
        line: scanner.line,
        start: scanner.current
    }
    return token
}
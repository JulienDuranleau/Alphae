import { Chunk } from './chunk.js'
import { Token, scanToken, TokenType } from './scanner.js'

export type Parser = {
    current: Token | null,
    previous: Token | null,
    had_error: boolean,
    panic_mode: boolean,
}

let parser: Parser = {
    current: null,
    previous: null,
    had_error: false,
    panic_mode: false,
}

export function compile(source: string, chunk: Chunk): boolean {

    // scanner.start = 0
    // scanner.current = 0
    // scanner.line = 1
    // scanner.source = source + "\0"

    // let line = -1

    // while (true) {
    //     const token: Token = scanToken()

    //     if (token.line !== line) {
    //         logger.log(`${token.line.toString().padStart(4, " ")} `)
    //         line = token.line
    //     } else {
    //         logger.log("   | ")
    //     }

    //     let lexeme = scanner.source.substr(token.start, token.length)
    //     logger.log_nl(`${token.type.toString().padStart(3, " ")}  ${lexeme}`)

    //     if (token.type === TokenType.EOF) {
    //         break
    //     }
    // }

    advance()
    expression()
    consume(TokenType.EOF, "Expect end of expression.")

    return !parser.had_error
}

function advance() {
    parser.previous = parser.current

    while (true) {
        parser.current = scanToken()
        if (parser.current.type != TokenType.ERROR) break

        errorAtCurrent("TODO read ERROR token message")
    }
}

function consume(type: TokenType, message: string) {
    if (parser.current?.type === type) {
        advance()
        return
    }

    errorAtCurrent(message)
}

function errorAtCurrent(message: string) {
    errorAt(parser.current, message)
}

function error(message: string) {
    errorAt(parser.previous, message)
}

function errorAt(token: Token | null, message: string) {
    if (token === null) throw "Token should not be null"
    if (parser.panic_mode) return
    parser.panic_mode = true
    console.warn(`[Line ${token.line}] Error : ${message}`)
    parser.had_error = true
}
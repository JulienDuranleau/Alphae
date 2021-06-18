import Logger from "./logger.js";
const scanner = {
    start: 0,
    current: 0,
    line: 1,
    source: "",
};
let logger = new Logger("parser");
export function compile(source) {
    scanner.source = source + "\0";
    let line = -1;
    while (true) {
        const token = scanToken();
        if (token.line !== line) {
            logger.log(`${token.line.toString().padStart(4, " ")} `);
            line = token.line;
        }
        else {
            logger.log("   | ");
        }
        let lexeme = scanner.source.substr(token.start, token.length);
        logger.log_nl(`${token.type.toString().padStart(2, " ")} '${lexeme}'`);
        if (token.type === 39) {
            break;
        }
    }
    return {};
}
function scanToken() {
    skipWhitespace();
    scanner.start = scanner.current;
    if (isAtEnd())
        return makeToken(39);
    const c = advance();
    switch (c) {
        case '(': return makeToken(0);
        case ')': return makeToken(1);
        case '{': return makeToken(2);
        case '}': return makeToken(3);
        case ';': return makeToken(8);
        case ',': return makeToken(4);
        case '.': return makeToken(5);
        case '-': return makeToken(6);
        case '+': return makeToken(7);
        case '/': return makeToken(9);
        case '*': return makeToken(10);
        case '!': return makeToken(match('=') ? 12 : 11);
        case '=': return makeToken(match('=') ? 14 : 13);
        case '<': return makeToken(match('=') ? 18 : 17);
        case '>': return makeToken(match('=') ? 16 : 15);
        case '"': return string();
        default:
            if (isDigit(c))
                return number();
            if (isAlpha(c))
                return identifier();
    }
    return errorToken("Unexpected character.");
}
function skipWhitespace() {
    while (true) {
        const c = peek();
        switch (c) {
            case ' ':
            case '\r':
            case '\t':
                advance();
                break;
            case '\n':
                scanner.line += 1;
                advance();
                break;
            case '/':
                if (peekNext() === '/') {
                    while (peek() !== "\n" && !isAtEnd()) {
                        advance();
                    }
                }
                else {
                    return;
                }
                break;
            default:
                return;
        }
    }
}
function number() {
    while (isDigit(peek()))
        advance();
    if (peek() === '.' && isDigit(peekNext())) {
        advance();
        while (isDigit(peek()))
            advance();
    }
    return makeToken(21);
}
function string() {
    while (peek() !== '"' && !isAtEnd()) {
        if (peek() === '\n')
            scanner.line++;
        advance();
    }
    if (isAtEnd())
        return errorToken("Unterminated string");
    advance();
    return makeToken(20);
}
function identifier() {
    while (isAlpha(peek()) || isDigit(peek()))
        advance();
    return makeToken(findIdentifierType());
}
function findIdentifierType() {
    switch (scanner.source[scanner.start]) {
        case 'a': return checkKeyword(1, 2, "nd", 22);
        case 'c': return checkKeyword(1, 4, "lass", 23);
        case 'e': return checkKeyword(1, 3, "lse", 24);
        case 'f':
            if (scanner.current - scanner.start > 1) {
                switch (scanner.source[scanner.start + 1]) {
                    case 'a': return checkKeyword(2, 3, "lse", 25);
                    case 'o': return checkKeyword(2, 1, "r", 26);
                    case 'u': return checkKeyword(2, 1, "n", 27);
                }
            }
            break;
        case 'i': return checkKeyword(1, 1, "f", 28);
        case 'n': return checkKeyword(1, 2, "il", 29);
        case 'o': return checkKeyword(1, 1, "r", 30);
        case 'p': return checkKeyword(1, 4, "rint", 31);
        case 'r': return checkKeyword(1, 5, "eturn", 32);
        case 's': return checkKeyword(1, 4, "uper", 33);
        case 't':
            if (scanner.current - scanner.start > 1) {
                switch (scanner.source[scanner.start + 1]) {
                    case 'h': return checkKeyword(2, 2, "is", 34);
                    case 'r': return checkKeyword(2, 2, "ue", 35);
                }
            }
            break;
        case 'v': return checkKeyword(1, 2, "ar", 36);
        case 'w': return checkKeyword(1, 4, "hile", 37);
    }
    return 19;
}
function checkKeyword(start, length, rest, type) {
    let is_same_length = scanner.current - scanner.start == start + length;
    if (is_same_length && rest === scanner.source.substring(scanner.start + start, scanner.current)) {
        return type;
    }
    return 19;
}
function isAlpha(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
}
function isDigit(c) {
    return c >= '0' && c <= '9';
}
function peek() {
    return scanner.source[scanner.current];
}
function peekNext() {
    if (isAtEnd())
        return '\0';
    return scanner.source[scanner.current + 1];
}
function match(c) {
    if (isAtEnd())
        return false;
    if (scanner.source[scanner.current] !== c)
        return false;
    scanner.current += 1;
    return true;
}
function advance() {
    scanner.current += 1;
    return scanner.source[scanner.current - 1];
}
function isAtEnd() {
    return scanner.source[scanner.current] === "\0";
}
function makeToken(type) {
    const token = {
        type: type,
        start: scanner.start,
        length: scanner.current - scanner.start,
        line: scanner.line,
    };
    return token;
}
function errorToken(msg) {
    const token = {
        type: 38,
        length: msg.length,
        line: scanner.line,
        start: scanner.current
    };
    return token;
}
//# sourceMappingURL=parser.js.map
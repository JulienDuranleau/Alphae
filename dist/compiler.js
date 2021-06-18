import { scanToken } from './scanner.js';
let parser = {
    current: null,
    previous: null,
    had_error: false,
    panic_mode: false,
};
export function compile(source, chunk) {
    advance();
    expression();
    consume(39, "Expect end of expression.");
    return !parser.had_error;
}
function advance() {
    parser.previous = parser.current;
    while (true) {
        parser.current = scanToken();
        if (parser.current.type != 38)
            break;
        errorAtCurrent("TODO read ERROR token message");
    }
}
function consume(type, message) {
    var _a;
    if (((_a = parser.current) === null || _a === void 0 ? void 0 : _a.type) === type) {
        advance();
        return;
    }
    errorAtCurrent(message);
}
function errorAtCurrent(message) {
    errorAt(parser.current, message);
}
function error(message) {
    errorAt(parser.previous, message);
}
function errorAt(token, message) {
    if (parser.panic_mode)
        return;
    if (token === null)
        throw "Token should not be null";
    parser.panic_mode = true;
    console.warn(`[Line ${token.line}] Error : ${message}`);
    parser.had_error = true;
}
//# sourceMappingURL=compiler.js.map
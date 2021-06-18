export default class Logger {
    constructor(name, header = undefined) {
        this.tag = document.createElement("div");
        this.tag.classList.add(name);
        this.tag.classList.add("code");
        document.body.append(this.tag);
        let title = document.createElement("h1");
        title.textContent = name;
        this.tag.append(title);
        this.codeTag = document.createElement("pre");
        this.tag.append(this.codeTag);
        if (header !== undefined) {
            this.log_nl(header);
            this.log_nl("-".repeat(header.length));
        }
    }
    log(s) { this.codeTag.textContent += s.toString(); }
    log_nl(s) { this.log(s.toString() + "\n"); }
}
//# sourceMappingURL=logger.js.map
import { VM } from "./VM.js";

(() => {
    const vm = new VM()

    fetch("sample.alphae").then(r => r.text()).then(source => {
        vm.interpret(source)
    })
})()

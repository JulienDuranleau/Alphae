import { MIN_ARRAY_SIZE, reallocate_float64 } from "./memory.js";
export function create_value_array() {
    return {
        count: 0,
        values: new Float64Array()
    };
}
export function init_value_array(array) {
    array.count = 0;
    array.values = new Float64Array();
}
export function write_value_array(array, byte) {
    if (array.values.length < array.count + 1) {
        const new_capacity = array.values.length < MIN_ARRAY_SIZE ? MIN_ARRAY_SIZE : array.values.length * 2;
        array.values = reallocate_float64(array.values, new_capacity);
    }
    array.values[array.count] = byte;
    array.count += 1;
}
export function printValue(value) {
    return value.toString();
}
//# sourceMappingURL=value.js.map
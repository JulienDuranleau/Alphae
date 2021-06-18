export const MIN_ARRAY_SIZE = 8

export function reallocate_uint8(old_array: Uint8Array, new_capacity: number): Uint8Array {
    if (new_capacity === 0) {
        return new Uint8Array()
    }

    let new_array = new Uint8Array(new_capacity)
    new_array.set(old_array)

    return new_array
}

export function reallocate_uint32(old_array: Uint32Array, new_capacity: number): Uint32Array {
    if (new_capacity === 0) {
        return new Uint32Array()
    }

    let new_array = new Uint32Array(new_capacity)
    new_array.set(old_array)

    return new_array
}

export function reallocate_float64(old_array: Float64Array, new_capacity: number): Float64Array {
    if (new_capacity === 0) {
        return new Float64Array()
    }

    let new_array = new Float64Array(new_capacity)
    new_array.set(old_array)

    return new_array
}
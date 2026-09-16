const CART_ID_KEY = "sublime_gracia_cart_id"

export const obtenerValorLocal = (key: string): string | null => {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

export const guardarValorLocal = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value)
    } catch {
        // Algunas configuraciones de Safari pueden bloquear localStorage.
    }
}

export const obtenerCartId = (): string | null => {
    return obtenerValorLocal(CART_ID_KEY)
}

export const guardarCartId = (cartId: unknown): void => {
    if (typeof cartId !== "string" || !cartId) {
        return
    }

    guardarValorLocal(CART_ID_KEY, cartId)
}

export const headersCarrito = (): Record<string, string> => {
    const cartId = obtenerCartId()
    return cartId ? { "X-Cart-Id": cartId } : {}
}
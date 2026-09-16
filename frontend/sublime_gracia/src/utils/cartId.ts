const CART_ID_KEY = "sublime_gracia_cart_id"

export const obtenerCartId = (): string | null => {
    try {
        return localStorage.getItem(CART_ID_KEY)
    } catch {
        return null
    }
}

export const guardarCartId = (cartId: unknown): void => {
    if (typeof cartId !== "string" || !cartId) {
        return
    }

    try {
        localStorage.setItem(CART_ID_KEY, cartId)
    } catch {
        // El carrito sigue funcionando con la cookie si localStorage no está disponible.
    }
}

export const headersCarrito = (): Record<string, string> => {
    const cartId = obtenerCartId()
    return cartId ? { "X-Cart-Id": cartId } : {}
}
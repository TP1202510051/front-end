export const promptMap: { mini: string; full: string }[] = [
    {
      mini: 'Tienda sencilla',
      full: `
  Me gustaría una página de tienda online muy básica:
  - Una cabecera con el logo y un menú (Inicio, Tienda, Contacto).
  - Un área donde se muestren los productos en tarjetas con foto, nombre y precio.
  - Un pie de página con información de la empresa y enlaces de contacto.
  `.trim()
    },
    {
      mini: 'Tienda con carrito',
      full: `
  Necesito una tienda donde se pueda “añadir al carrito”:
  - Muestra los productos con su foto, nombre y precio.
  - Cada producto tiene un botón para agregar al carrito.
  - Ver un carrito con la lista de productos, la cantidad y el total (solo la apariencia).
  - Incluye cabecera y pie de página simples.
  `.trim()
    },
    {
      mini: 'Checkout de pago',
      full: `
  Quiero la parte de pago de la tienda:
  - Un formulario para ingresar datos de facturación (nombre, dirección) y datos de tarjeta.
  - Mensajes de error si falta algo.
  - Un botón “Pagar” que lleve a una página de confirmación (solo apariencia).
  - Mantén una cabecera y un pie de página discretos.
  `.trim()
    },
    {
      mini: 'Gestión de inventario',
      full: `
  Necesito una vista para controlar existencias:
  - Muestra una lista de productos con su foto, nombre y cantidad disponible.
  - Un espacio para buscar o filtrar productos.
  - Botones para “Editar” o “Eliminar” cada producto (solo apariencia).
  - Añade una cabecera y un pie de página sencillos.
  `.trim()
    },
  ];
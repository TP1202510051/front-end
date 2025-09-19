export const promptMapWindows: { mini: string; full: string }[] = [
    {
      mini: 'Página básica de tienda online: cabecera con logo y menú (Inicio, Tienda, Contacto), sección de productos en tarjetas (foto, nombre, precio) y pie de página con info de empresa y contactos.',
      full: `
  Me gustaría una página de tienda online muy básica:
  - Una cabecera con el logo y un menú (Inicio, Tienda, Contacto).
  - Un área donde se muestren los productos en tarjetas con foto, nombre y precio.
  - Un pie de página con información de la empresa y enlaces de contacto.
  `.trim()
    },
    {
      mini: 'Tienda online con: cabecera y pie simples, productos en tarjetas (foto, nombre, precio, botón “añadir al carrito”), y carrito visible con lista, cantidades y total (solo apariencia).',
      full: `
  Necesito una tienda donde se pueda “añadir al carrito”:
  - Muestra los productos con su foto, nombre y precio.
  - Cada producto tiene un botón para agregar al carrito.
  - Ver un carrito con la lista de productos, la cantidad y el total (solo la apariencia).
  - Incluye cabecera y pie de página simples.
  `.trim()
    },
    {
      mini: 'Sección de pago: formulario con datos de facturación y tarjeta, validación con mensajes de error, botón “Pagar” que lleva a página de confirmación (solo apariencia), cabecera y pie discretos.',
      full: `
  Quiero la parte de pago de la tienda:
  - Un formulario para ingresar datos de facturación (nombre, dirección) y datos de tarjeta.
  - Mensajes de error si falta algo.
  - Un botón “Pagar” que lleve a una página de confirmación (solo apariencia).
  - Mantén una cabecera y un pie de página discretos.
  `.trim()
    },
    {
      mini: 'Sección de productos: lista con foto, nombre y precio, barra de búsqueda o filtro, botones “Editar” y “Eliminar” (solo apariencia), y botones “Ver” y “Añadir al carrito” (solo apariencia).',
      full: `
  Necesito una sección para mostrar productos:
  - Lista de productos con foto, nombre y precio.
  - Barra de búsqueda o filtro.
  - Botones para “Editar” o “Eliminar” cada producto (solo apariencia).
  - Botones “Ver” o “Añadir al carrito” en cada producto (solo apariencia).
  `.trim()
    },
  ];
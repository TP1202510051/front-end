export const promptMapWindows: { mini: string; hover: string; full: string }[] = [
  {
    mini: 'Página básica de tienda online',
    hover: 'Cabecera con logo y menú (Inicio, Tienda, Contacto), sección de productos en tarjetas (foto, nombre, precio) y pie de página con info de empresa y contactos.',
    full: `
Me gustaría una página de tienda online muy básica:
- Una cabecera con el logo y un menú (Inicio, Tienda, Contacto).
- Un área donde se muestren los productos en tarjetas con foto, nombre y precio.
- Un pie de página con información de la empresa y enlaces de contacto.
`.trim()
  },
  {
    mini: 'Sección de pago',
    hover: 'Formulario con datos de facturación y tarjeta, validación con mensajes de error, botón “Pagar” que lleva a página de confirmación (solo apariencia), cabecera y pie discretos.',
    full: `
Quiero la parte de pago de la tienda:
- Un formulario para ingresar datos de facturación (nombre, dirección) y datos de tarjeta.
- Mensajes de error si falta algo.
- Un botón “Pagar” que lleve a una página de confirmación (solo apariencia).
- Mantén una cabecera y un pie de página discretos.
`.trim()
  },
  {
    mini: 'Sección de productos',
    hover: 'Lista con foto, nombre y precio, barra de búsqueda o filtro, botones “Editar” y “Eliminar” (solo apariencia), y botones “Ver” y “Añadir al carrito” (solo apariencia).',
    full: `
Necesito una sección para mostrar productos:
- Lista de productos con foto, nombre y precio.
- Barra de búsqueda o filtro.
- Botones “Ver” o “Añadir al carrito” en cada producto (solo apariencia).
`.trim()
  },
  {
    mini: 'Detalle de producto',
    hover: 'Página que muestra un producto específico con foto grande, nombre, descripción, precio, selector de talla o cantidad, y botón “Agregar al carrito”.',
    full: `
Quiero una página de detalle de producto:
- Mostrar una foto grande del producto, su nombre, descripción y precio.
- Incluir un selector de talla o cantidad.
- Agregar un botón “Añadir al carrito”.
- Incluir cabecera con logo y menú, y pie de página con información de contacto.
`.trim()
  },
  {
    mini: 'Vista de todos los productos',
    hover: 'Página que muestra todos los productos con opción de filtrar o buscar, paginación o scroll infinito, y un diseño en cuadrícula con tarjetas de producto. ',
    full: `
Necesito una vista general de todos los productos:
- Mostrar todos los productos en una cuadrícula con foto, nombre y precio.
- Incluir una barra de búsqueda o filtros por categoría o precio.
- Si hay muchos productos, usar paginación o scroll infinito.
- Mantener la cabecera con el logo y menú principal, y el pie con enlaces de contacto.
`.trim()
  }
];

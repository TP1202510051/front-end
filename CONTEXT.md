# Abstractify

Abstractify is a platform for creating and evolving digital textile stores through visual and conversational interaction while preserving a controlled commerce model.

## People

**Textile entrepreneur**:
The person who creates, manages, and exports a store in Abstractify for a business that sells ready-made garments.
_Avoid_: Customer, shopper, end user

**Shopper**:
The person who browses and purchases garments from a generated store.
_Avoid_: Textile entrepreneur, platform user

## Store design

**Store project**:
The persistent representation of one textile business and its digital store inside Abstractify, owned and edited by one textile entrepreneur without collaborative editing.
_Avoid_: Website, generated code

**Project document**:
The complete, structured composition of a store project at one point in its history, including pages, component instances, theme, bindings, interactions, and asset references.
_Avoid_: JSX, generated code, database catalog

**Canvas**:
The visual workspace where the textile entrepreneur composes and refines the presentation of a store project.
_Avoid_: Preview, generated store

**Store page**:
A routed composition of registered components within a store project; commerce pages are required while content pages may be added by the textile entrepreneur.
_Avoid_: Window, canvas

**Component instance**:
One identified occurrence of a registered component in a project document, with its own properties, styles, bindings, interactions, and named slots.
_Avoid_: DOM element, JSX fragment

**Component slot**:
A named containment role through which a component instance accepts compatible child components.
_Avoid_: Arbitrary child array, DOM position

**Component registry**:
The comprehensive, versioned catalog of verified structural, content, navigation, commerce, form, and state components available within the approved textile-store domain.
_Avoid_: Generated JSX, arbitrary package, first-version subset

**Project block**:
A reusable, versioned composition of registered components owned by one store project; an instance may remain linked to the block or be explicitly detached.
_Avoid_: Custom code, global template

**Theme**:
The project-wide visual language whose values are inherited by pages and component instances and may be overridden through validated styles.
_Avoid_: Abstractify application theme, template

**Catalog binding**:
A declarative connection between a component instance and products, categories, collections, search results, or current commerce context.
_Avoid_: Embedded product copy, SQL query, script

**Project asset**:
Verified media owned by the textile entrepreneur and referenced by a store project through a stable identity.
_Avoid_: Arbitrary external URL, local file path

## Change and history

**Project operation**:
A validated semantic modification to a store project, regardless of whether it originated from the canvas, text, or voice.
_Avoid_: DOM mutation, source-code edit

**Operation batch**:
An atomic collection of project operations representing one complete user intention.
_Avoid_: Partial proposal, keystroke history

**Pending operation**:
A semantic manual modification retained locally until Abstractify confirms that it belongs to an accepted revision.
_Avoid_: Assistant proposal, unsaved canvas

**Assistant proposal**:
An atomic candidate operation batch derived from a spoken or written instruction that has not changed the accepted store project.
_Avoid_: Applied change, generated code

**Accepted revision**:
An immutable project document created after a valid manual operation batch, accepted assistant proposal, import, or migration.
_Avoid_: Draft, preview, mutable snapshot

**Project migration**:
A validated transformation that creates a new accepted revision compatible with newer project or component-registry rules while preserving historical revisions.
_Avoid_: In-place rewrite, automatic downgrade

**Validation level**:
The verified usability reached by an accepted revision: editable, previewable, or exportable.
_Avoid_: Draft status, publication state

**Voice instruction**:
An editable transcription of spoken input that enters the same assistant flow as a written instruction.
_Avoid_: Voice command execution, audio operation

## Commerce and export

**Ready-made inventory**:
A finite set of completed garments available for immediate sale; it excludes manufacturing and made-to-order production.
_Avoid_: Production plan, raw materials

**Textile product**:
A garment offered by a store with shared commercial identity, description, presentation, and pricing.
_Avoid_: Sellable variant, component

**Sellable variant**:
A purchasable form of a textile product identified by its commercial attributes, such as size and color, and its own SKU and stock.
_Avoid_: Size, textile product

**Verified template**:
An approved, versioned full-stack store foundation whose expected behavior, build, tests, and reproducibility have been established before it is offered to textile entrepreneurs.
_Avoid_: Assistant proposal, visual theme

**Generated store**:
The independent digital commerce application produced from one exportable accepted revision and a frozen catalog snapshot.
_Avoid_: Canvas, preview

**Store administration**:
The private area of a generated store where its textile entrepreneur manages products, sellable variants, inventory, and order status after deployment.
_Avoid_: Abstractify canvas, storefront

**Payment gateway**:
Mercado Pago as the verified payment service configured independently for each generated store.
_Avoid_: Yape, Plin, simulated payment

**Store export**:
The self-contained, reproducible deliverable generated from explicitly frozen project, registry, template, catalog, and generator identities.
_Avoid_: Source snippet, preview, latest project state

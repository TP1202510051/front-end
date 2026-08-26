# Structured project document as the canonical store state

Abstractify will represent each accepted store state as an immutable, versioned project document composed only from verified registry components, typed content and catalog bindings, scoped parsed CSS, declarative interactions, and owned asset references. Catalog and transactional commerce data remain relational; manual edits and accepted assistant proposals use the same atomic operation vocabulary; JSX, JavaScript, runtime code, and legacy snapshots are never canonical state. This choice preserves unrestricted composition and styling within the approved textile-commerce domain while making validation, history, preview, migration, and deterministic full-stack export reproducible.

## Considered Options

- Arbitrary JSX snapshots were rejected because they combine data and executable code, cannot be validated semantically, and currently diverge between editor, persistence, and export.
- Fully normalized visual-node tables were rejected because they make the evolving visual document expensive to reconstruct and migrate without improving commerce ownership.
- A structured project document plus separate relational commerce data was selected because it keeps one portable design aggregate while preserving strong catalog, inventory, order, and payment invariants.

## Consequences

- The component registry must comprehensively cover the approved textile-store domain and remain immutable per published version.
- Free CSS is parsed into a scoped canonical representation; arbitrary JavaScript, HTML, packages, and external imports remain prohibited.
- Every accepted change stores a complete canonical document, its atomic operation batch, lineage, versions, actor, and reproducible hash.
- Concurrent operations from the single owner reapply automatically at node/property granularity; a missing structural target is reported and never silently recreated.
- The exporter pins the accepted revision, registry, verified template, catalog snapshot, assets, and generator so equal frozen inputs yield equal artifacts.
- Existing disposable JSX data is not preserved; useful designs are rebuilt from verified components before operational migration begins.

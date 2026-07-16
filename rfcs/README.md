# RFCs (Request for Comments)

RFCs are how we propose and discuss significant changes to react-table-craft.

## When is an RFC required?

- New public components or hooks
- Changes to the config system or plugin API
- New feature flags
- Breaking changes to existing APIs
- Architectural changes

## When is an RFC NOT required?

- Bug fixes
- Documentation improvements
- Internal refactors that don't change the public API
- Adding tests
- Small, self-contained features (e.g., a new translation key)

## Process

1. **Draft** — Copy `_template.md` to `rfcs/NNNN-feature-name.md` and fill it in
2. **PR** — Open a pull request titled `rfc: [short title]`
3. **Review** — The community and maintainers discuss the RFC in the PR
4. **Decision** — A maintainer accepts, requests changes, or rejects the RFC
5. **Implementation** — Once accepted, the RFC can be implemented (by the author or anyone)

## File naming

Use sequential numbering: `0001-feature-name.md`, `0002-another-feature.md`, etc.

## Implemented RFCs

- [0001-array-serialization.md](./0001-array-serialization.md) — configurable filter serialization
- [0002-responsive-toolbar.md](./0002-responsive-toolbar.md)
- [0003-searchable-select.md](./0003-searchable-select.md)
- [0004-async-searchable-select.md](./0004-async-searchable-select.md)
- [0005-render-card.md](./0005-render-card.md) — retroactive doc for renderCard/cardHidden/gridClassName/defaultViewMode (v0.1.12–0.1.13)

# Manual accessibility checklist

The automated gate (`docs/release-gate.md`) runs axe and a keyboard journey. This is the part it cannot run: a person walks the routes below in Chrome and Edge at 360 and 1440 px and records what they find. A finding blocks the release only when it makes a critical journey impossible or materially defective; anything else is recorded as a limitation.

Routes evaluated: `/login`, `/dashboard`, `/design-interface/:id/:name` (canvas, pages, theme, assistant, catalogue, readiness, history). Claims are limited to these routes.

| Check | What to look for | `/dashboard` | canvas |
| --- | --- | --- | --- |
| Visible focus | Every control shows where the focus is when reached by Tab; nothing focusable is invisible | | |
| Restored focus | Closing a dialog returns the focus to what opened it; saving keeps the focus on the field | | |
| Names and roles | Buttons say what they do; regions and status lines have names a screen reader reads out | | |
| Labels | Every field has a label, not only a placeholder | | |
| Contrast | Text and controls are readable on their background, including disabled and error states | | |
| Errors | A rejected action is announced as an alert and says what to do next, without server text | | |
| Progress | Long operations announce their progress and their end; the canvas stays usable meanwhile | | |
| Reflow at 360 px | No content or control is cut off or needs horizontal scrolling | | |
| Zoom 200 % | Same as reflow at 200 % browser zoom at 1440 px | | |

Record per cell: `OK`, `LIMITATION: <what>` or `BLOCKS: <what>`, with the browser and width. Who ran it, when, and on which commit go into the release evidence.

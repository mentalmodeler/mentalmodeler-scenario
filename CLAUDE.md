# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Mental Modeler's "Scenario" app: a browser tool for building Fuzzy Cognitive Maps (FCMs) and
running what-if scenario simulations against them. It's a pre-ES6-module, RequireJS + Backbone
single-page app (no bundler-based dev server, no build step required to run it locally).

There is no test suite and no linter configured in this repo — don't invent CI/lint commands that
don't exist.

## Running it locally

This app loads files (`.mmp` scenario files, the RequireJS module graph) via XHR, so it must be
served over HTTP, not opened as a `file://` URL. Serve the repo root with any static file server,
e.g.:

```
npx http-server -p 8080
```

then open `http://localhost:8080/index.html`.

## Build commands (Grunt)

```
npm install
grunt dist        # compiles sass (compass), requirejs-bundles scripts, copies libs/ into dist/
grunt distNoCss    # same, but skips the compass/sass step
grunt scss         # watches sass/*.scss and recompiles on change (requires compass/ruby)
```

- `grunt dist`/`distNoCss` concatenate+optimize `scripts/main.js` and its RequireJS deps (via
  `grunt-contrib-requirejs`, almond-wrapped) into `dist/scripts/mentalmodeler.js`, and copy
  `libs/` into `dist/`.
- The `compass` task needs a Ruby/Compass toolchain on PATH; it is not installed via npm.

## Architecture

### Two interchangeable concept-map editors behind one flag

The "modeling" surface (the actual node/edge graph editor) is NOT implemented in this repo. It is
one of two pluggable backends, selected by the global `window.MentalModelerUseFlash`:

- **Flash** (legacy): an embedded `swf/mentalmodeler.swf` object/embed, driven via
  `flash.doSave()` / `flash.doLoad(xml)`. Data interchange is XML.
- **JS concept mapper** (current): a separately-built app (the `mentalmodeler-js` project)
  exposed as the global `window.MentalModelerConceptMap` with `.render(el)`, `.save()`,
  `.load(json)`. Data interchange is JSON.

`scripts/views/modeling.js` is the integration seam — it branches on `MentalModelerUseFlash` for
every read/write/reload of the model. `index.html` loads the JS concept mapper two ways:
- normally from `libs/conceptmap/js/main.js` (a vendored/committed build), or
- from `https://mentalmodeler.github.io/mentalmodeler-js/...` when the URL has a `?gitmm` query
  param — used to test against the latest `mentalmodeler-js` build straight from GitHub Pages
  without re-vendoring `libs/conceptmap`.

When changing anything that touches model load/save, check both branches — it's easy to fix one
backend's path and silently leave the other broken.

### RequireJS/Backbone MVC layout

- `scripts/main.js` → `scripts/routes/app.js` (single catch-all route) → `AppModel`/`AppView`.
- `scripts/models/*`, `scripts/views/*`, `scripts/util/*` are plain AMD modules (`define([...], fn)`),
  one class per file, following a `Backbone.Model.extend(...)` / `Backbone.View.extend(...)` pattern
  via `models/abstract.js` / `views/abstract.js` base classes (which add a `log()` helper gated by a
  per-class `doLog` flag — most are `false`; flip it on when debugging a specific model/view rather
  than enabling global logging).
- Global app state lives on `window.mentalmodeler.appModel` (an `AppModel` singleton) and is reached
  from views/models directly rather than passed down — e.g. `appModel.curModel`, `appModel.curSection`,
  `appModel.curSelection`/`curSelectionType` ('scenario' | 'mmp').
- Cross-component communication is mostly global pub/sub via `Backbone.trigger`/`Backbone.on`
  (e.g. `'mmp:add'`, `'scenario:add'`, `'selection:change'`, `'section:pre-change'`), not direct
  method calls between views.
- `scripts/require-config.js` maps bare module ids (`jquery`, `backbone`, `d3`, `dagre`, `math`,
  `papaparse`, `x2js`, `tableExport`, ...) to vendored files under `vendor/`. There is no package
  manager-managed JS dependency tree — add new third-party JS by vendoring it under `vendor/` and
  registering a path here.

### Data model hierarchy

`MmpModel` (one loaded `.mmp` project) owns:
- `infoModel` (metadata: id/name/version/date/author)
- `groupModel` (named concept groups, `groupNames`)
- `conceptCollection` of `ConceptModel` (nodes; each has `relationships` to other concept ids with
  an influence weight/sign)
- `scenarioCollection` of `ScenarioModel` (a what-if scenario = a parallel, lighter-weight
  `ScenarioConceptModel` collection holding `selected`/`influence`/`actualState` overrides per
  concept, used to clamp values during simulation)

A project round-trips as either XML (`.mmp` file, legacy Flash-era format, built/parsed via
`util/xmlUtils.js` + the `x2js` vendored lib) or JSON (current JS-mapper format). `MmpModel` can
construct itself from either (`setData`, `getXML`/`getModelingXML`, `toJSON`/`getModelingJSON`),
and `determineFileType` in `models/app.js` sniffs which one a loaded file is by whether it starts
with `<`. Sample `.mmp`/`.emp` files live in `mmp/`.

`getXML(removeCoordinates)` on `MmpModel` supports a "compare ref" export (`<compareref/>` marker)
that strips display (x/y) coordinates — used for diffing/comparing models without layout noise;
`AppModel.readFiles` explicitly refuses to load a file containing `<compareref/>` back in as a
normal model.

### Scenario simulation math

`scripts/models/scenarioGraph.js` is the actual FCM solver: it repeatedly multiplies the current
concept-state vector by the influence-weight matrix (via the vendored `mathjs`, aliased as `math`)
through a squashing function (`bivalent`/`trivalent`/`sigmoid`/`tanh`, selectable per model) until
the vector converges (delta < 1e-5), with any concepts that have a nonzero scenario "clamp" value
held fixed each iteration. The scenario view compares the unclamped steady state against the
clamped (scenario) steady state to report which concepts moved and by how much — that diff is the
actual output of "running a scenario."

### CSV import

`AppModel.importCSV` (in `models/app.js`) turns a Papa Parse'd adjacency-matrix CSV directly into
an `.mmp`-shaped JSON model, auto-laying out node positions with `dagre` before handing off to the
normal `addModel` path.

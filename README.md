# Minnesota Traffic Observatory

Static site (index.html, style.css, script.js, assets/). No build step; deploys from `main` at https://umn-cse-mto.github.io/.

Image sources: hero by Eastman Childs / Unsplash; portraits from official UMN CTS profiles.

Pages: index, projects, team, publications, news, join, people/*. The header is duplicated in each page; edit all of them when changing nav. `<!-- TODO(stern) -->` marks content scraped from stern.cege.umn.edu that still needs confirming.
- Publications: edit `data/pubs.json`, then run `python3 tools/build_pubs.py` (rewrites the list between the PUBS markers in publications.html).
- Scripts: `filter.js` (chip filters on Projects/Team), `pubs.js` (publication search), `projects.js` (featured image toggle), `demo.js` (homepage ring-road simulation).

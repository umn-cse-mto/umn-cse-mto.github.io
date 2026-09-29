"""Rebuild the publication list in publications.html from data/pubs.json.

Usage: python3 tools/build_pubs.py
Each entry: id, y (year), g (Choi|Stern|Joint), type (journal|conference), t (title, HTML ok),
a (authors, HTML ok; <b> marks co-directors), v (venue, HTML ok), press (bool), topics [..],
doi / arxiv / code (URLs or ""), abs (plain-text abstract or ""), bib (BibTeX or "").
"""
import html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
pubs = json.loads((ROOT / "data/pubs.json").read_text())
page = ROOT / "publications.html"

def item(p):
    groups = {"Joint": "choi stern joint"}.get(p["g"], p["g"].lower())
    label = "JOINT · CHOI &amp; STERN" if p["g"] == "Joint" else p["g"].upper() + " GROUP"
    search = re.sub(r"<[^>]+>", "", " ".join([p["t"], p["a"], p["v"], *p["topics"]])).lower()
    url = p["doi"] or p["arxiv"]
    title = f'<a href="{url}">{p["t"]}</a>' if url else p["t"]
    links = "".join(f'<a href="{u}">{n} ↗</a>' for n, u in (("Paper", url), ("Code", p["code"])) if u)
    extra = ""
    if p["abs"]:
        extra += f'<details><summary>Abstract</summary><p>{html.escape(p["abs"])}</p></details>'
    if p["bib"]:
        extra += f'<details><summary>Cite</summary><pre>{html.escape(p["bib"])}</pre><button type="button" class="copy">Copy BibTeX</button></details>'
    tags = "".join(f"<span>{t}</span>" for t in p["topics"])
    return (f'<li data-year="{p["y"]}" data-group="{groups}" data-type="{p["type"]}" '
            f'data-topics="{"|".join(p["topics"]).lower()}" data-search="{html.escape(search)}">'
            f'<span class="t">{title}</span><span class="m">{p["a"]} · {p["v"]}{" (in press)" if p["press"] else ""}</span>'
            f'<div class="ptags"><span class="grp">{label}</span>{tags}</div><div class="pacts">{links}{extra}</div></li>')

years = sorted({p["y"] for p in pubs}, reverse=True)
order = {"Joint": 0, "Choi": 1, "Stern": 2}
body = "".join(
    f'\n<section class="pub-year"><h2>{y}</h2><ul class="pubs">'
    + "".join("\n" + item(p) for p in sorted((p for p in pubs if p["y"] == y), key=lambda p: order[p["g"]]))
    + "</ul></section>" for y in years)
topics = sorted({t for p in pubs for t in p["topics"]})
opts = lambda xs: "".join(f'<option value="{str(x).lower()}">{x}</option>' for x in xs)
filters = (f'<form class="filters" hidden role="search" aria-label="Filter publications">'
           f'<input type="search" name="q" placeholder="Search title, author, venue…" aria-label="Search publications">'
           f'<select name="year" aria-label="Year"><option value="">All years</option>{opts(years)}</select>'
           f'<select name="group" aria-label="Group"><option value="">All groups</option>{opts(["Choi", "Stern", "Joint"])}</select>'
           f'<select name="type" aria-label="Type"><option value="">Journal &amp; conference</option>{opts(["Journal", "Conference"])}</select>'
           f'<select name="topic" aria-label="Topic"><option value="">All topics</option>{opts(topics)}</select>'
           f'<p class="count" aria-live="polite"></p><button type="reset">Clear filters</button></form>')

s = page.read_text()
s, n = re.subn(r"<!-- PUBS:START -->.*<!-- PUBS:END -->",
               lambda m: f"<!-- PUBS:START -->{filters}{body}\n<!-- PUBS:END -->", s, flags=re.S)
assert n == 1, "markers not found in publications.html"
page.write_text(s)
print(f"{len(pubs)} publications written")

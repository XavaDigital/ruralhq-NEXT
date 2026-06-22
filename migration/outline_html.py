#!/usr/bin/env python3
"""Print an indented tag+class skeleton of an HTML file's body, to reverse-
engineer a template's structure. Skips noise (script/style/svg/etc.).

Usage: python migration/outline_html.py file.html [startline] [endline]
"""
import sys
from html.parser import HTMLParser

PATH = sys.argv[1]
LO = int(sys.argv[2]) if len(sys.argv) > 2 else 0
HI = int(sys.argv[3]) if len(sys.argv) > 3 else 10**9
SKIP = {"script", "style", "svg", "path", "noscript", "link", "meta",
        "source", "picture", "br", "input", "use", "defs", "g", "circle",
        "rect", "line", "polyline", "polygon", "head"}
SHOW = {"div", "section", "main", "article", "header", "footer", "nav",
        "ul", "ol", "li", "a", "button", "img", "iframe", "form", "span",
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "figure", "label"}


class Outline(HTMLParser):
    def __init__(self):
        super().__init__()
        self.depth = 0
        self.skip_depth = None

    def handle_starttag(self, tag, attrs):
        if self.skip_depth is not None:
            return
        if tag in SKIP:
            self.skip_depth = self.depth
            return
        ln = self.getpos()[0]
        d = dict(attrs)
        cls = d.get("class", "")
        if tag in SHOW and LO <= ln <= HI:
            label = f"{tag}.{cls.replace(' ', '.')}" if cls else tag
            print(f"{ln:>5} {'  ' * self.depth}{label[:110]}")
        self.depth += 1

    def handle_endtag(self, tag):
        if self.skip_depth is not None:
            if tag in SKIP and self.depth == self.skip_depth:
                self.skip_depth = None
            return
        self.depth = max(0, self.depth - 1)


Outline().feed(open(PATH, encoding="utf-8", errors="replace").read())

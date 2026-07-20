#!/usr/bin/env python3
"""
scripts/serve.py — a local SEARCH WINDOW for Halo (browser UI, stdlib only).

Run it, open the printed URL, and type questions — it answers using the SAME
query engine as the CLI (scripts/query/ask.py), over your live datasets.

  python scripts/serve.py           # then open http://localhost:8000
  python scripts/serve.py 8080      # custom port

No install needed. Re-run the pipeline any time; the page reads fresh data on
each search.
"""
from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from scripts.query.ask import answer, load_index  # noqa: E402

ENTITY_LABEL = {"area": "areas", "service": "services", "news_event": "news",
                "trip_spot": "trip spots", "history_doc": "history"}

PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Halo Vadodara — Search</title>
<style>
 :root{--paper:#F8F2E7;--paper2:#EBE0CD;--ink:#2A1E11;--soft:#6E5A40;
       --maroon:#7A2E22;--terra:#C2531F;--gold:#BE9A4E;--sand:#CBB488}
 *{box-sizing:border-box}
 body{margin:0;background:var(--paper);color:var(--ink);
      font-family:Georgia,'Times New Roman',serif;line-height:1.5}
 .wrap{max-width:820px;margin:0 auto;padding:28px 18px 80px}
 h1{font-size:30px;color:var(--maroon);margin:0 0 2px}
 h1 .ae{color:var(--terra);font-style:italic}
 .sub{color:var(--soft);margin:0 0 18px;font-size:14px}
 .stats{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
 .pill{background:var(--paper2);border:1px solid var(--sand);border-radius:20px;
       padding:5px 12px;font-size:13px;color:var(--soft)}
 .pill b{color:var(--maroon)}
 form{display:flex;gap:8px;margin-bottom:12px}
 input{flex:1;padding:13px 15px;font-size:16px;border:2px solid var(--sand);
       border-radius:10px;background:#fff;color:var(--ink);font-family:inherit}
 input:focus{outline:none;border-color:var(--terra)}
 button{padding:0 20px;font-size:16px;background:var(--terra);color:#fff;border:0;
        border-radius:10px;cursor:pointer;font-family:inherit}
 button:hover{background:var(--maroon)}
 .chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
 .chip{background:#fff;border:1px solid var(--sand);border-radius:16px;padding:6px 12px;
       font-size:13px;cursor:pointer;color:var(--soft)}
 .chip:hover{border-color:var(--terra);color:var(--terra)}
 #out{background:#fff;border:1px solid var(--sand);border-radius:12px;padding:20px 22px;
      min-height:120px;white-space:normal}
 #out h1{font-size:22px;margin:14px 0 6px}
 #out h2{font-size:17px;color:var(--maroon);margin:16px 0 6px}
 #out a{color:var(--terra)}
 #out ul{margin:6px 0;padding-left:20px}
 #out .muted{color:var(--soft);font-size:13px}
 .loading{color:var(--soft);font-style:italic}
 @media(prefers-color-scheme:dark){
   :root{--paper:#1c1712;--paper2:#2a2119;--ink:#f0e6d6;--soft:#b3a184;--sand:#5a4a35}
   input,button,#out,.chip{background:#221b14}
   button{background:var(--terra);color:#fff}
 }
</style></head><body><div class="wrap">
 <h1><span class="ae">ae</span> halo — Vadodara Search</h1>
 <p class="sub">Ask anything about Vadodara. Runs on your live scraped data.</p>
 <div class="stats" id="stats"></div>
 <form id="f"><input id="q" placeholder="e.g. tell me about Gotri" autofocus autocomplete="off">
   <button>Search</button></form>
 <div class="chips" id="chips"></div>
 <div id="out"><span class="muted">Type a question or tap an example above.</span></div>
</div>
<script>
const EX=["tell me about Gotri","food in Karelibaug","hospitals in Manjalpur",
 "areas near Alkapuri","peaceful picnic within 30 km","history of Vadodara and the Gaekwad dynasty",
 "what happened in Vadodara","temples to visit nearby"];
const chips=document.getElementById('chips');
EX.forEach(t=>{const c=document.createElement('span');c.className='chip';c.textContent=t;
  c.onclick=()=>{document.getElementById('q').value=t;run();};chips.appendChild(c);});
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function md(t){ // tiny markdown -> html
  t=esc(t);
  t=t.replace(/\\[([^\\]]+)\\]\\((https?:[^)]+)\\)/g,'<a href="$2" target="_blank">$1</a>');
  t=t.replace(/(^|[^"=])(https?:\\/\\/[^\\s<)]+)/g,'$1<a href="$2" target="_blank">$2</a>');
  t=t.replace(/^###?\\s?#\\s(.+)$/gm,'<h1>$1</h1>');
  t=t.replace(/^##\\s(.+)$/gm,'<h2>$1</h2>');
  t=t.replace(/^#\\s(.+)$/gm,'<h1>$1</h1>');
  t=t.replace(/\\*\\*([^*]+)\\*\\*/g,'<b>$1</b>');
  t=t.replace(/_([^_]+)_/g,'<i>$1</i>');
  t=t.replace(/^\\s*[-•]\\s(.+)$/gm,'<li>$1</li>');
  t=t.replace(/(<li>[\\s\\S]*?<\\/li>)/g,m=>'<ul>'+m+'</ul>');
  t=t.replace(/\\n{2,}/g,'<br><br>').replace(/\\n/g,'<br>');
  return t;
}
async function run(){
  const q=document.getElementById('q').value.trim();if(!q)return;
  const out=document.getElementById('out');out.innerHTML='<span class="loading">searching…</span>';
  try{const r=await fetch('/api?q='+encodeURIComponent(q));const j=await r.json();
    out.innerHTML=md(j.answer||'(no answer)');}
  catch(e){out.textContent='Error: '+e;}
}
document.getElementById('f').onsubmit=e=>{e.preventDefault();run();};
fetch('/stats').then(r=>r.json()).then(s=>{
  document.getElementById('stats').innerHTML=Object.entries(s)
    .map(([k,v])=>`<span class="pill"><b>${v}</b> ${k}</span>`).join('');
});
</script></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body.encode("utf-8") if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            return self._send(200, PAGE)
        if parsed.path == "/stats":
            try:
                docs = load_index()["docs"]
                counts: dict[str, int] = {}
                for k in docs:
                    lbl = ENTITY_LABEL.get(k.split(":", 1)[0], "other")
                    counts[lbl] = counts.get(lbl, 0) + 1
            except Exception:  # noqa: BLE001
                counts = {}
            return self._send(200, json.dumps(counts), "application/json")
        if parsed.path == "/api":
            q = parse_qs(parsed.query).get("q", [""])[0]
            try:
                ans = answer(q, load_index()) if q else "Type a question."
            except SystemExit as e:
                ans = str(e)
            except Exception as e:  # noqa: BLE001
                ans = f"Error: {e}"
            return self._send(200, json.dumps({"answer": ans}), "application/json")
        self._send(404, "not found")

    def log_message(self, *args):   # quiet console
        pass


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"\n  🔎  Halo search window running →  http://localhost:{port}\n"
          f"      (open that in your browser; Ctrl-C to stop)\n")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n  stopped.")


if __name__ == "__main__":
    main()

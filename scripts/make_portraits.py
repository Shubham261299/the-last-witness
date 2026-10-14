"""Create original static vector portraits with equal framing and treatment."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "frontend/public/portraits"
ROOT.mkdir(parents=True, exist_ok=True)
styles = {
    "alex": ("#ad8b72", "#39363a", '<path fill="#343235" d="M82 86c0-51 96-62 101 4l-7 9-17-30-52 6-18 24z"/><path fill="#4a403b" d="m119 158 27-1 8 10h-42z"/>'),
    "maya": ("#c0a48d", "#28282e", '<path fill="#252529" d="M76 123c-9-82 111-103 115-17l1 67-15-20-5-66c-10 17-30 29-75 29l-4 66-21 4z"/><path fill="#252529" d="M88 118c-2-54 89-71 94-13l-6 8-22-38-38 19z"/>'),
    "daniel": ("#b59b83", "#414048", '<path fill="#34343a" d="M80 101 82 77l15-19 18 5 16-13 16 8 20-1 16 21 4 32-14-12-7-17-63 4-12 28z"/><path fill="#63534b" fill-opacity=".7" d="m96 155 18 22 36 2 22-25-12 34-21 12-30-12z"/>'),
}
for name, (skin, jacket, hair) in styles.items():
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="280" height="310" viewBox="0 0 280 310">
<defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#343136"/><stop offset="1" stop-color="#17181c"/></linearGradient><linearGradient id="face" x2="1" y2="0"><stop stop-color="{skin}"/><stop offset="1" stop-color="#8e7868"/></linearGradient><linearGradient id="coat" x2="1" y2="1"><stop stop-color="{jacket}"/><stop offset="1" stop-color="#24252c"/></linearGradient></defs>
<path fill="url(#bg)" d="M0 0h280v310H0z"/><path fill="none" stroke="#827054" stroke-opacity=".2" d="M22 0v310m236-310v310M0 264h280"/>
<ellipse fill="#ad9168" opacity=".06" cx="130" cy="120" rx="120" ry="145"/>
<path fill="url(#coat)" d="m14 310 12-73 54-32 27-8h61l27 9 54 32 17 72z"/><path fill="#897568" d="M111 166h48l7 46-31 28-30-29z"/>
<path fill="url(#face)" d="M87 111c-2-58 91-79 97-11l-8 54-12 29-26 18-27-17-18-32z"/>
<path fill="#937c6a" d="m90 113-9-2-4 12 9 22 9 1m81-35 10-2 6 14-9 25-9-2"/>
{hair}
<path stroke="#483f3c" stroke-width="3" fill="none" d="m101 123 20-3m26 0 20 4"/><path stroke="#303035" stroke-width="2" d="m106 131 10 1m37 0 9-1"/><path stroke="#6d594d" fill="none" stroke-width="1.7" d="m137 132-4 20 10 2m-26 19 18 3 14-3"/>
<path fill="#d0c2ad" d="m104 205 31 27-18 26-24-41m70-12-28 27 17 26 24-41"/><path fill="#37353a" d="m135 233-8 12 9 47 9-47z"/>
<path stroke="#77716c" stroke-opacity=".35" fill="none" d="m76 211-7 45 31-10-15 64m104-98 16 44-30-10 13 64"/><path fill="#17191e" opacity=".14" d="M0 0h280v310H0z"/>
</svg>'''
    (ROOT / f"{name}.svg").write_text(svg + "\n", encoding="utf-8")
print("Created three neutral, equally framed vector portraits.")

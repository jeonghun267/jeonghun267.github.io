"""Export the source as one HTML file with all assets embedded; Python standard library only."""
from pathlib import Path
import base64, json, logging, mimetypes, re, sys
logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
ROOT = Path(__file__).resolve().parent

def build(destination: Path) -> None:
    assets = {}
    for path in sorted((ROOT / 'assets').rglob('*')):
        if path.is_file() and path.suffix in {'.png', '.webp', '.svg'}:
            media = mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
            assets[path.relative_to(ROOT).as_posix()] = 'data:' + media + ';base64,' + base64.b64encode(path.read_bytes()).decode('ascii')
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    css = (ROOT / 'styles.css').read_text(encoding='utf-8')
    html = html.replace('<link rel="stylesheet" href="styles.css">', '<style>\n' + css + '\n</style>')
    html = re.sub(r'\s*<script defer src="(?:config|app)\.js"></script>', '', html)
    html = re.sub(r'(src|href)="(assets/[^\"]+)"', lambda match: match.group(1) + '="' + assets.get(match.group(2), match.group(2)) + '"', html)
    scripts = '\n<script>window.__OJH_ASSETS=' + json.dumps(assets, ensure_ascii=False) + ';</script>\n'
    for name in ['config.js', 'app.js']:
        js = (ROOT / name).read_text(encoding='utf-8').replace('</script', '<\\/script')
        scripts += '<script>\n' + js + '\n</script>\n'
    html = html.replace('</body>', scripts + '</body>')
    destination.write_text(html, encoding='utf-8')
    logging.info('Wrote %s (%.2f MiB)', destination, destination.stat().st_size / 1048576)

if __name__ == '__main__':
    try:
        destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / 'OJH_Interactive_Portfolio.html'
        build(destination)
    except Exception:
        logging.exception('Standalone export failed')
        raise SystemExit(1)

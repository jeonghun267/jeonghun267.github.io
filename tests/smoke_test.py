"""Browser tests for the self-contained build. No external navigation or internet required.
Usage: python tests/smoke_test.py /path/to/OJH_Interactive_Portfolio.html
Requires Playwright and a Chromium executable. This test does not claim real-device testing.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, logging, sys, os
ROOT = Path(__file__).resolve().parents[1]
BUILD = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/mnt/data/OJH_Interactive_Portfolio.html')
logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
report = {'method': 'Chromium DOM rendering of complete standalone HTML using set_content; browser navigation to localhost and file URLs is restricted in this environment.', 'checks': [], 'viewports': [], 'errors': []}

def record(name, passed, detail=''):
    report['checks'].append({'name': name, 'passed': bool(passed), 'detail': detail})
    logging.info('%s %s %s', 'PASS' if passed else 'FAIL', name, detail)

try:
    html = BUILD.read_text(encoding='utf-8')
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.getenv('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
        page = browser.new_page(viewport={'width':1536,'height':1024}, device_scale_factor=1)
        page.on('pageerror', lambda error: report['errors'].append(str(error)))
        page.on('console', lambda msg: report['errors'].append(msg.text) if msg.type == 'error' else None)
        page.set_content(html, wait_until='load')
        page.wait_for_timeout(180)
        record('Initial project cards', page.locator('.project-card').count() == 5)
        for value, expected in [('unity',3),('ai',1),('quant',1),('web',2),('creative',3),('all',5)]:
            page.locator(f'.filter[data-filter="{value}"]').click()
            record('Filter '+value, page.locator('.project-card').count() == expected, str(page.locator('.project-card').count()))
        page.evaluate('window.scrollTo(0,0)')
        page.locator('.planet-unity').click()
        page.wait_for_timeout(550)
        record('Planet opens category', page.locator('.project-card').count() == 3 and page.locator('.filter[data-filter="unity"]').get_attribute('aria-pressed') == 'true')
        record('Planet scrolls to work', page.evaluate('scrollY > 150'))
        page.locator('[data-project-id="aac"]').click()
        dialog = page.locator('#project-dialog')
        record('Project dialog opens', dialog.is_visible() and page.locator('#dialog-title').inner_text() == 'Unity AAC')
        record('Real Notion target', page.locator('#dialog-notion').get_attribute('href') == 'https://app.notion.com/p/3678e7bb5770836ebaa8811cda4984c2')
        record('Modal notes and tags', page.locator('#dialog-points li').count() == 3 and page.locator('#dialog-tags span').count() == 3)
        record('Modal initial focus', page.evaluate('document.activeElement.id') == 'dialog-close')
        page.keyboard.press('Shift+Tab')
        record('Modal keyboard focus wrap', page.evaluate('document.activeElement.id') == 'dialog-notion')
        page.screenshot(path=str(ROOT/'tests/project-dialog.png'))
        page.keyboard.press('Escape')
        record('Escape closes dialog and restores focus', not dialog.is_visible() and page.evaluate('document.activeElement.dataset.projectId') == 'aac')
        page.locator('[data-project-id="aac"]').click(); page.locator('#dialog-close').click()
        record('Close button', not dialog.is_visible())
        page.locator('[data-project-id="aac"]').click(); page.mouse.click(5,5)
        record('Backdrop closes dialog', not dialog.is_visible())
        page.locator('.filter[data-filter="all"]').click()
        page.locator('#copy-email').click(); page.wait_for_timeout(150)
        toast = page.locator('#toast').inner_text()
        record('Copy feedback', '복사' in toast, toast)
        record('Email mailto link', page.locator('.email-link').get_attribute('href') == 'mailto:popmin07@gmail.com')
        page.evaluate('window.scrollTo(0,0)'); page.wait_for_timeout(80)
        page.locator('#motion-toggle').click()
        record('Motion pause', page.locator('#motion-toggle').get_attribute('aria-pressed') == 'false')
        time_a = page.locator('#orbit-canvas').evaluate('(el)=>el.toDataURL()'); page.wait_for_timeout(160)
        time_b = page.locator('#orbit-canvas').evaluate('(el)=>el.toDataURL()')
        record('Paused canvas is static', time_a == time_b)
        page.locator('#motion-toggle').click(); page.wait_for_timeout(150)
        time_a = page.locator('#orbit-canvas').evaluate('(el)=>el.toDataURL()'); page.wait_for_timeout(200)
        time_b = page.locator('#orbit-canvas').evaluate('(el)=>el.toDataURL()')
        record('Motion restarts', time_a != time_b)
        widths=[320,360,390,430,600,768,820,1024,1280,1440,1536,1920]
        for width in widths:
            page.set_viewport_size({'width':width,'height':844 if width<700 else 1024})
            page.evaluate('window.scrollTo(0,0)'); page.wait_for_timeout(70)
            dimensions = page.evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})')
            passed=dimensions['scrollWidth'] <= width
            report['viewports'].append({**dimensions,'noHorizontalOverflow':passed})
            record('No overflow '+str(width),passed,json.dumps(dimensions))
        page.set_viewport_size({'width':390,'height':844})
        page.evaluate('window.scrollTo(0,0)')
        page.locator('#menu-toggle').click()
        record('Mobile menu opens',page.locator('#main-nav').is_visible() and page.locator('#menu-toggle').get_attribute('aria-expanded')=='true')
        page.locator('#main-nav a[href="#projects"]').click(); page.wait_for_timeout(500)
        record('Mobile menu closes after navigation',not page.locator('#main-nav').is_visible())
        page.locator('[data-project-id="block"]').click()
        record('Mobile project dialog fits',dialog.is_visible() and dialog.bounding_box()['width']<=390)
        page.screenshot(path=str(ROOT/'tests/mobile-project-dialog.png'))
        page.keyboard.press('Escape')
        # Load all art for full-page evidence; normal runtime retains lazy loading.
        page.evaluate("[...document.images].forEach(img=>img.loading='eager')")
        page.wait_for_timeout(150)
        broken=page.evaluate('[...document.images].filter(i=>i.src && (!i.complete || !i.naturalWidth)).map(i=>i.alt)')
        record('All artwork decoded',not broken,str(broken))
        page.emulate_media(reduced_motion='reduce')
        page.wait_for_timeout(80)
        record('OS reduced-motion preference',page.locator('#motion-toggle').get_attribute('aria-pressed')=='false' and page.locator('#motion-toggle').is_disabled())
        record('CSS reduced-motion preference',page.locator('.core-float').evaluate('(el)=>getComputedStyle(el).animationName')=='none')
        page.close()
        # Fresh pages avoid inherited scrolling and produce reproducible final captures.
        for label,width,height in [('desktop',1536,1024),('mobile',390,844),('tablet',820,1180)]:
            shot=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,reduced_motion='reduce')
            shot.set_content(html,wait_until='load')
            shot.evaluate("[...document.images].forEach(img=>img.loading='eager')")
            shot.wait_for_timeout(160)
            shot.screenshot(path=str(ROOT/f'tests/{label}-final.png'))
            shot.screenshot(path=str(ROOT/f'tests/{label}-full-final.png'),full_page=True)
            shot.close()
        browser.close()
    record('No JavaScript / console errors',not report['errors'],str(report['errors']))
except Exception as error:
    logging.exception('Browser test failed')
    report['errors'].append(str(error))
finally:
    report['passed']=all(check['passed'] for check in report['checks']) and not report['errors']
    (ROOT/'tests/test-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    logging.info('FINAL: %s', 'PASSED' if report['passed'] else 'FAILED')
    if not report['passed']: raise SystemExit(1)

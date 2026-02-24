from playwright.sync_api import sync_playwright
import sys

def capture(url, output_path, viewport_width=1920, viewport_height=1080):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': viewport_width, 'height': viewport_height})
        page.goto(url, wait_until='networkidle')
        page.screenshot(path=output_path, full_page=False)
        browser.close()
        print(f"Screenshot saved to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python capture_screenshot.py <url> <output_path> <width> <height>")
        sys.exit(1)

    url = sys.argv[1]
    output_path = sys.argv[2]
    width = int(sys.argv[3])
    height = int(sys.argv[4])

    capture(url, output_path, width, height)

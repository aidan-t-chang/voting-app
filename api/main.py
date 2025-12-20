from fastapi import FastAPI
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
import asyncio

async def get_menu_html():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Navigate directly to the menu application to avoid iframe issues
        await page.goto("https://menus.campus-dining.com/eliorna/d1654", wait_until="networkidle")

        # Wait for the specific menu element instead of a generic container
        try:
            await page.locator(".k10-menu-selector__panel").wait_for(timeout=10000)
            print("yay found menu selector")
        except Exception as e:
            print(f"Could not find menu selector: {e}")

        meal_periods = ["Breakfast", "Lunch", "Dinner"]
        daily_menus = {}
        visit = set()
        previous_dom_items = set()

        for period in meal_periods:
            
            # open dropdown options 
            await page.click(".k10-menu-selector__panel")

            # wait for options container to become visible
            await asyncio.sleep(0.5)

            # look for specific period option
            period_option = page.locator(f".k10-menu-selector__option >> text={period}")

            if await period_option.count() > 0:
                print(f"the {period} option has been found")
                await period_option.click()
                
                await page.locator(".k10-menu-selector__panel").filter(has_text=period).wait_for()


                elements = []
                current_dom_items = set()

                
                # wait for dom elements to load
                for _ in range(10):
                    await asyncio.sleep(0.5)
                    current_html = await page.content()

                    soup = BeautifulSoup(current_html, "html.parser")
                    elements = soup.find_all("span", class_="k10-recipe__name")
                    current_dom_items = {item.get_text(strip=True) for item in elements}

                    if current_dom_items != previous_dom_items:
                        break
                
                previous_dom_items = current_dom_items

                items = []
                for item in elements:
                    new = item.get_text(strip=True)
                    if new not in visit:
                       items.append(new) 
                       visit.add(new)

                daily_menus[period] = items

                print(f"found {len(items)} items for {period}")
            else:
                print(f"option {period} not found.")
        
        for key in daily_menus:
            print(f"for {key}: {daily_menus[key]}")
        await browser.close()

app = FastAPI()
@app.get("/menu")
async def read_menu():
    html = await get_menu_html()
    
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.text if soup.title else "oopsies"

    return {"page_title": title}
        

html_result = asyncio.run(get_menu_html())